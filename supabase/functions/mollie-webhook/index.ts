import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM = "AutomatPlanet <bestellung@automatplanet.de>";
const ADMIN_EMAIL = "jk@webalarm.de";

const euro = (cents: number) =>
  (cents / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " EUR";

async function sendMail(to: string[], subject: string, html: string) {
  if (!RESEND_API_KEY) return;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!res.ok) console.error(`Resend failed [${res.status}]: ${await res.text()}`);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const mollieKey = Deno.env.get("MOLLIE_API_KEY");
  if (!mollieKey) return new Response("not configured", { status: 500, headers: corsHeaders });

  let paymentId = "";
  try {
    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = await req.json();
      paymentId = String(body.id ?? "");
    } else {
      const form = await req.formData();
      paymentId = String(form.get("id") ?? "");
    }
  } catch (err) {
    console.error("webhook body parse failed", err);
  }

  if (!paymentId) return new Response("missing id", { status: 400, headers: corsHeaders });

  const payRes = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${mollieKey}` },
  });
  if (!payRes.ok) {
    const details = await payRes.text();
    console.error(`Mollie fetch failed [${payRes.status}]: ${details}`);
    return new Response("payment lookup failed", { status: 502, headers: corsHeaders });
  }
  const payment = await payRes.json();
  const orderId = payment.metadata?.orderId as string | undefined;
  if (!orderId) return new Response("no order metadata", { status: 200, headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .single();

  const status = payment.status as string;
  const isPaid = status === "paid";
  const alreadyPaid = order?.status === "paid" || order?.status === "shipped";

  await supabase
    .from("orders")
    .update({
      status: alreadyPaid ? order!.status : status,
      mollie_payment_id: paymentId,
      paid_at: isPaid ? (order?.paid_at ?? new Date().toISOString()) : order?.paid_at ?? null,
    })
    .eq("id", orderId);

  if (isPaid && !alreadyPaid && order) {
    const itemRows = (order.order_items ?? [])
      .map(
        (it: { quantity: number; name: string; variant_label: string; unit_price_net_cents: number }) =>
          `<tr><td style="padding:6px 0">${it.quantity}× ${it.name}${it.variant_label ? ` (${it.variant_label})` : ""}</td><td style="text-align:right">${euro(it.unit_price_net_cents * it.quantity)}</td></tr>`,
      )
      .join("");

    const summary = `
      <table style="width:100%;font-family:Arial,sans-serif;font-size:14px">
        ${itemRows}
        <tr><td style="padding:6px 0">Versand (netto)</td><td style="text-align:right">${euro(order.shipping_net_cents)}</td></tr>
        <tr><td style="padding:6px 0">USt. 19%</td><td style="text-align:right">${euro(order.vat_cents)}</td></tr>
        <tr><td style="padding:10px 0;font-weight:bold;border-top:1px solid #ddd">Gesamt</td><td style="text-align:right;font-weight:bold;border-top:1px solid #ddd">${euro(order.total_gross_cents)}</td></tr>
      </table>`;

    const address = `${order.first_name} ${order.last_name}<br>${order.company ? order.company + "<br>" : ""}${order.street}<br>${order.postal_code} ${order.city}<br>${order.country}`;

    await sendMail(
      [order.email],
      `Bestellbestätigung ${order.order_number}`,
      `<div style="font-family:Arial,sans-serif;font-size:14px;color:#111">
        <h2>Vielen Dank für Ihre Bestellung!</h2>
        <p>Ihre Bestellung <strong>${order.order_number}</strong> ist bei uns eingegangen und wurde bezahlt.</p>
        ${summary}
        <h3>Lieferadresse</h3><p>${address}</p>
        <p>Wir melden uns zeitnah mit den Lieferdetails. Fragen? Telefon 0511 12282957.</p>
      </div>`,
    );

    await sendMail(
      [ADMIN_EMAIL],
      `Neue Bestellung ${order.order_number} – ${euro(order.total_gross_cents)}`,
      `<div style="font-family:Arial,sans-serif;font-size:14px">
        <h2>Neue bezahlte Bestellung</h2>
        <p>${order.order_number} · ${order.email} · ${order.phone}</p>
        ${summary}
        <h3>Adresse</h3><p>${address}</p>
        ${order.note ? `<p><strong>Hinweis:</strong> ${order.note}</p>` : ""}
      </div>`,
    );
  }

  return new Response("ok", { status: 200, headers: corsHeaders });
});
