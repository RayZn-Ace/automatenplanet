import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { CATALOG, shippingNetCents, VAT_RATE } from "../_shared/catalog.ts";

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
  const { items, customer, origin } = parsed.data;

  // Preise serverseitig auflösen
  const lines = items.map((i) => {
    const entry = CATALOG[i.variantId];
    if (!entry) throw new Error(`Unknown variant ${i.variantId}`);
    return { ...entry, variantId: i.variantId, quantity: i.quantity };
  });

  const subtotalNet = lines.reduce((s, l) => s + l.priceNetCents * l.quantity, 0);
  const shippingNet = shippingNetCents(customer.country);
  const net = subtotalNet + shippingNet;
  const gross = Math.round(net * (1 + VAT_RATE));
  const vat = gross - net;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const orderNumber = `AP-${Date.now().toString(36).toUpperCase()}`;

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
      description: `Bestellung ${order.order_number}`,
      redirectUrl: `${origin}/bestellung?o=${order.id}`,
      webhookUrl,
      metadata: { orderId: order.id, orderNumber: order.order_number },
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

  return json({
    orderId: order.id,
    orderNumber: order.order_number,
    checkoutUrl: payment._links?.checkout?.href,
  });
});
