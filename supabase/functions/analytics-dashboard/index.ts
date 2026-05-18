import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authClient = createClient(supabaseUrl, anon, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await authClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    // Admin check via service-role client (has_role is locked down)
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const now = new Date();
    const defaultFrom = new Date(now.getTime() - 7 * 86400000);
    const from = url.searchParams.get("from") || defaultFrom.toISOString();
    const to = url.searchParams.get("to") || now.toISOString();

    // Run aggregates in parallel using rpc-less raw selects + JS aggregation
    // Pull all events in range (cap to 50k) — keeps it simple, fine for typical traffic
    const { data: events, error: evErr } = await admin
      .from("analytics_events")
      .select(
        "session_id, page_id, event_type, device_type, duration_ms, question_id, question_title, answer_option, value_cents, created_at",
      )
      .gte("created_at", from)
      .lte("created_at", to)
      .order("created_at", { ascending: true })
      .limit(50000);

    if (evErr) {
      return new Response(JSON.stringify({ error: evErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const evs = events || [];

    const pageviewSessions = new Set<string>();
    const purchaseSessions = new Set<string>();
    const cartSessions = new Set<string>();
    const checkoutSessions = new Set<string>();
    const deviceSessions: Record<string, Set<string>> = {
      desktop: new Set(),
      mobile: new Set(),
      tablet: new Set(),
      other: new Set(),
    };
    const pagesVisits: Record<string, Set<string>> = {};
    const pagesDuration: Record<string, { total: number; n: number }> = {};
    const dailyVisits: Record<string, Set<string>> = {};
    const dailyPurchases: Record<string, Set<string>> = {};
    const productViews: Record<string, { title: string; count: number }> = {};
    const addToCart: Record<string, { title: string; count: number }> = {};
    let revenueCents = 0;

    for (const e of evs) {
      const day = new Date(e.created_at).toISOString().slice(0, 10);

      if (e.event_type === "pageview") {
        pageviewSessions.add(e.session_id);
        if (deviceSessions[e.device_type]) deviceSessions[e.device_type].add(e.session_id);
        else deviceSessions.other.add(e.session_id);
        if (!pagesVisits[e.page_id]) pagesVisits[e.page_id] = new Set();
        pagesVisits[e.page_id].add(e.session_id);
        if (!dailyVisits[day]) dailyVisits[day] = new Set();
        dailyVisits[day].add(e.session_id);
      } else if (e.event_type === "page_exit") {
        if (e.duration_ms != null && e.duration_ms < 30 * 60 * 1000) {
          if (!pagesDuration[e.page_id]) pagesDuration[e.page_id] = { total: 0, n: 0 };
          pagesDuration[e.page_id].total += e.duration_ms;
          pagesDuration[e.page_id].n += 1;
        }
      } else if (e.event_type === "purchase") {
        purchaseSessions.add(e.session_id);
        if (!dailyPurchases[day]) dailyPurchases[day] = new Set();
        dailyPurchases[day].add(e.session_id);
        if (e.value_cents) revenueCents += e.value_cents;
      } else if (e.event_type === "add_to_cart") {
        cartSessions.add(e.session_id);
        const id = e.question_id || e.page_id;
        if (!addToCart[id]) addToCart[id] = { title: e.question_title || id, count: 0 };
        addToCart[id].count += 1;
      } else if (e.event_type === "checkout_started") {
        checkoutSessions.add(e.session_id);
      } else if (e.event_type === "product_viewed") {
        const id = e.question_id || e.page_id;
        if (!productViews[id]) productViews[id] = { title: e.question_title || id, count: 0 };
        productViews[id].count += 1;
      }
    }

    const visits = pageviewSessions.size;
    const conversions = purchaseSessions.size;
    const conversionRate = visits > 0 ? Math.round((conversions / visits) * 1000) / 10 : 0;

    const totalDevice = Object.values(deviceSessions).reduce((s, x) => s + x.size, 0) || 1;
    const deviceBreakdown = {
      desktop: Math.round((deviceSessions.desktop.size / totalDevice) * 100),
      mobile: Math.round((deviceSessions.mobile.size / totalDevice) * 100),
      tablet: Math.round((deviceSessions.tablet.size / totalDevice) * 100),
      other: Math.round((deviceSessions.other.size / totalDevice) * 100),
    };

    const pageStats = Object.entries(pagesVisits)
      .map(([pageId, sess]) => ({
        pageId,
        visits: sess.size,
        avgDurationMs: pagesDuration[pageId]
          ? Math.round(pagesDuration[pageId].total / pagesDuration[pageId].n)
          : null,
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 25);

    const allDays = new Set([...Object.keys(dailyVisits), ...Object.keys(dailyPurchases)]);
    const dailySeries = Array.from(allDays)
      .sort()
      .map((d) => ({
        date: d,
        visits: dailyVisits[d]?.size || 0,
        purchases: dailyPurchases[d]?.size || 0,
      }));

    const topProducts = Object.entries(productViews)
      .map(([id, v]) => ({ id, title: v.title, count: v.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    const topAddToCart = Object.entries(addToCart)
      .map(([id, v]) => ({ id, title: v.title, count: v.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    const funnel = {
      pageviews: visits,
      addedToCart: cartSessions.size,
      checkoutStarted: checkoutSessions.size,
      purchased: conversions,
    };

    return new Response(
      JSON.stringify({
        range: { from, to },
        totals: { visits, conversions, conversionRate, revenueCents },
        deviceBreakdown,
        pageStats,
        dailySeries,
        topProducts,
        topAddToCart,
        funnel,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "internal" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
