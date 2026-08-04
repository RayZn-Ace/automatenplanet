// TikTok Events API 2.0 (Server-Side / "CAPI"-Äquivalent).
// Empfängt Events vom Browser und spiegelt sie serverseitig mit derselben
// event_id -> TikTok dedupliziert Pixel- und Server-Event automatisch.

import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const PIXEL_ID = Deno.env.get('TIKTOK_PIXEL_ID') ?? ''
const ACCESS_TOKEN = Deno.env.get('TIKTOK_EVENTS_ACCESS_TOKEN') ?? ''
const API_URL = 'https://business-api.tiktok.com/open_api/v1.3/event/track/'

async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input.trim().toLowerCase()))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    if (!PIXEL_ID || !ACCESS_TOKEN) {
      return new Response(JSON.stringify({ skipped: 'tiktok not configured' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json().catch(() => null)
    const {
      event_name,
      event_id,
      page_url,
      referrer,
      properties = {},
      user: clientUser = {},
      test_event_code,
    } = body ?? {}

    if (typeof event_name !== 'string' || !event_name || typeof event_id !== 'string' || !event_id) {
      return new Response(JSON.stringify({ error: 'event_name and event_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('cf-connecting-ip') || ''
    const ua = req.headers.get('user-agent') || ''

    const user: Record<string, unknown> = {
      ip,
      user_agent: ua,
      ...(clientUser.ttclid ? { ttclid: String(clientUser.ttclid) } : {}),
      ...(clientUser.ttp ? { ttp: String(clientUser.ttp) } : {}),
    }
    if (clientUser.email) user.email = await sha256(String(clientUser.email))
    if (clientUser.phone) user.phone = await sha256(String(clientUser.phone).replace(/[^\d+]/g, ''))

    const payload = {
      event_source: 'web',
      event_source_id: PIXEL_ID,
      ...(test_event_code ? { test_event_code } : {}),
      data: [
        {
          event: event_name,
          event_time: Math.floor(Date.now() / 1000),
          event_id,
          user,
          properties,
          page: {
            ...(page_url ? { url: String(page_url) } : {}),
            ...(referrer ? { referrer: String(referrer) } : {}),
          },
        },
      ],
    }

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Access-Token': ACCESS_TOKEN },
      body: JSON.stringify(payload),
    })
    const text = await res.text()

    if (!res.ok) {
      console.error(`tiktok-events failed [${res.status}]: ${text}`)
      return new Response(JSON.stringify({ error: 'TikTok request failed', status: res.status, details: text }), {
        status: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // TikTok meldet Fehler teilweise mit HTTP 200 im Body (code != 0)
    const json = JSON.parse(text)
    if (json?.code && json.code !== 0) console.error('tiktok-events api error', text)

    return new Response(JSON.stringify(json), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('tiktok-events error', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
