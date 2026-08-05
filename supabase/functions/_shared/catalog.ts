// Serverseitiger Produktkatalog (Quelle der Wahrheit für Preise beim Checkout).
// Preise sind NETTO in Cent. Muss mit src/data/products.ts + src/lib/variants.ts übereinstimmen.

export interface CatalogEntry {
  slug: string;
  name: string;
  variantLabel: string;
  priceNetCents: number;
}

const simple: Array<[string, string, number]> = [
  ["greifautomat", "Greifautomat", 2499],
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
