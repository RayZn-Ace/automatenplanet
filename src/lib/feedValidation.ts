// Validierung der Produktdaten gegen die Anforderungen des Google-Merchant-Feeds.
//
// Die Regeln spiegeln bewusst supabase/functions/product-feed/index.ts: Was hier
// als Fehler markiert wird, würde im Merchant Center zu einer Ablehnung führen;
// Warnungen sind Dinge, die Google toleriert, aber die Performance kosten.

export type IssueLevel = "error" | "warning";

export interface FeedIssue {
  level: IssueLevel;
  field: string;
  message: string;
}

export type GtinStatus = "valid" | "invalid" | "missing";

export interface FeedEntry {
  /** g:id im Feed */
  id: string;
  /** g:item_group_id im Feed */
  groupId: string;
  productSlug: string;
  title: string;
  link: string;
  isVariant: boolean;
  variantLabel: string;
  priceNet: number;
  gtin: string;
  gtinStatus: GtinStatus;
  mpn: string;
  identifierExists: boolean;
  image: string;
  isActive: boolean;
  issues: FeedIssue[];
}

export interface ValidationInputProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_net_cents: number;
  image: string;
  gallery?: unknown;
  dimensions?: string;
  power?: string;
  category: string;
  gtin?: string | null;
  mpn?: string | null;
  is_active: boolean;
}

export interface ValidationInputVariant {
  id: string;
  product_id: string;
  variant_id: string;
  label: string;
  description: string;
  price_net_cents: number;
  gtin?: string | null;
  mpn?: string | null;
  is_active: boolean;
  sort_order: number;
}

export const SITE = "https://automatplanet.de";
export const MAX_TITLE = 150;
export const MAX_DESCRIPTION = 5000;
export const MIN_DESCRIPTION = 40;

/** Muss identisch zu src/lib/variants.ts / product-feed sein. */
export function variantSlug(label: string): string {
  return label
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "");
}

/** GS1-Prüfziffer für GTIN-8/12/13/14. */
export function isValidGtin(raw: string): boolean {
  const digits = raw.replace(/[^0-9]/g, "");
  if (![8, 12, 13, 14].includes(digits.length)) return false;
  const body = digits.slice(0, -1).split("").reverse();
  const check = Number(digits.slice(-1));
  let sum = 0;
  body.forEach((d, i) => {
    sum += Number(d) * (i % 2 === 0 ? 3 : 1);
  });
  return (10 - (sum % 10)) % 10 === check;
}

export function gtinStatus(raw: string | null | undefined): GtinStatus {
  const value = (raw ?? "").trim();
  if (!value) return "missing";
  return isValidGtin(value) ? "valid" : "invalid";
}

function checkCommon(entry: {
  title: string;
  description: string;
  image: string;
  priceNet: number;
  category: string;
  gtinRaw: string;
  mpn: string;
  link: string;
}): FeedIssue[] {
  const issues: FeedIssue[] = [];

  if (!entry.title.trim()) {
    issues.push({ level: "error", field: "title", message: "Titel fehlt (Pflichtfeld)." });
  } else if (entry.title.length > MAX_TITLE) {
    issues.push({
      level: "error",
      field: "title",
      message: `Titel ist ${entry.title.length} Zeichen lang, Google erlaubt max. ${MAX_TITLE}.`,
    });
  }

  const description = entry.description.trim();
  if (!description) {
    issues.push({ level: "error", field: "description", message: "Beschreibung fehlt (Pflichtfeld)." });
  } else if (description.length > MAX_DESCRIPTION) {
    issues.push({
      level: "error",
      field: "description",
      message: `Beschreibung ist ${description.length} Zeichen lang, max. ${MAX_DESCRIPTION}.`,
    });
  } else if (description.length < MIN_DESCRIPTION) {
    issues.push({
      level: "warning",
      field: "description",
      message: "Beschreibung ist sehr kurz – mehr Details verbessern die Ausspielung.",
    });
  }

  if (!entry.image.trim()) {
    issues.push({
      level: "error",
      field: "image_link",
      message: "Bild fehlt – Angebote ohne Bild werden vom Feed ausgeschlossen.",
    });
  } else if (!/^https?:\/\//i.test(entry.image) && !entry.image.startsWith("/")) {
    issues.push({
      level: "error",
      field: "image_link",
      message: "Bild-Pfad muss absolut sein (mit / beginnen) oder eine vollständige URL.",
    });
  }

  if (!(entry.priceNet > 0)) {
    issues.push({ level: "error", field: "price", message: "Preis fehlt oder ist 0." });
  }

  if (!entry.category.trim()) {
    issues.push({
      level: "warning",
      field: "product_type",
      message: "Kategorie fehlt – Google-Produktkategorie wird nur pauschal zugeordnet.",
    });
  }

  const status = gtinStatus(entry.gtinRaw);
  if (status === "invalid") {
    issues.push({
      level: "error",
      field: "gtin",
      message: "GTIN/EAN ist ungültig (Länge oder Prüfziffer stimmt nicht).",
    });
  } else if (status === "missing" && !entry.mpn.trim()) {
    issues.push({
      level: "warning",
      field: "gtin",
      message: "Keine GTIN/EAN und keine MPN – Feed sendet identifier_exists=no.",
    });
  }

  if (!entry.link.startsWith(SITE)) {
    issues.push({ level: "error", field: "link", message: "Produkt-Link zeigt nicht auf die Live-Domain." });
  }

  return issues;
}

export function validateFeed(
  products: ValidationInputProduct[],
  variants: ValidationInputVariant[],
): FeedEntry[] {
  const byProduct = new Map<string, ValidationInputVariant[]>();
  for (const v of variants) {
    const list = byProduct.get(v.product_id) ?? [];
    list.push(v);
    byProduct.set(v.product_id, list);
  }

  const entries: FeedEntry[] = [];
  const seenIds = new Map<string, number>();

  for (const p of products) {
    const specs = [p.dimensions && `Maße: ${p.dimensions}`, p.power && `Anschluss: ${p.power}`]
      .filter(Boolean)
      .join(" · ");
    const baseDescription = [p.description, specs].filter(Boolean).join(" ");
    const link = `${SITE}/produkte/${p.slug}`;
    const productVariants = (byProduct.get(p.id) ?? [])
      .filter((v) => v.is_active)
      .sort((a, b) => a.sort_order - b.sort_order);

    const push = (entry: Omit<FeedEntry, "issues" | "gtinStatus" | "identifierExists">, gtinRaw: string) => {
      const status = gtinStatus(gtinRaw);
      const issues = checkCommon({
        title: entry.title,
        description: baseDescription,
        image: p.image,
        priceNet: entry.priceNet,
        category: p.category,
        gtinRaw,
        mpn: entry.mpn,
        link: entry.link,
      });
      if (!p.is_active) {
        issues.push({
          level: "warning",
          field: "availability",
          message: "Produkt ist inaktiv und erscheint nicht im Feed.",
        });
      }
      entries.push({
        ...entry,
        gtinStatus: status,
        identifierExists: status === "valid" || Boolean(entry.mpn.trim()),
        issues,
      });
      seenIds.set(entry.id, (seenIds.get(entry.id) ?? 0) + 1);
    };

    if (productVariants.length === 0) {
      push(
        {
          id: p.slug,
          groupId: p.slug,
          productSlug: p.slug,
          title: p.name,
          link,
          isVariant: false,
          variantLabel: "",
          priceNet: p.price_net_cents / 100,
          gtin: (p.gtin ?? "").trim(),
          mpn: (p.mpn ?? "").trim(),
          image: p.image,
          isActive: p.is_active,
        },
        p.gtin ?? "",
      );
      continue;
    }

    for (const v of productVariants) {
      const gtin = (v.gtin || p.gtin || "").trim();
      const vSlug = v.label ? variantSlug(v.label) : v.variant_id;
      push(
        {
          id: v.variant_id,
          groupId: p.slug,
          productSlug: p.slug,
          title: v.label ? `${p.name} – ${v.label}` : p.name,
          link: `${link}?variante=${encodeURIComponent(vSlug)}`,
          isVariant: true,
          variantLabel: v.label,
          priceNet: v.price_net_cents / 100,
          gtin,
          mpn: (v.mpn || p.mpn || "").trim(),
          image: p.image,
          isActive: p.is_active && v.is_active,
        },
        gtin,
      );
    }
  }

  // Doppelte Feed-IDs sind ein harter Fehler: Google überschreibt sich sonst selbst.
  for (const entry of entries) {
    if ((seenIds.get(entry.id) ?? 0) > 1) {
      entry.issues.push({ level: "error", field: "id", message: `Feed-ID „${entry.id}“ kommt mehrfach vor.` });
    }
  }

  // Gleiche GTIN auf mehreren Angeboten ist ebenfalls nicht erlaubt.
  const gtinCount = new Map<string, number>();
  for (const e of entries) {
    if (e.gtinStatus === "valid") gtinCount.set(e.gtin, (gtinCount.get(e.gtin) ?? 0) + 1);
  }
  for (const e of entries) {
    if (e.gtinStatus === "valid" && (gtinCount.get(e.gtin) ?? 0) > 1) {
      e.issues.push({
        level: "error",
        field: "gtin",
        message: "Diese GTIN ist mehreren Angeboten zugewiesen.",
      });
    }
  }

  return entries;
}

export interface FeedSummary {
  total: number;
  inFeed: number;
  withErrors: number;
  withWarnings: number;
  gtinValid: number;
  gtinInvalid: number;
  gtinMissing: number;
}

export function summarize(entries: FeedEntry[]): FeedSummary {
  return {
    total: entries.length,
    inFeed: entries.filter((e) => e.isActive && e.image && e.priceNet > 0).length,
    withErrors: entries.filter((e) => e.issues.some((i) => i.level === "error")).length,
    withWarnings: entries.filter(
      (e) => !e.issues.some((i) => i.level === "error") && e.issues.some((i) => i.level === "warning"),
    ).length,
    gtinValid: entries.filter((e) => e.gtinStatus === "valid").length,
    gtinInvalid: entries.filter((e) => e.gtinStatus === "invalid").length,
    gtinMissing: entries.filter((e) => e.gtinStatus === "missing").length,
  };
}
