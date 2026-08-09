// Zentrale Tracking-Konfiguration.
// Pixel-/Measurement-IDs sind öffentlich und dürfen im Code stehen.
// Server-Tokens (CAPI / Events API / Measurement Protocol) liegen als Secrets im Backend.
//
// Leere ID = Kanal ist deaktiviert und wird komplett übersprungen (kein Fehler).

/** Meta (Facebook/Instagram) Pixel – bereits aktiv, Basiscode in index.html */
export const META_PIXEL_ID = "1564946328324986";

/** TikTok Pixel ID (TikTok Events Manager → Web-Ereignisse → Pixel) */
export const TIKTOK_PIXEL_ID = "";

/** GA4 Measurement ID, Format G-XXXXXXXXXX */
export const GA4_MEASUREMENT_ID = "G-6L3CWK7GWN";

/** Google Tag Manager Container ID, Format GTM-XXXXXXX */
export const GTM_CONTAINER_ID = "GTM-N9WLKBDF";

/** Google Ads Conversion ID, Format AW-XXXXXXXXX */
export const GOOGLE_ADS_ID = "";

/**
 * Google Ads Conversion-Labels je Event (aus dem Conversion-Tag, z.B. "AbC-D_efGhIjKlM").
 * Nur gesetzte Labels werden gesendet.
 */
export const GOOGLE_ADS_CONVERSION_LABELS: Partial<Record<TrackedEvent, string>> = {
  add_to_cart: "",
  begin_checkout: "",
  purchase: "",
  contact: "",
};

/** Kanonische Event-Namen dieser Website (provider-neutral). */
export type TrackedEvent =
  | "page_view"
  | "view_content"
  | "add_to_cart"
  | "begin_checkout"
  | "purchase"
  | "lead"
  | "contact"
  | "search";

/** Mapping auf die Provider-Event-Namen. */
export const EVENT_MAP: Record<TrackedEvent, { meta: string; tiktok: string; ga4: string }> = {
  page_view: { meta: "PageView", tiktok: "Pageview", ga4: "page_view" },
  view_content: { meta: "ViewContent", tiktok: "ViewContent", ga4: "view_item" },
  add_to_cart: { meta: "AddToCart", tiktok: "AddToCart", ga4: "add_to_cart" },
  begin_checkout: { meta: "InitiateCheckout", tiktok: "InitiateCheckout", ga4: "begin_checkout" },
  purchase: { meta: "Purchase", tiktok: "CompletePayment", ga4: "purchase" },
  lead: { meta: "Lead", tiktok: "SubmitForm", ga4: "generate_lead" },
  contact: { meta: "Contact", tiktok: "Contact", ga4: "contact" },
  search: { meta: "Search", tiktok: "Search", ga4: "search" },
};

export const isMetaEnabled = () => META_PIXEL_ID.length > 0;
export const isTikTokEnabled = () => TIKTOK_PIXEL_ID.length > 0;
export const isGa4Enabled = () => GA4_MEASUREMENT_ID.length > 0;
export const isGoogleAdsEnabled = () => GOOGLE_ADS_ID.length > 0;
