import type { ProductData } from "./products";

/** Kategorie-Name der Ersatzteile (Datenbank + statischer Fallback). */
export const SPARE_PART_CATEGORY = "Ersatzteile";

/**
 * Ersatzteile aus dem Boxautomat-Shop. Preise NETTO in EUR (verbindlich,
 * identisch mit Datenbank und supabase/functions/_shared/catalog.ts).
 */
export const spareParts: ProductData[] = [
  {
    slug: "komplette-boxbirne",
    name: "Komplette Boxbirne",
    description: "Hochwertige Ersatz-Boxbirne für deinen Automaten.",
    highlights: ["Passend für alle Boxautomaten-Modelle", "Robustes Material", "Einfacher Austausch"],
    price: 117.64,
    image: "/images/ersatzteile/boxbirne.png",
    mpn: "AP-ERS-001",
  },
  {
    slug: "plastikball-ersatzteil",
    name: "Plastikball",
    description: "Robuster Plastikball als Ersatz für deinen Boxautomaten.",
    highlights: ["Langlebiges Material", "Originalpassform", "Sofort einsatzbereit"],
    price: 25.2,
    image: "/images/ersatzteile/plastikball.png",
    mpn: "AP-ERS-002",
  },
  {
    slug: "lederball-ersatzteil",
    name: "Lederball Ersatzteil",
    description: "Premium Lederball für ein authentisches Box-Erlebnis.",
    highlights: ["Echtes Leder", "Premium-Qualität", "Authentisches Boxgefühl"],
    price: 58.82,
    image: "/images/ersatzteile/lederball.png",
    mpn: "AP-ERS-003",
  },
  {
    slug: "muenzpruefer-ersatzteil",
    name: "Münzprüfer",
    description: "Zuverlässiger Münzprüfer für den Automaten-Betrieb.",
    highlights: ["Präzise Münzerkennung", "Einfache Montage", "Für Euro-Münzen kalibriert"],
    price: 33.61,
    image: "/images/ersatzteile/muenzpruefer.png",
    mpn: "AP-ERS-004",
  },
  {
    slug: "scheinwurf-unterhaltungsautomat",
    name: "Scheinwurf Unterhaltungsautomat",
    description: "Scheinwurf-Modul für Unterhaltungsautomaten.",
    highlights: ["Akzeptiert gängige Euro-Scheine", "Zuverlässige Prüfung", "Plug & Play Installation"],
    price: 168.06,
    image: "/images/ersatzteile/scheinwurf.png",
    mpn: "AP-ERS-005",
  },
  {
    slug: "schlagkraftsensor-mit-kabel",
    name: "Schlagkraftsensor mit Kabel",
    description: "Präziser Schlagkraftsensor inkl. Anschlusskabel.",
    highlights: ["Inklusive Anschlusskabel", "Hohe Messgenauigkeit", "Einfacher Austausch"],
    price: 84.03,
    image: "/images/ersatzteile/schlagkraftsensor.png",
    mpn: "AP-ERS-006",
  },
  {
    slug: "starterknopf-boxautomat",
    name: "Starterknopf Boxautomat",
    description: "Original-Starterknopf für deinen Boxautomaten.",
    highlights: ["Original-Ersatzteil", "Robuste Bauweise", "Direkter Austausch"],
    price: 25.2,
    image: "/images/ersatzteile/starterknopf.png",
    mpn: "AP-ERS-007",
  },
  {
    slug: "hauptplatine-boxautomat",
    name: "Hauptplatine Boxautomat",
    description: "Ersatz-Hauptplatine für die Steuerung deines Automaten.",
    highlights: ["Komplette Steuerungseinheit", "Plug & Play", "Für alle Modelle kompatibel"],
    price: 294.11,
    image: "/images/ersatzteile/hauptplatine.png",
    mpn: "AP-ERS-008",
  },
].map((p) => ({
  ...p,
  category: SPARE_PART_CATEGORY,
  keywords: [p.name, "Ersatzteil", "Boxautomat"],
  metaTitle: `${p.name} kaufen – Boxautomat Ersatzteil | AutomatPlanet`,
  metaDescription: `${p.description} ${p.highlights.join(", ")}.`,
  availability: "in_stock" as const,
}));

export const SPARE_PART_SLUGS = new Set(spareParts.map((p) => p.slug));

export const isSparePart = (p: { slug: string; category?: string }) =>
  p.category === SPARE_PART_CATEGORY || SPARE_PART_SLUGS.has(p.slug);

/** Kanonischer Pfad einer Produktseite. */
export const productPath = (p: { slug: string; category?: string }) =>
  isSparePart(p) ? `/ersatzteile/${p.slug}` : `/produkte/${p.slug}`;
