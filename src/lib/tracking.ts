// Einheitliche Tracking-Schicht für Meta, TikTok und Google.
//
// Pro Event gilt:
//  1) Browser-Pixel feuert sofort (Meta fbq / TikTok ttq / Google gtag)
//  2) Server-Side API feuert parallel mit IDENTISCHER event_id
//     (Meta CAPI, TikTok Events API 2.0, GA4 Measurement Protocol)
//     -> Deduplizierung, Tracking auch bei Adblockern / iOS ITP

import { supabase } from "@/integrations/supabase/client";
import {
  EVENT_MAP,
  GA4_MEASUREMENT_ID,
  GOOGLE_ADS_CONVERSION_LABELS,
  GOOGLE_ADS_ID,
  isGa4Enabled,
  isGoogleAdsEnabled,
  isMetaEnabled,
  isTikTokEnabled,
  TrackedEvent,
} from "@/lib/trackingConfig";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    ttq?: {
      track: (event: string, data?: Record<string, unknown>, options?: Record<string, unknown>) => void;
      page: () => void;
      identify: (data: Record<string, unknown>) => void;
      instance?: (id: string) => unknown;
      load?: (id: string) => void;
    };
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export interface TrackItem {
  id: string;
  name?: string;
  quantity?: number;
  price?: number;
}

export interface TrackPayload {
  value?: number;
  currency?: string;
  contentName?: string;
  contentType?: "product" | "product_group";
  items?: TrackItem[];
  transactionId?: string;
  searchTerm?: string;
  /** Wird gehasht und nur serverseitig verwendet. */
  email?: string;
  phone?: string;
  [k: string]: unknown;
}

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : undefined;
}

function queryParam(name: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  const value = new URLSearchParams(window.location.search).get(name);
  return value || undefined;
}

const ids = (payload: TrackPayload) => (payload.items ?? []).map((i) => i.id);

/** Meta-Custom-Data */
function metaData(payload: TrackPayload) {
  return {
    ...(payload.value !== undefined ? { value: payload.value } : {}),
    currency: payload.currency ?? "EUR",
    ...(payload.items ? { content_ids: ids(payload), content_type: payload.contentType ?? "product" } : {}),
    ...(payload.contentName ? { content_name: payload.contentName } : {}),
    ...(payload.items
      ? {
          contents: payload.items.map((i) => ({ id: i.id, quantity: i.quantity ?? 1, item_price: i.price })),
          num_items: payload.items.reduce((sum, i) => sum + (i.quantity ?? 1), 0),
        }
      : {}),
    ...(payload.searchTerm ? { search_string: payload.searchTerm } : {}),
  };
}

/** TikTok-Properties (Events API 2.0 / Pixel) */
function tiktokData(payload: TrackPayload) {
  return {
    ...(payload.value !== undefined ? { value: payload.value } : {}),
    currency: payload.currency ?? "EUR",
    ...(payload.items
      ? {
          contents: payload.items.map((i) => ({
            content_id: i.id,
            content_name: i.name,
            content_type: payload.contentType ?? "product",
            quantity: i.quantity ?? 1,
            price: i.price,
          })),
        }
      : {}),
    ...(payload.contentName ? { content_name: payload.contentName } : {}),
    ...(payload.searchTerm ? { query: payload.searchTerm } : {}),
  };
}

/** GA4-Parameter (gtag + Measurement Protocol) */
function ga4Data(payload: TrackPayload) {
  return {
    ...(payload.value !== undefined ? { value: payload.value } : {}),
    currency: payload.currency ?? "EUR",
    ...(payload.transactionId ? { transaction_id: payload.transactionId } : {}),
    ...(payload.searchTerm ? { search_term: payload.searchTerm } : {}),
    ...(payload.items
      ? {
          items: payload.items.map((i) => ({
            item_id: i.id,
            item_name: i.name,
            price: i.price,
            quantity: i.quantity ?? 1,
          })),
        }
      : {}),
  };
}

/** GA4 Client-ID aus dem _ga Cookie (Format GA1.1.<client_id>) für das Server-Tracking. */
function ga4ClientId(): string | undefined {
  const raw = getCookie("_ga");
  if (!raw) return undefined;
  const parts = raw.split(".");
  return parts.length >= 4 ? `${parts[2]}.${parts[3]}` : undefined;
}

/**
 * Sendet ein Event an alle aktiven Kanäle (Browser + Server).
 * Fire-and-forget: Fehler eines Kanals beeinflussen die anderen nicht.
 */
export function trackEvent(event: TrackedEvent, payload: TrackPayload = {}): void {
  const eventId = uuid();
  const names = EVENT_MAP[event];
  const url = typeof window !== "undefined" ? window.location.href : undefined;
  const { email, phone, ...publicPayload } = payload;

  // ---------- Meta ----------
  if (isMetaEnabled()) {
    try {
      window.fbq?.("track", names.meta, metaData(publicPayload), { eventID: eventId });
    } catch (err) {
      console.warn("fbq failed", err);
    }
    supabase.functions
      .invoke("meta-capi", {
        body: {
          event_name: names.meta,
          event_id: eventId,
          event_source_url: url,
          custom_data: metaData(publicPayload),
          user_data: { email, phone, fbp: getCookie("_fbp"), fbc: getCookie("_fbc") },
        },
      })
      .catch((err) => console.warn("meta-capi failed", err));
  }

  // ---------- TikTok ----------
  if (isTikTokEnabled()) {
    try {
      window.ttq?.track(names.tiktok, tiktokData(publicPayload), { event_id: eventId });
    } catch (err) {
      console.warn("ttq failed", err);
    }
    supabase.functions
      .invoke("tiktok-events", {
        body: {
          event_name: names.tiktok,
          event_id: eventId,
          page_url: url,
          referrer: typeof document !== "undefined" ? document.referrer : undefined,
          properties: tiktokData(publicPayload),
          user: {
            email,
            phone,
            ttclid: queryParam("ttclid") ?? getCookie("ttclid"),
            ttp: getCookie("_ttp"),
          },
        },
      })
      .catch((err) => console.warn("tiktok-events failed", err));
  }

  // ---------- Google (GA4 + Google Ads) ----------
  if (isGa4Enabled() || isGoogleAdsEnabled()) {
    try {
      window.gtag?.("event", names.ga4, { ...ga4Data(publicPayload), event_id: eventId });
    } catch (err) {
      console.warn("gtag failed", err);
    }

    const adsLabel = GOOGLE_ADS_CONVERSION_LABELS[event];
    if (isGoogleAdsEnabled() && adsLabel) {
      try {
        window.gtag?.("event", "conversion", {
          send_to: `${GOOGLE_ADS_ID}/${adsLabel}`,
          value: publicPayload.value,
          currency: publicPayload.currency ?? "EUR",
          transaction_id: publicPayload.transactionId,
        });
      } catch (err) {
        console.warn("google ads conversion failed", err);
      }
    }

    if (isGa4Enabled()) {
      const clientId = ga4ClientId();
      if (clientId) {
        supabase.functions
          .invoke("ga4-measurement", {
            body: {
              client_id: clientId,
              event_name: names.ga4,
              params: {
                ...ga4Data(publicPayload),
                page_location: url,
                engagement_time_msec: 1,
                event_id: eventId,
              },
            },
          })
          .catch((err) => console.warn("ga4-measurement failed", err));
      }
    }
  }
}

/** Seitenaufruf – Meta/TikTok Pageview + GA4 page_view. */
export function trackPageView(path: string, title?: string): void {
  if (isMetaEnabled()) {
    try {
      window.fbq?.("track", "PageView");
    } catch (err) {
      console.warn("fbq pageview failed", err);
    }
  }
  if (isTikTokEnabled()) {
    try {
      window.ttq?.page();
    } catch (err) {
      console.warn("ttq page failed", err);
    }
  }
  if (isGa4Enabled()) {
    try {
      window.gtag?.("event", "page_view", {
        page_path: path,
        page_title: title,
        page_location: typeof window !== "undefined" ? window.location.href : undefined,
        send_to: GA4_MEASUREMENT_ID,
      });
    } catch (err) {
      console.warn("gtag page_view failed", err);
    }
  }
}

/** Erst-Party-Identifikation (z.B. nach Newsletter/Login) für besseres Matching. */
export function identifyUser(user: { email?: string; phone?: string }): void {
  if (isTikTokEnabled() && (user.email || user.phone)) {
    try {
      window.ttq?.identify({
        ...(user.email ? { email: user.email } : {}),
        ...(user.phone ? { phone_number: user.phone } : {}),
      });
    } catch (err) {
      console.warn("ttq identify failed", err);
    }
  }
}
