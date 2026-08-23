// Klick-Tracking für die Kontaktkanäle (WhatsApp / Telefon).
//
// Diese Klicks sind Micro-Conversions und waren bisher komplett unsichtbar:
// ein Nutzer, der statt der Kasse den WhatsApp- oder Telefonweg nimmt,
// erschien in keinem Report. Jeder Klick geht jetzt an drei Stellen:
//   1) GTM-dataLayer  -> "whatsapp_click" / "phone_click" + "contact_click"
//   2) Meta/TikTok/GA4 -> kanonisches Event "contact" (inkl. CAPI)
//   3) Eigene Analytics-Tabelle -> im Admin sichtbar

import { track } from "@/lib/analytics";
import { pushEvent } from "@/lib/dataLayer";
import { trackEvent } from "@/lib/tracking";

export type ContactChannel = "whatsapp" | "phone";

export interface ContactClickContext {
  /** Sichtbarer Button-Text, z.B. "WhatsApp Beratung". */
  label?: string;
  /** Produktbezug, falls der Klick auf einer Produktseite passiert. */
  productName?: string;
  /** Position im Layout, z.B. "navbar", "footer", "product_buybox". */
  placement?: string;
}

export function trackContactClick(channel: ContactChannel, context: ContactClickContext = {}): void {
  const params = {
    contact_channel: channel,
    contact_label: context.label ?? "",
    contact_placement: context.placement ?? "",
    ...(context.productName ? { product_name: context.productName } : {}),
    page_path: typeof window !== "undefined" ? window.location.pathname : "",
  };

  try {
    pushEvent(`${channel}_click`, params);
    pushEvent("contact_click", params);
  } catch {
    /* dataLayer nicht verfügbar */
  }

  try {
    trackEvent("contact", {
      contentName: context.productName ?? context.label ?? channel,
      currency: "EUR",
    });
  } catch {
    /* Pixel nicht verfügbar */
  }

  track(`${channel}_click`, {
    question_id: context.placement ?? channel,
    question_title: context.productName ?? context.label ?? channel,
    answer_option: channel,
  });
}
