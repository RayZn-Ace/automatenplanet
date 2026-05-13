// Meta Pixel + Conversions API helper.
// Browser pixel fires immediately; server CAPI is called via the
// `meta-capi` edge function with the SAME event_id for deduplication.

import { supabase } from "@/integrations/supabase/client";

export const META_PIXEL_ID = "1564946328324986";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
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

type EventName =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Lead"
  | "Contact"
  | "Purchase";

interface CustomData {
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_name?: string;
  content_type?: string;
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
  num_items?: number;
  [k: string]: unknown;
}

interface UserData {
  email?: string;
  phone?: string;
}

export function trackMetaEvent(
  eventName: EventName,
  customData: CustomData = {},
  userData: UserData = {},
): void {
  const eventId = uuid();

  // 1) Browser pixel
  try {
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq("track", eventName, customData, { eventID: eventId });
    }
  } catch (err) {
    console.warn("fbq track failed", err);
  }

  // 2) Server CAPI (fire-and-forget)
  try {
    const fbp = getCookie("_fbp");
    const fbc = getCookie("_fbc");
    supabase.functions
      .invoke("meta-capi", {
        body: {
          event_name: eventName,
          event_id: eventId,
          event_source_url: typeof window !== "undefined" ? window.location.href : undefined,
          custom_data: customData,
          user_data: { ...userData, fbp, fbc },
        },
      })
      .catch((err) => console.warn("meta-capi invoke failed", err));
  } catch (err) {
    console.warn("meta-capi invoke threw", err);
  }
}
