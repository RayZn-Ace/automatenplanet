// Zentrale Preis-Logik: alle Preise in products.ts / shopify.ts sind NETTO (EUR).
// Für Google Shopping / Merchant Center muss der Bruttopreis prominent dargestellt werden.

export const VAT_RATE = 0.19;

/** Nettopreis -> Bruttopreis (inkl. 19% USt.), auf Cent gerundet. */
export const grossPrice = (net: number): number => Math.round(net * (1 + VAT_RATE) * 100) / 100;

/** Bruttopreis-Formatierung mit Cent, z.B. "2.319,31€" */
export const formatGross = (net: number): string =>
  grossPrice(net).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "€";

/** Nettopreis-Formatierung ohne Cent, z.B. "1.949€" */
export const formatNet = (net: number): string => {
  const whole = Math.abs(net - Math.round(net)) < 0.005;
  return (
    net.toLocaleString("de-DE", {
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: whole ? 0 : 2,
    }) + "€"
  );
};

/** Bruttopreis als reine Zahl-String für Feeds/JSON-LD, z.B. "2319.31" */
export const grossPriceValue = (net: number): string => grossPrice(net).toFixed(2);
