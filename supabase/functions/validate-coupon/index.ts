// Prueft einen Gutscheincode und liefert den Rabatt zurueck (ohne Bestellung anzulegen).
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { CATALOG, cartShippingNetCents, VAT_RATE } from "../_shared/catalog.ts";
import {
  applyCoupon,
  couponLabel,
  loadCoupon,
  TEST_ORDER_GROSS_CENTS,
} from "../_shared/coupons.ts";

const BodySchema = z.object({
  code: z.string().trim().min(2).max(60),
  subtotalNetCents: z.number().int().min(0).max(100_000_000),
  country: z.string().length(2).optional().default("DE"),
  variantIds: z.array(z.string().max(120)).max(20).optional().default([]),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ valid: false, error: "Ungueltige Anfrage" }, 400);
  const { code, subtotalNetCents, country, variantIds } = parsed.data;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const { coupon, error } = await loadCoupon(supabase, code);
  if (!coupon) return json({ valid: false, error: error ?? "Ungueltiger Code" });

  const slugs = variantIds.map((v) => CATALOG[v]?.slug ?? v);
  const baseShipping = cartShippingNetCents(country, slugs);
  const applied = applyCoupon(coupon, subtotalNetCents, baseShipping);
  if (applied.error) return json({ valid: false, error: applied.error });

  const net = Math.max(subtotalNetCents - applied.discountNetCents + applied.shippingNetCents, 0);
  const gross = coupon.is_test ? TEST_ORDER_GROSS_CENTS : Math.round(net * (1 + VAT_RATE));

  return json({
    valid: true,
    code: coupon.code,
    label: couponLabel(coupon),
    isTest: coupon.is_test,
    freeShipping: coupon.free_shipping,
    discountNetCents: applied.discountNetCents,
    shippingNetCents: applied.shippingNetCents,
    totalGrossCents: gross,
  });
});
