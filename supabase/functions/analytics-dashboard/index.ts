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
    const { data: userData, error: userErr } = await authClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

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
    const view = url.searchParams.get("view") || "overview";

    const json = (payload: unknown, status = 200) =>
      new Response(JSON.stringify(payload), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    // ---------- LIVE ----------
    if (view === "live") {
      const windowMin = Number(url.searchParams.get("minutes") || "15");
      const since = new Date(now.getTime() - windowMin * 60000).toISOString();
      const { data: rows, error } = await admin
        .from("analytics_events")
        .select(
          "session_id, page_id, event_type, device_type, browser, referrer, utm_source, utm_medium, utm_campaign, question_title, value_cents, created_at",
        )
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(4000);
      if (error) return json({ error: error.message }, 500);

      const bySession = new Map<string, {
        sessionId: string;
        lastSeen: string;
        firstSeen: string;
        currentPage: string;
        device: string;
        browser: string;
        referrer: string;
        utmSource: string;
        events: number;
        pageviews: number;
        addedToCart: number;
        purchased: boolean;
        revenueCents: number;
      }>();

      for (const e of rows || []) {
        let s = bySession.get(e.session_id);
        if (!s) {
          s = {
            sessionId: e.session_id,
            lastSeen: e.created_at,
            firstSeen: e.created_at,
            currentPage: e.page_id,
            device: e.device_type,
            browser: e.browser,
            referrer: e.referrer,
            utmSource: e.utm_source,
            events: 0,
            pageviews: 0,
            addedToCart: 0,
            purchased: false,
            revenueCents: 0,
          };
          bySession.set(e.session_id, s);
        }
        s.events += 1;
        if (e.created_at < s.firstSeen) s.firstSeen = e.created_at;
        if (e.event_type === "pageview") s.pageviews += 1;
        if (e.event_type === "add_to_cart") s.addedToCart += 1;
        if (e.event_type === "purchase") {
          s.purchased = true;
          s.revenueCents += e.value_cents || 0;
        }
      }

      const activeCut = new Date(now.getTime() - 5 * 60000).toISOString();
      const sessions = Array.from(bySession.values()).sort((a, b) => (a.lastSeen < b.lastSeen ? 1 : -1));

      return json({
        now: now.toISOString(),
        windowMinutes: windowMin,
        activeNow: sessions.filter((s) => s.lastSeen >= activeCut).length,
        sessions: sessions.slice(0, 100),
        feed: (rows || []).slice(0, 60).map((e) => ({
          sessionId: e.session_id,
          eventType: e.event_type,
          pageId: e.page_id,
          title: e.question_title,
          device: e.device_type,
          valueCents: e.value_cents,
          createdAt: e.created_at,
        })),
      });
    }

    // ---------- JOURNEYS (session list) ----------
    if (view === "journeys") {
      const filter = url.searchParams.get("filter") || "all"; // all | converted | cart
      const { data: rows, error } = await admin
        .from("analytics_events")
        .select(
          "session_id, page_id, event_type, device_type, browser, referrer, utm_source, utm_medium, utm_campaign, duration_ms, value_cents, created_at",
        )
        .gte("created_at", from)
        .lte("created_at", to)
        .order("created_at", { ascending: true })
        .limit(50000);
      if (error) return json({ error: error.message }, 500);

      const map = new Map<string, {
        sessionId: string;
        start: string;
        end: string;
        entryPage: string;
        exitPage: string;
        device: string;
        browser: string;
        referrer: string;
        utmSource: string;
        utmMedium: string;
        utmCampaign: string;
        pageviews: number;
        events: number;
        durationMs: number;
        addedToCart: boolean;
        checkout: boolean;
        purchased: boolean;
        revenueCents: number;
      }>();

      for (const e of rows || []) {
        let s = map.get(e.session_id);
        if (!s) {
          s = {
            sessionId: e.session_id,
            start: e.created_at,
            end: e.created_at,
            entryPage: e.page_id,
            exitPage: e.page_id,
            device: e.device_type,
            browser: e.browser,
            referrer: e.referrer,
            utmSource: e.utm_source,
            utmMedium: e.utm_medium,
            utmCampaign: e.utm_campaign,
            pageviews: 0,
            events: 0,
            durationMs: 0,
            addedToCart: false,
            checkout: false,
            purchased: false,
            revenueCents: 0,
          };
          map.set(e.session_id, s);
        }
        s.events += 1;
        s.end = e.created_at;
        if (e.event_type === "pageview") {
          s.pageviews += 1;
          s.exitPage = e.page_id;
        }
        if (e.event_type === "page_exit" && e.duration_ms && e.duration_ms < 30 * 60000) {
          s.durationMs += e.duration_ms;
        }
        if (e.event_type === "add_to_cart") s.addedToCart = true;
        if (e.event_type === "checkout_started" || e.event_type === "begin_checkout") s.checkout = true;
        if (e.event_type === "purchase") {
          s.purchased = true;
          s.revenueCents += e.value_cents || 0;
        }
      }

      let sessions = Array.from(map.values()).sort((a, b) => (a.end < b.end ? 1 : -1));
      if (filter === "converted") sessions = sessions.filter((s) => s.purchased);
      if (filter === "cart") sessions = sessions.filter((s) => s.addedToCart && !s.purchased);

      return json({ total: sessions.length, sessions: sessions.slice(0, 300) });
    }

    // ---------- JOURNEY (single session timeline) ----------
    if (view === "journey") {
      const sessionId = url.searchParams.get("session_id");
      if (!sessionId) return json({ error: "session_id required" }, 400);
      const { data: rows, error } = await admin
        .from("analytics_events")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true })
        .limit(1000);
      if (error) return json({ error: error.message }, 500);
      return json({ sessionId, events: rows || [] });
    }

    // ---------- REVENUE ----------
    if (view === "revenue") {
      const { data: orders, error } = await admin
        .from("orders")
        .select(
          "id, order_number, status, created_at, paid_at, total_gross_cents, subtotal_net_cents, shipping_net_cents, vat_cents, country, email, order_items(name, variant_label, quantity, unit_price_net_cents)",
        )
        .gte("created_at", from)
        .lte("created_at", to)
        .order("created_at", { ascending: true })
        .limit(5000);
      if (error) return json({ error: error.message }, 500);

      const all = orders || [];
      const paid = all.filter((o) => o.status === "paid" || o.status === "shipped");
      const grossPaid = paid.reduce((s, o) => s + (o.total_gross_cents || 0), 0);
      const netPaid = paid.reduce((s, o) => s + (o.subtotal_net_cents || 0), 0);
      const vat = paid.reduce((s, o) => s + (o.vat_cents || 0), 0);
      const shipping = paid.reduce((s, o) => s + (o.shipping_net_cents || 0), 0);

      const daily: Record<string, { date: string; grossCents: number; orders: number }> = {};
      for (const o of paid) {
        const d = (o.paid_at || o.created_at).slice(0, 10);
        if (!daily[d]) daily[d] = { date: d, grossCents: 0, orders: 0 };
        daily[d].grossCents += o.total_gross_cents || 0;
        daily[d].orders += 1;
      }

      const byStatus: Record<string, number> = {};
      for (const o of all) byStatus[o.status] = (byStatus[o.status] || 0) + 1;

      const byProduct: Record<string, { name: string; qty: number; netCents: number }> = {};
      for (const o of paid) {
        for (const it of (o.order_items || []) as Array<{
          name: string;
          variant_label: string;
          quantity: number;
          unit_price_net_cents: number;
        }>) {
          const key = it.name + (it.variant_label ? ` (${it.variant_label})` : "");
          if (!byProduct[key]) byProduct[key] = { name: key, qty: 0, netCents: 0 };
          byProduct[key].qty += it.quantity;
          byProduct[key].netCents += it.unit_price_net_cents * it.quantity;
        }
      }

      const byCountry: Record<string, { country: string; orders: number; grossCents: number }> = {};
      for (const o of paid) {
        const c = o.country || "—";
        if (!byCountry[c]) byCountry[c] = { country: c, orders: 0, grossCents: 0 };
        byCountry[c].orders += 1;
        byCountry[c].grossCents += o.total_gross_cents || 0;
      }

      return json({
        range: { from, to },
        totals: {
          orders: all.length,
          paidOrders: paid.length,
          grossCents: grossPaid,
          netCents: netPaid,
          vatCents: vat,
          shippingNetCents: shipping,
          avgOrderGrossCents: paid.length ? Math.round(grossPaid / paid.length) : 0,
        },
        byStatus,
        daily: Object.values(daily).sort((a, b) => a.date.localeCompare(b.date)),
        topProducts: Object.values(byProduct).sort((a, b) => b.netCents - a.netCents).slice(0, 20),
        byCountry: Object.values(byCountry).sort((a, b) => b.grossCents - a.grossCents),
      });
    }


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
