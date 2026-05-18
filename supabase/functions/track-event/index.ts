import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function parseUA(ua: string) {
  const u = ua.toLowerCase();
  let device: "desktop" | "mobile" | "tablet" | "other" = "desktop";
  if (/ipad|tablet|playbook|silk/.test(u)) device = "tablet";
  else if (/mobi|iphone|android.*mobile|phone/.test(u)) device = "mobile";
  else if (!ua) device = "other";

  let browser = "";
  if (/edg\//.test(u)) browser = "Edge";
  else if (/opr\/|opera/.test(u)) browser = "Opera";
  else if (/chrome\//.test(u)) browser = "Chrome";
  else if (/safari\//.test(u)) browser = "Safari";
  else if (/firefox\//.test(u)) browser = "Firefox";
  return { device, browser };
}

async function sha256(input: string) {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.session_id || !body.page_id || !body.event_type) {
      return new Response(JSON.stringify({ error: "missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ua = req.headers.get("user-agent") || "";
    const { device, browser } = parseUA(ua);

    const rawIp = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
    const ipHash = await sha256(rawIp);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error } = await supabase.from("analytics_events").insert({
      session_id: body.session_id,
      page_id: String(body.page_id).slice(0, 500),
      event_type: String(body.event_type).slice(0, 80),
      device_type: device,
      browser,
      referrer: String(body.referrer || "").slice(0, 500),
      utm_source: String(body.utm_source || "").slice(0, 120),
      utm_medium: String(body.utm_medium || "").slice(0, 120),
      utm_campaign: String(body.utm_campaign || "").slice(0, 120),
      duration_ms: typeof body.duration_ms === "number" ? body.duration_ms : null,
      question_id: body.question_id ? String(body.question_id).slice(0, 200) : null,
      question_title: body.question_title ? String(body.question_title).slice(0, 300) : null,
      answer_option: body.answer_option ? String(body.answer_option).slice(0, 300) : null,
      value_cents: typeof body.value_cents === "number" ? body.value_cents : null,
      currency: body.currency ? String(body.currency).slice(0, 10) : null,
      ip_hash: ipHash,
      variant: body.variant ? String(body.variant).slice(0, 60) : null,
    });

    if (error) {
      console.error("insert error", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(null, { status: 204, headers: corsHeaders });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "bad request" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
