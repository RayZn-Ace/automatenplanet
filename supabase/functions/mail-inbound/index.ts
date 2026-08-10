// Receives inbound emails from Resend (webhook) and stores them in mail_messages.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Addr = string | { address?: string; email?: string; name?: string };

const toEmail = (a: Addr | undefined): string => {
  if (!a) return "";
  if (typeof a === "string") {
    const m = a.match(/<([^>]+)>/);
    return (m ? m[1] : a).trim().toLowerCase();
  }
  return (a.address ?? a.email ?? "").trim().toLowerCase();
};

const toName = (a: Addr | undefined): string | null => {
  if (!a) return null;
  if (typeof a === "string") {
    const m = a.match(/^\s*"?([^"<]*)"?\s*</);
    return m && m[1].trim() ? m[1].trim() : null;
  }
  return a.name ?? null;
};

const list = (v: Addr | Addr[] | undefined): string[] => {
  if (!v) return [];
  const arr = Array.isArray(v) ? v : [v];
  return arr.map(toEmail).filter(Boolean);
};

const stripHtml = (html: string) =>
  html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.json();
    const type: string = payload?.type ?? "email.received";
    const d = payload?.data ?? payload ?? {};

    if (type && !String(type).startsWith("email.received") && !String(type).startsWith("inbound")) {
      // Ignore delivery/bounce style events on this endpoint.
      return new Response(JSON.stringify({ ok: true, ignored: type }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fromRaw: Addr | undefined = d.from ?? d.sender ?? d.envelope?.from;
    const from_email = toEmail(fromRaw);
    if (!from_email) {
      return new Response(JSON.stringify({ error: "Missing sender" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html_body: string | null = d.html ?? null;
    const text_body: string | null = d.text ?? (html_body ? stripHtml(html_body) : null);
    const snippetSource = text_body ?? "";

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error } = await admin.from("mail_messages").insert({
      direction: "inbound",
      from_email,
      from_name: toName(fromRaw),
      to_email: list(d.to ?? d.envelope?.to),
      cc_email: list(d.cc),
      subject: d.subject ?? "(kein Betreff)",
      text_body,
      html_body,
      snippet: snippetSource.slice(0, 300),
      message_id: d.message_id ?? d.messageId ?? d.email_id ?? null,
      in_reply_to: d.in_reply_to ?? d.headers?.["in-reply-to"] ?? null,
      provider_id: d.email_id ?? d.id ?? null,
      status: "received",
      raw: payload,
    });

    if (error) {
      console.error("mail-inbound insert failed:", error.message);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("mail-inbound error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
