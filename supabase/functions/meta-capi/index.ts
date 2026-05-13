import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const PIXEL_ID = '1564946328324986'
const ACCESS_TOKEN = Deno.env.get('META_CAPI_ACCESS_TOKEN')!
const GRAPH_URL = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events`

async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input.trim().toLowerCase()))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json()
    const {
      event_name,
      event_id,
      event_source_url,
      custom_data = {},
      user_data: clientUserData = {},
      test_event_code,
    } = body ?? {}

    if (!event_name || !event_id) {
      return new Response(JSON.stringify({ error: 'event_name and event_id required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('cf-connecting-ip') || ''
    const ua = req.headers.get('user-agent') || ''

    const user_data: Record<string, unknown> = {
      client_ip_address: ip,
      client_user_agent: ua,
      ...(clientUserData.fbp ? { fbp: clientUserData.fbp } : {}),
      ...(clientUserData.fbc ? { fbc: clientUserData.fbc } : {}),
    }
    if (clientUserData.email) user_data.em = [await sha256(clientUserData.email)]
    if (clientUserData.phone) user_data.ph = [await sha256(String(clientUserData.phone).replace(/\D/g, ''))]

    const payload = {
      data: [{
        event_name,
        event_time: Math.floor(Date.now() / 1000),
        event_id,
        event_source_url,
        action_source: 'website',
        user_data,
        custom_data,
      }],
      ...(test_event_code ? { test_event_code } : {}),
    }

    const res = await fetch(`${GRAPH_URL}?access_token=${ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = await res.json()

    return new Response(JSON.stringify(json), {
      status: res.ok ? 200 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('meta-capi error', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
