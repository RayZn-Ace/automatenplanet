// Lädt die Tracking-Skripte (TikTok Pixel + Google gtag.js) einmalig
// und schickt bei jedem Routenwechsel einen Seitenaufruf an alle Kanäle.
// Der Meta-Basiscode liegt bereits in index.html.

import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/tracking";
import {
  GA4_MEASUREMENT_ID,
  GOOGLE_ADS_ID,
  isGa4Enabled,
  isGoogleAdsEnabled,
  isTikTokEnabled,
  TIKTOK_PIXEL_ID,
} from "@/lib/trackingConfig";

function loadTikTokPixel() {
  if (typeof window === "undefined" || window.ttq) return;
  const w = window as unknown as Record<string, unknown>;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  (function (win: any, doc: Document, scriptTag: string) {
    win.TiktokAnalyticsObject = scriptTag;
    const ttq = (win[scriptTag] = win[scriptTag] || []);
    ttq.methods = [
      "page", "track", "identify", "instances", "debug", "on", "off", "once",
      "ready", "alias", "group", "enableCookie", "disableCookie", "holdConsent",
      "revokeConsent", "grantConsent",
    ];
    ttq.setAndDefer = function (obj: any, method: string) {
      obj[method] = function (...args: unknown[]) {
        obj.push([method].concat(Array.prototype.slice.call(args, 0)));
      };
    };
    for (let i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
    ttq.instance = function (id: string) {
      const instance = ttq._i?.[id] || [];
      for (let i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(instance, ttq.methods[i]);
      return instance;
    };
    ttq.load = function (id: string, options?: Record<string, unknown>) {
      const url = "https://analytics.tiktok.com/i18n/pixel/events.js";
      const opts = options || {};
      ttq._i = ttq._i || {};
      ttq._i[id] = [];
      ttq._i[id]._u = url;
      ttq._t = ttq._t || {};
      ttq._t[id] = +new Date();
      ttq._o = ttq._o || {};
      ttq._o[id] = opts;
      const script = doc.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.src = `${url}?sdkid=${id}&lib=${scriptTag}`;
      doc.head.appendChild(script);
    };
    ttq.load(TIKTOK_PIXEL_ID);
    ttq.page();
  })(w, document, "ttq");
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

function loadGoogleTag() {
  if (typeof window === "undefined") return;
  const primaryId = isGa4Enabled() ? GA4_MEASUREMENT_ID : GOOGLE_ADS_ID;
  if (!primaryId) return;

  if (!window.gtag) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${primaryId}`;
    document.head.appendChild(script);
    window.gtag("js", new Date());
  }

  if (isGa4Enabled()) {
    // send_page_view: false – Seitenaufrufe kommen aus dem Router (SPA)
    window.gtag!("config", GA4_MEASUREMENT_ID, { send_page_view: false });
  }
  if (isGoogleAdsEnabled()) {
    window.gtag!("config", GOOGLE_ADS_ID);
  }
}

const TrackingScripts = () => {
  const location = useLocation();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    if (isTikTokEnabled()) loadTikTokPixel();
    loadGoogleTag();
  }, []);

  useEffect(() => {
    trackPageView(location.pathname + location.search, document.title);
  }, [location.pathname, location.search]);

  return null;
};

export default TrackingScripts;
