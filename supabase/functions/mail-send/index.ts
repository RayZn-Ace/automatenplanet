// Sends an email via Resend on behalf of an authenticated admin and logs it.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const parseList = (input: unknown): string[] => {
  if (!input) return [];
  const arr = Array.isArray(input) ? input : String(input).split(/[,;]/);
  return arr
    .map((v) => String(v).trim().toLowerCase())
    .filter(Boolean);
};

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) return json({ error: "RESEND_API_KEY is not configured" }, 500);

    const authClient = createClient(supabaseUrl, anon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await authClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({}));

    const from = String(body.from ?? "").trim().toLowerCase();
    const fromName = body.fromName ? String(body.fromName).slice(0, 120) : "";
    const to = parseList(body.to);
    const cc = parseList(body.cc);
    const subject = String(body.subject ?? "").trim().slice(0, 300);
    const text = String(body.text ?? "").slice(0, 100000);
    const replyToId = body.replyToId ? String(body.replyToId) : null;

    if (!EMAIL_RE.test(from)) return json({ error: "Ungültige Absenderadresse" }, 400);
    if (!from.endsWith("@automatenplanet.com")) {
      return json({ error: "Absender muss auf @automatenplanet.com enden" }, 400);
    }
    if (to.length === 0 || to.some((a) => !EMAIL_RE.test(a))) {
      return json({ error: "Ungültige Empfängeradresse" }, 400);
    }
    if (cc.some((a) => !EMAIL_RE.test(a))) return json({ error: "Ungültige CC-Adresse" }, 400);
    if (to.length + cc.length > 20) return json({ error: "Zu viele Empfänger" }, 400);
    if (!subject) return json({ error: "Betreff fehlt" }, 400);
    if (!text.trim()) return json({ error: "Nachricht fehlt" }, 400);

    // Verify the sender identity exists in our configured list.
    const { data: identity } = await admin
      .from("mail_identities")
      .select("email, display_name")
      .eq("email", from)
      .maybeSingle();
    if (!identity) return json({ error: "Absenderadresse ist nicht freigeschaltet" }, 400);

    let inReplyTo: string | null = null;
    if (replyToId) {
      const { data: original } = await admin
        .from("mail_messages")
        .select("message_id")
        .eq("id", replyToId)
        .maybeSingle();
      inReplyTo = original?.message_id ?? null;
    }

    const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#111111;white-space:pre-wrap;">${escapeHtml(
      text,
    )}</div>`;

    const displayName = fromName || identity.display_name || "";
    const payload: Record<string, unknown> = {
      from: displayName ? `${displayName} <${from}>` : from,
      to,
      subject,
      text,
      html,
      reply_to: from,
    };
    if (cc.length) payload.cc = cc;
    if (inReplyTo) payload.headers = { "In-Reply-To": inReplyTo, References: inReplyTo };

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const resBody = await res.text();
    if (!res.ok) {
      console.error(`Resend send failed [${res.status}]: ${resBody}`);
      await admin.from("mail_messages").insert({
        direction: "outbound",
        from_email: from,
        from_name: displayName || null,
        to_email: to,
        cc_email: cc,
        subject,
        text_body: text,
        html_body: html,
        snippet: text.slice(0, 300),
        in_reply_to: inReplyTo,
        status: "failed",
        error_message: `${res.status}: ${resBody}`.slice(0, 1000),
        is_read: true,
      });
      return json({ error: "Versand fehlgeschlagen", status: res.status, details: resBody }, res.status);
    }

    const parsed = JSON.parse(resBody || "{}");
    const { data: inserted, error: insertErr } = await admin
      .from("mail_messages")
      .insert({
        direction: "outbound",
        from_email: from,
        from_name: displayName || null,
        to_email: to,
        cc_email: cc,
        subject,
        text_body: text,
        html_body: html,
        snippet: text.slice(0, 300),
        in_reply_to: inReplyTo,
        provider_id: parsed?.id ?? null,
        status: "sent",
        is_read: true,
      })
      .select("id")
      .maybeSingle();

    if (insertErr) console.error("mail-send log failed:", insertErr.message);

    return json({ ok: true, id: inserted?.id ?? null, providerId: parsed?.id ?? null });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("mail-send error:", message);
    return json({ error: message }, 500);
  }
});
