// Produktvarianten (eigenes System, unabhängig von Shopify).
// Alle Preise sind NETTO in EUR.

export interface VariantOption {
  /** Stabile, eigene Varianten-ID: `<slug>--<variant-slug>` */
  variantId: string;
  label: string;
  price: number;
  description?: string;
}

export const variantSlug = (label: string) =>
  label
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "");

export const VARIANTS_BY_SLUG: Record<string, VariantOption[]> = {
  "boxautomat-premium": [
    {
      variantId: "boxautomat-premium--nur-muenzfach",
      label: "Nur Münzfach",
      price: 1799,
      description: "Münzbetrieb",
    },
    {
      variantId: "boxautomat-premium--muenz-geldscheinfach",
      label: "Münz- & Geldscheinfach",
      price: 1949,
      description: "Münzen + Scheine (5/10/20€)",
    },
  ],
};

/** Standard-Varianten-ID für Produkte ohne echte Varianten. */
export const defaultVariantId = (slug: string) => `${slug}--standard`;
