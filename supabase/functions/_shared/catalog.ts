// Serverseitiger Produktkatalog (Quelle der Wahrheit für Preise beim Checkout).
// Preise sind NETTO in Cent. Muss mit src/data/products.ts + src/lib/variants.ts übereinstimmen.

export interface CatalogEntry {
  slug: string;
  name: string;
  variantLabel: string;
  priceNetCents: number;
}

const simple: Array<[string, string, number]> = [
  ["greifautomat", "Greifautomat", 2249],
  ["comboboxautomat", "Comboboxautomat mit Münz- und Scheineinwurf", 2999],
  ["basketball-machine", "Basketball Machine", 2999],
  ["air-hockey-table", "Air Hockey Table", 2999],
  ["arcade-machine", "Arcade Machine", 1999],
  ["pink-date-machine", "Pink Date Machine", 2299],
  ["lucky-7-machine", "Lucky 7 Machine", 2499],
  ["elektronischer-hau-den-lukas", 'Electronic "Hau den Lukas"', 1999],
  ["air-hockey", "Air Hockey", 3499],
  ["air-hockey-premium", "Air Hockey Premium", 4999],
  ["basketball-arcade", "Basketball Arcade", 2999],
  ["champions-league-tischkicker", "Champions League Foosball Table", 1499],
  ["billardtisch-muenzeinwurf", "Billardtisch mit Münzeinwurf", 2499],
  ["kinderkarussell", "Kids Carousel", 4999],
  ["parfuem-automat", "Perfume Vending Machine", 1999],
  ["snack-automat", "Snack Vending Machine", 6999],
  ["furby-car", "Furby Car", 1999],
  ["helicopter-ride", "Helicopter Ride", 1999],
  ["electric-dino-ride", "Electric Dino Ride", 1999],
];

export const CATALOG: Record<string, CatalogEntry> = {
  "boxautomat-premium--nur-muenzfach": {
    slug: "boxautomat-premium",
    name: "Boxautomat Premium",
    variantLabel: "Nur Münzfach",
    priceNetCents: 179900,
  },
  "boxautomat-premium--muenz-geldscheinfach": {
    slug: "boxautomat-premium",
    name: "Boxautomat Premium",
    variantLabel: "Münz- & Geldscheinfach",
    priceNetCents: 194900,
  },
  "boxautomat-premium--standard": {
    slug: "boxautomat-premium",
    name: "Boxautomat Premium",
    variantLabel: "Nur Münzfach",
    priceNetCents: 179900,
  },
};

for (const [slug, name, price] of simple) {
  CATALOG[`${slug}--standard`] = {
    slug,
    name,
    variantLabel: "",
    priceNetCents: price * 100,
  };
}

// Ersatzteile (Boxautomat-Shop). Preise netto in Cent.
const spareParts: Array<[string, string, number]> = [
  ["komplette-boxbirne", "Komplette Boxbirne", 11764],
  ["plastikball-ersatzteil", "Plastikball", 2520],
  ["lederball-ersatzteil", "Lederball Ersatzteil", 5882],
  ["muenzpruefer-ersatzteil", "Münzprüfer", 3361],
  ["scheinwurf-unterhaltungsautomat", "Scheinwurf Unterhaltungsautomat", 16806],
  ["schlagkraftsensor-mit-kabel", "Schlagkraftsensor mit Kabel", 8403],
  ["starterknopf-boxautomat", "Starterknopf Boxautomat", 2520],
  ["hauptplatine-boxautomat", "Hauptplatine Boxautomat", 29411],
];

export const SPARE_PART_SLUGS = new Set(spareParts.map(([slug]) => slug));

for (const [slug, name, cents] of spareParts) {
  CATALOG[`${slug}--standard`] = { slug, name, variantLabel: "", priceNetCents: cents };
}

/** Reine Ersatzteilbestellung (keine Versandpauschale). */
export const isSparePartsOnly = (slugs: string[]) =>
  slugs.length > 0 && slugs.every((s) => SPARE_PART_SLUGS.has(s));

export const VAT_RATE = 0.19;

export const SHIPPING_NET_CENTS: Record<string, number> = {
  DE: 15000,
  AT: 25000,
  NL: 25000,
  BE: 25000,
  LU: 25000,
  FR: 29000,
  PL: 25000,
  CZ: 25000,
  DK: 29000,
  IT: 32000,
  ES: 35000,
  CH: 39000,
};

export const shippingNetCents = (country: string) => SHIPPING_NET_CENTS[country] ?? 35000;

/** Versand fuer einen Warenkorb: 0 bei reinen Ersatzteilen, sonst Landespauschale. */
export const cartShippingNetCents = (country: string, slugs: string[]) =>
  isSparePartsOnly(slugs) ? 0 : shippingNetCents(country);
