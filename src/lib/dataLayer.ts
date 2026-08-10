// GTM dataLayer-Schicht (Google Tag Manager, Container GTM-N9WLKBDF).
//
// Regeln aus dem Tracking-Konzept (MORE. Growth):
//  - Vor jedem Ecommerce-Push wird { ecommerce: null } gepusht, damit keine
//    Werte des vorherigen Events mitgeschleppt werden.
//  - Event-Namen exakt in Kleinschreibung (GA4-Standard), value als Zahl,
//    Dezimaltrenner Punkt, ohne Währungssymbol.
//  - value = Warenwert der Artikel, NETTO (der Shop weist netto für Gewerbe
//    aus) und ohne Versandkosten. Gleicher Wert überall, auch im Merchant Center.

export type DataLayerEcommerceEvent =
  | "view_item"
  | "add_to_cart"
  | "begin_checkout"
  | "purchase";

export interface DataLayerItem {
  item_id: string;
  item_name?: string;
  item_category?: string;
  price?: number;
  quantity?: number;
}

export interface DataLayerEcommerce {
  currency?: string;
  value?: number;
  transaction_id?: string;
  tax?: number;
  shipping?: number;
  items?: DataLayerItem[];
}

function money(value: number | undefined): number | undefined {
  if (value === undefined || Number.isNaN(value)) return undefined;
  return Math.round(value * 100) / 100;
}

function clean<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

/** Ecommerce-Event in den dataLayer pushen (inkl. Reset des ecommerce-Objekts). */
export function pushEcommerce(event: DataLayerEcommerceEvent, ecommerce: DataLayerEcommerce): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  const payload = clean({
    currency: ecommerce.currency ?? "EUR",
    value: money(ecommerce.value),
    transaction_id: ecommerce.transaction_id,
    tax: money(ecommerce.tax),
    shipping: money(ecommerce.shipping),
    items: ecommerce.items?.map((i) =>
      clean({
        item_id: i.item_id,
        item_name: i.item_name,
        item_category: i.item_category,
        price: money(i.price),
        quantity: i.quantity ?? 1,
      }),
    ),
  });
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({ event, ecommerce: payload });
}

/** Generisches Event ohne Ecommerce-Objekt (z.B. generate_lead). */
export function pushEvent(event: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}
