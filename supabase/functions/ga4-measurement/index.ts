// GA4 Measurement Protocol (Server-Side Tracking).
// Spiegelt Browser-Events serverseitig, damit Conversions auch bei
// Adblockern/ITP in GA4 (und via Import in Google Ads) ankommen.

import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const MEASUREMENT_ID = Deno.env.get('GA4_MEASUREMENT_ID') ?? ''
const API_SECRET = Deno.env.get('GA4_API_SECRET') ?? ''

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    if (!MEASUREMENT_ID || !API_SECRET) {
      return new Response(JSON.stringify({ skipped: 'ga4 not configured' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json().catch(() => null)
    const { client_id, event_name, params = {}, user_id } = body ?? {}

    if (typeof client_id !== 'string' || !client_id || typeof event_name !== 'string' || !event_name) {
      return new Response(JSON.stringify({ error: 'client_id and event_name required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const payload = {
      client_id,
      ...(user_id ? { user_id: String(user_id) } : {}),
      events: [{ name: event_name, params: { engagement_time_msec: 1, ...params } }],
    }

    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(
      MEASUREMENT_ID,
    )}&api_secret=${encodeURIComponent(API_SECRET)}`

    const res = await fetch(url, { method: 'POST', body: JSON.stringify(payload) })

    if (!res.ok) {
      const details = await res.text()
      console.error(`ga4-measurement failed [${res.status}]: ${details}`)
      return new Response(JSON.stringify({ error: 'GA4 request failed', status: res.status, details }), {
        status: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('ga4-measurement error', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
