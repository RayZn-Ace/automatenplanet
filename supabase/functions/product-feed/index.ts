// Google Merchant Center Produkt-Feed (RSS 2.0 mit g:-Namespace).
//
// Das ist der Ersatz für die Shopify-Merchant-Center-Anbindung: Google ruft
// diese URL nach Zeitplan ab (Merchant Center -> Produkte -> Feeds -> Feed
// hinzufügen -> "Geplanter Abruf") und liest die Produkte direkt aus unserer
// Datenbank. Preise sind in der DB NETTO gespeichert; Merchant Center braucht
// den Endkundenpreis inkl. USt., daher wird hier auf brutto umgerechnet.
//
// Varianten werden als eigene Angebote ausgegeben und über item_group_id
// zusammengehalten, damit Google sie als ein Produkt mit Varianten versteht.

import { createClient } from "npm:@supabase/supabase-js@2";

const SITE = "https://automatplanet.de";
const VAT_RATE = 0.19;
const SHIPPING_NET = 150; // DE-Versand, netto (EUR)
const CURRENCY = "EUR";
const BRAND = "Automatplanet";

const gross = (net: number) => (Math.round(net * (1 + VAT_RATE) * 100) / 100).toFixed(2);

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Muss identisch zu src/lib/variants.ts variantSlug sein, damit der Link die Variante wirklich vorauswählt. */
function variantSlug(label: string): string {
  return label
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "");
}

function absolute(path: string): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return SITE + (path.startsWith("/") ? path : `/${path}`);
}

/** Google-Produktkategorie (Taxonomie-ID) je Shop-Kategorie. */
function googleCategory(category: string): string {
  const c = category.toLowerCase();
  if (c.includes("box")) return "1266"; // Toys & Games > Game Timers/Arcade Equipment
  return "1266";
}

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_net_cents: number;
  image: string;
  gallery: unknown;
  dimensions: string;
  power: string;
  category: string;
};

type VariantRow = {
  product_id: string;
  variant_id: string;
  label: string;
  description: string;
  price_net_cents: number;
  sort_order: number;
};

interface FeedItem {
  id: string;
  groupId: string;
  title: string;
  description: string;
  link: string;
  image: string;
  additionalImages: string[];
  priceNet: number;
  category: string;
}

function renderItem(item: FeedItem): string {
  const extra = item.additionalImages
    .slice(0, 10)
    .map((img) => `\n      <g:additional_image_link>${esc(img)}</g:additional_image_link>`)
    .join("");

  return `    <item>
      <g:id>${esc(item.id)}</g:id>
      <g:item_group_id>${esc(item.groupId)}</g:item_group_id>
      <title>${esc(item.title)}</title>
      <description>${esc(item.description)}</description>
      <link>${esc(item.link)}</link>
      <g:image_link>${esc(item.image)}</g:image_link>${extra}
      <g:availability>in_stock</g:availability>
      <g:condition>new</g:condition>
      <g:price>${gross(item.priceNet)} ${CURRENCY}</g:price>
      <g:brand>${esc(BRAND)}</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
      <g:google_product_category>${googleCategory(item.category)}</g:google_product_category>
      <g:product_type>${esc(item.category)}</g:product_type>
      <g:shipping>
        <g:country>DE</g:country>
        <g:service>Spedition</g:service>
        <g:price>${gross(SHIPPING_NET)} ${CURRENCY}</g:price>
      </g:shipping>
    </item>`;
}

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const [{ data: products, error: productError }, { data: variants, error: variantError }] =
    await Promise.all([
      supabase
        .from("products")
        .select(
          "id, slug, name, description, price_net_cents, image, gallery, dimensions, power, category",
        )
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("product_variants")
        .select("product_id, variant_id, label, description, price_net_cents, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
    ]);

  if (productError || variantError) {
    const message = productError?.message ?? variantError?.message ?? "unknown";
    console.error("product-feed query failed:", message);
    return new Response(`<?xml version="1.0"?><error>${esc(message)}</error>`, {
      status: 500,
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  }

  const variantsByProduct = new Map<string, VariantRow[]>();
  for (const v of (variants ?? []) as VariantRow[]) {
    const list = variantsByProduct.get(v.product_id) ?? [];
    list.push(v);
    variantsByProduct.set(v.product_id, list);
  }

  const items: FeedItem[] = [];

  for (const p of (products ?? []) as ProductRow[]) {
    const gallery = Array.isArray(p.gallery) ? (p.gallery as string[]) : [];
    const images = [p.image, ...gallery].filter(Boolean).map(absolute);
    const specs = [p.dimensions && `Maße: ${p.dimensions}`, p.power && `Anschluss: ${p.power}`]
      .filter(Boolean)
      .join(" · ");
    const baseDescription = [p.description, specs].filter(Boolean).join(" ");
    const link = `${SITE}/produkte/${p.slug}`;
    const productVariants = variantsByProduct.get(p.id) ?? [];

    if (productVariants.length === 0) {
      items.push({
        id: p.slug,
        groupId: p.slug,
        title: p.name,
        description: baseDescription,
        link,
        image: images[0] ?? "",
        additionalImages: images.slice(1),
        priceNet: p.price_net_cents / 100,
        category: p.category,
      });
      continue;
    }

    for (const v of productVariants) {
      const vSlug = v.label ? variantSlug(v.label) : v.variant_id;
      items.push({
        id: v.variant_id,
        groupId: p.slug,
        title: v.label ? `${p.name} – ${v.label}` : p.name,
        description: [baseDescription, v.description].filter(Boolean).join(" "),
        link: `${link}?variante=${encodeURIComponent(vSlug)}`,
        image: images[0] ?? "",
        additionalImages: images.slice(1),
        priceNet: v.price_net_cents / 100,
        category: p.category,
      });
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Automatplanet Produktfeed</title>
    <link>${SITE}</link>
    <description>Boxautomaten, Greifautomaten und Arcade-Automaten von Automatplanet</description>
${items.filter((i) => i.image).map(renderItem).join("\n")}
  </channel>
</rss>
`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=1800",
      "Access-Control-Allow-Origin": "*",
    },
  });
});
