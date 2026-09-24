import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { CATALOG, cartShippingNetCents, SPARE_PART_SLUGS, VAT_RATE } from "../_shared/catalog.ts";
import { applyCoupon, loadCoupon, TEST_ORDER_GROSS_CENTS } from "../_shared/coupons.ts";

const BodySchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().min(1).max(120),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(20),
  customer: z.object({
    email: z.string().email().max(200),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    company: z.string().min(2).max(150),
    vatId: z.string().max(50).optional().default(""),
    isBusiness: z.literal(true),
    phone: z.string().min(3).max(50),
    street: z.string().min(3).max(200),
    postalCode: z.string().min(2).max(20),
    city: z.string().min(1).max(120),
    country: z.string().length(2),
    note: z.string().max(1000).optional().default(""),
  }),
  couponCode: z.string().trim().max(60).optional().default(""),
  origin: z.string().url().max(300),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const mollieKey = Deno.env.get("MOLLIE_API_KEY");
  if (!mollieKey) return json({ error: "Payment provider not configured" }, 500);

  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
  const { items, customer, couponCode, origin } = parsed.data;

  // Preise serverseitig auflösen
  const lines = items.map((i) => {
    const entry = CATALOG[i.variantId];
    if (!entry) throw new Error(`Unknown variant ${i.variantId}`);
    return { ...entry, variantId: i.variantId, quantity: i.quantity };
  });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  // Ersatzteile: Preis und Aktivstatus aus der Datenbank (Admin-Katalog) pruefen.
  const spareVariantIds = lines.filter((l) => SPARE_PART_SLUGS.has(l.slug)).map((l) => l.variantId);
  if (spareVariantIds.length > 0) {
    const { data: dbVariants, error: dbErr } = await supabase
      .from("product_variants")
      .select("variant_id, price_net_cents, is_active, products!inner(is_active, name)")
      .in("variant_id", spareVariantIds);
    if (dbErr) {
      console.error("spare part lookup failed", dbErr);
      return json({ error: "Produkte konnten nicht geprueft werden" }, 500);
    }
    for (const line of lines) {
      if (!SPARE_PART_SLUGS.has(line.slug)) continue;
      // deno-lint-ignore no-explicit-any
      const row = (dbVariants ?? []).find((r: any) => r.variant_id === line.variantId) as any;
      const prod = Array.isArray(row?.products) ? row.products[0] : row?.products;
      if (!row || !row.is_active || !prod?.is_active) {
        return json({ error: `${line.name} ist aktuell nicht verfuegbar.` }, 400);
      }
      line.priceNetCents = row.price_net_cents;
      if (prod.name) line.name = prod.name;
    }
  }

  const subtotalNet = lines.reduce((s, l) => s + l.priceNetCents * l.quantity, 0);
  let shippingNet = cartShippingNetCents(customer.country, lines.map((l) => l.slug));
  let discountNet = 0;
  let isTest = false;
  let appliedCode = "";

  if (couponCode) {
    const { coupon, error: couponError } = await loadCoupon(supabase, couponCode);
    if (!coupon) return json({ error: couponError ?? "Ungueltiger Gutscheincode" }, 400);
    const applied = applyCoupon(coupon, subtotalNet, shippingNet);
    if (applied.error) return json({ error: applied.error }, 400);
    discountNet = applied.discountNetCents;
    shippingNet = applied.shippingNetCents;
    isTest = coupon.is_test;
    appliedCode = coupon.code;
  }

  const net = Math.max(subtotalNet - discountNet + shippingNet, 0);
  const gross = isTest ? TEST_ORDER_GROSS_CENTS : Math.round(net * (1 + VAT_RATE));
  const vat = isTest ? 0 : gross - net;

  const orderNumber = `${isTest ? "TEST" : "AP"}-${Date.now().toString(36).toUpperCase()}`;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      status: "pending",
      email: customer.email,
      first_name: customer.firstName,
      last_name: customer.lastName,
      company: customer.company,
      vat_id: customer.vatId ?? "",
      phone: customer.phone,
      street: customer.street,
      postal_code: customer.postalCode,
      city: customer.city,
      country: customer.country,
      note: customer.note ?? "",
      subtotal_net_cents: subtotalNet,
      shipping_net_cents: shippingNet,
      vat_cents: vat,
      total_gross_cents: gross,
      currency: "EUR",
      payment_method: "mollie",
      coupon_code: appliedCode,
      discount_net_cents: discountNet,
      is_test: isTest,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    console.error("order insert failed", orderError);
    return json({ error: "Order could not be created" }, 500);
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    lines.map((l) => ({
      order_id: order.id,
      slug: l.slug,
      name: l.name,
      variant_label: l.variantLabel,
      unit_price_net_cents: l.priceNetCents,
      quantity: l.quantity,
    })),
  );
  if (itemsError) console.error("order_items insert failed", itemsError);

  const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/mollie-webhook`;
  const mollieRes = await fetch("https://api.mollie.com/v2/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${mollieKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: { currency: "EUR", value: (gross / 100).toFixed(2) },
      description: isTest
        ? `TESTBESTELLUNG ${order.order_number}`
        : `Bestellung ${order.order_number}`,
      redirectUrl: `${origin}/bestellung?o=${order.id}`,
      webhookUrl,
      metadata: {
        orderId: order.id,
        orderNumber: order.order_number,
        isTest,
        couponCode: appliedCode,
      },
      billingEmail: customer.email,
      locale: customer.country === "DE" ? "de_DE" : undefined,
    }),
  });

  if (!mollieRes.ok) {
    const details = await mollieRes.text();
    console.error(`Mollie payment failed [${mollieRes.status}]: ${details}`);
    await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);
    return json({ error: "Payment could not be started", status: mollieRes.status, details }, mollieRes.status);
  }

  const payment = await mollieRes.json();
  await supabase.from("orders").update({ mollie_payment_id: payment.id }).eq("id", order.id);

  if (appliedCode) {
    const { data: current } = await supabase
      .from("coupons")
      .select("redemptions")
      .ilike("code", appliedCode)
      .maybeSingle();
    await supabase
      .from("coupons")
      .update({ redemptions: ((current?.redemptions as number | undefined) ?? 0) + 1 })
      .ilike("code", appliedCode);
  }

  return json({
    orderId: order.id,
    orderNumber: order.order_number,
    isTest,
    checkoutUrl: payment._links?.checkout?.href,
  });
});
