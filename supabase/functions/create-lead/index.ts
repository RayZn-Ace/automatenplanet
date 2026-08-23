// Public lead capture: stores an "Angebot anfordern" request and notifies the team.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const BodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  company: z.string().trim().max(150).optional().default(""),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(3).max(50),
  message: z.string().trim().max(2000).optional().default(""),
  productSlug: z.string().trim().max(120).optional().default(""),
  productName: z.string().trim().max(200).optional().default(""),
  quantity: z.number().int().min(1).max(99).optional().default(1),
  pagePath: z.string().trim().max(300).optional().default(""),
  referrer: z.string().trim().max(500).optional().default(""),
  utmSource: z.string().trim().max(150).optional().default(""),
  utmMedium: z.string().trim().max(150).optional().default(""),
  utmCampaign: z.string().trim().max(200).optional().default(""),
  gclid: z.string().trim().max(300).optional().default(""),
  fbclid: z.string().trim().max(300).optional().default(""),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const NOTIFY_TO = "kontakt@automatenplanet.com";
const NOTIFY_FROM = "Automatenplanet <kontakt@automatenplanet.com>";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
  const d = parsed.data;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      name: d.name,
      company: d.company,
      email: d.email.toLowerCase(),
      phone: d.phone,
      message: d.message,
      product_slug: d.productSlug,
      product_name: d.productName,
      quantity: d.quantity,
      page_path: d.pagePath,
      referrer: d.referrer,
      utm_source: d.utmSource,
      utm_medium: d.utmMedium,
      utm_campaign: d.utmCampaign,
      gclid: d.gclid,
      fbclid: d.fbclid,
    })
    .select("id, created_at")
    .single();

  if (error || !lead) {
    console.error("lead insert failed", error);
    return json({ error: "Anfrage konnte nicht gespeichert werden" }, 500);
  }

  // Benachrichtigung ans Postfach (nicht blockierend für den Nutzer).
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (resendKey) {
    const rows: Array<[string, string]> = [
      ["Produkt", d.productName || d.productSlug || "-"],
      ["Menge", String(d.quantity)],
      ["Name", d.name],
      ["Firma", d.company || "-"],
      ["E-Mail", d.email],
      ["Telefon", d.phone],
      ["Nachricht", d.message || "-"],
      ["Seite", d.pagePath || "-"],
      ["Kampagne", [d.utmSource, d.utmMedium, d.utmCampaign].filter(Boolean).join(" / ") || "-"],
      ["Klick-ID", d.gclid || d.fbclid || "-"],
      ["Referrer", d.referrer || "-"],
    ];
    const html = `<h2>Neue Angebotsanfrage</h2><table cellpadding="6">${rows
      .map(
        ([k, v]) =>
          `<tr><td><strong>${escapeHtml(k)}</strong></td><td>${escapeHtml(v)}</td></tr>`,
      )
      .join("")}</table>`;
    const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: NOTIFY_FROM,
          to: [NOTIFY_TO],
          reply_to: d.email,
          subject: `Neue Anfrage: ${d.productName || "Automat"} - ${d.company || d.name}`,
          html,
          text,
        }),
      });
      if (!res.ok) console.error("lead notification failed", res.status, await res.text());

      // Im Postfach protokollieren, damit die Anfrage im Admin sichtbar ist.
      await supabase.from("mail_messages").insert({
        direction: "inbound",
        from_email: d.email,
        from_name: d.name,
        to_email: [NOTIFY_TO],
        subject: `Neue Anfrage: ${d.productName || "Automat"} - ${d.company || d.name}`,
        text_body: text,
        html_body: html,
        snippet: text.slice(0, 160),
        status: "received",
      });
    } catch (err) {
      console.error("lead notification error", err);
    }
  }

  return json({ ok: true, leadId: lead.id });
});
