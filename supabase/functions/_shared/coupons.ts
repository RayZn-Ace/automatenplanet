// Serverseitige Gutschein-Logik. Rabatte werden ausschliesslich hier berechnet.
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: string; // 'percent' | 'fixed' | 'test'
  discount_value: number;
  is_test: boolean;
  is_active: boolean;
  free_shipping: boolean;
  min_subtotal_net_cents: number;
  max_redemptions: number | null;
  redemptions: number;
  starts_at: string | null;
  expires_at: string | null;
}

export interface CouponResult {
  coupon: Coupon;
  discountNetCents: number;
  shippingNetCents: number;
  isTest: boolean;
}

/** Betrag, den eine Testbestellung bei Mollie kostet (Minimum). */
export const TEST_ORDER_GROSS_CENTS = 1;

export async function loadCoupon(
  supabase: SupabaseClient,
  rawCode: string,
): Promise<{ coupon?: Coupon; error?: string }> {
  const code = rawCode.trim().toLowerCase();
  if (!code) return { error: "Kein Code angegeben" };

  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .ilike("code", code)
    .maybeSingle();

  if (error) {
    console.error("coupon lookup failed", error);
    return { error: "Code konnte nicht geprueft werden" };
  }
  const coupon = data as Coupon | null;
  if (!coupon || !coupon.is_active) return { error: "Dieser Gutscheincode ist ungueltig." };

  const now = Date.now();
  if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now) {
    return { error: "Dieser Gutscheincode ist noch nicht gueltig." };
  }
  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < now) {
    return { error: "Dieser Gutscheincode ist abgelaufen." };
  }
  if (coupon.max_redemptions !== null && coupon.redemptions >= coupon.max_redemptions) {
    return { error: "Dieser Gutscheincode wurde bereits vollstaendig eingeloest." };
  }
  return { coupon };
}

/** Wendet den Gutschein auf Zwischensumme und Versand an (alles netto, Cent). */
export function applyCoupon(
  coupon: Coupon,
  subtotalNetCents: number,
  shippingNetCents: number,
): { discountNetCents: number; shippingNetCents: number; error?: string } {
  if (subtotalNetCents < coupon.min_subtotal_net_cents) {
    return {
      discountNetCents: 0,
      shippingNetCents,
      error: "Mindestbestellwert fuer diesen Gutscheincode nicht erreicht.",
    };
  }
  const shipping = coupon.free_shipping ? 0 : shippingNetCents;

  if (coupon.discount_type === "test") {
    return { discountNetCents: subtotalNetCents, shippingNetCents: shipping };
  }
  if (coupon.discount_type === "percent") {
    const pct = Math.min(Math.max(coupon.discount_value, 0), 100);
    return {
      discountNetCents: Math.round((subtotalNetCents * pct) / 100),
      shippingNetCents: shipping,
    };
  }
  // fixed
  return {
    discountNetCents: Math.min(Math.max(coupon.discount_value, 0), subtotalNetCents),
    shippingNetCents: shipping,
  };
}

export function couponLabel(coupon: Coupon): string {
  if (coupon.discount_type === "test") return "Testbestellung (0,01 EUR)";
  if (coupon.discount_type === "percent") return `${coupon.discount_value}% Rabatt`;
  return `${(coupon.discount_value / 100).toFixed(2)} EUR Rabatt`;
}
