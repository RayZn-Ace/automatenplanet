const TRACK_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-event`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

function getSessionId(): string {
  try {
    let sid = sessionStorage.getItem("_asid");
    if (!sid) {
      sid = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`) as string;
      sessionStorage.setItem("_asid", sid);
    }
    return sid;
  } catch {
    return "00000000-0000-0000-0000-000000000000";
  }
}

function getUtm() {
  try {
    const p = new URLSearchParams(location.search);
    return {
      utm_source: p.get("utm_source") || "",
      utm_medium: p.get("utm_medium") || "",
      utm_campaign: p.get("utm_campaign") || "",
    };
  } catch {
    return { utm_source: "", utm_medium: "", utm_campaign: "" };
  }
}

export function track(eventType: string, payload: Record<string, unknown> = {}) {
  try {
    const body = JSON.stringify({
      session_id: getSessionId(),
      page_id: (payload.page_id as string) ?? location.pathname,
      event_type: eventType,
      referrer: document.referrer,
      ...getUtm(),
      ...payload,
    });

    // sendBeacon can't set the apikey header that the Supabase gateway requires,
    // so always use fetch with keepalive (survives page unload in modern browsers).
    fetch(TRACK_URL, {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json",
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
      keepalive: true,
      mode: "cors",
      credentials: "omit",
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}

let currentExit: (() => void) | null = null;

export function trackPageview(pageId: string) {
  // flush previous page's exit if any (SPA route change)
  if (currentExit) {
    try { currentExit(); } catch { /* ignore */ }
    currentExit = null;
  }
  track("pageview", { page_id: pageId });
  const enter = performance.now();
  let sent = false;
  const onLeave = () => {
    if (sent) return;
    sent = true;
    track("page_exit", { page_id: pageId, duration_ms: Math.round(performance.now() - enter) });
  };
  window.addEventListener("pagehide", onLeave, { once: true });
  currentExit = onLeave;
}
