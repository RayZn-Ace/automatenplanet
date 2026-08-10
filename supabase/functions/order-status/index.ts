import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const BodySchema = z.object({ orderId: z.string().uuid() });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid orderId" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const { data, error } = await supabase
    .from("orders")
    .select(
      "order_number, status, subtotal_net_cents, shipping_net_cents, vat_cents, total_gross_cents, currency, email",
    )
    .eq("id", parsed.data.orderId)
    .single();

  if (error || !data) {
    return new Response(JSON.stringify({ error: "Order not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Fallback: bei noch offener Bestellung direkt bei Mollie nachfragen
  const mollieKey = Deno.env.get("MOLLIE_API_KEY");
  if (mollieKey && ["pending", "open"].includes(data.status)) {
    const { data: full } = await supabase
      .from("orders")
      .select("mollie_payment_id")
      .eq("id", parsed.data.orderId)
      .single();
    if (full?.mollie_payment_id) {
      const res = await fetch(`https://api.mollie.com/v2/payments/${full.mollie_payment_id}`, {
        headers: { Authorization: `Bearer ${mollieKey}` },
      });
      if (res.ok) {
        const payment = await res.json();
        if (payment.status !== data.status) {
          await supabase
            .from("orders")
            .update({
              status: payment.status,
              paid_at: payment.status === "paid" ? new Date().toISOString() : null,
            })
            .eq("id", parsed.data.orderId);
          data.status = payment.status;
        }
      } else {
        console.error(`Mollie lookup failed [${res.status}]: ${await res.text()}`);
      }
    }
  }

  // Positionen für das GA4/GTM purchase-Event
  const { data: items } = await supabase
    .from("order_items")
    .select("slug, name, variant_label, quantity, unit_price_net_cents")
    .eq("order_id", parsed.data.orderId);

  return new Response(JSON.stringify({ order: { ...data, items: items ?? [] } }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
