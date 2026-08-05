// Prerender der Produktrouten: erzeugt nach `vite build` für jede Produkt-URL
// eine statische HTML-Datei mit echten Head-Tags (Title, Description, Canonical,
// OG/Twitter, Product-JSON-LD mit Bruttopreis) und einem crawlbaren Noscript-Block.
// Die SPA hydriert danach wie gewohnt in #root.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { products } from "../src/data/products";
import { VARIANTS_BY_SLUG } from "../src/lib/variants";
import { formatGross, formatNet, grossPriceValue } from "../src/lib/pricing";

const BASE_URL = "https://automatplanet.de";
const DIST = resolve("dist");
// Sicherheitsnetz gegen zu große Builds (Publish-Limit: 50.000 Dateien)
const MAX_PRERENDER_PAGES = 500;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

interface PrerenderPage {
  path: string;
  title: string;
  description: string;
  image: string;
  jsonLd: unknown;
  body: string;
}

function buildPage(slug: string): PrerenderPage {
  const product = products.find((p) => p.slug === slug)!;
  const variants = VARIANTS_BY_SLUG[slug];
  const url = `${BASE_URL}/produkte/${slug}`;

  const offers = variants
    ? variants.map((v) => ({
        "@type": "Offer",
        name: `${product.name} – ${v.label}`,
        url: `${url}?variante=${encodeURIComponent(v.label.toLowerCase().replace(/[^a-z0-9]+/gi, "-"))}`,
        priceCurrency: "EUR",
        price: grossPriceValue(v.price),
        valueAddedTaxIncluded: true,
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
      }))
    : [
        {
          "@type": "Offer",
          url,
          priceCurrency: "EUR",
          price: grossPriceValue(product.price),
          valueAddedTaxIncluded: true,
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
        },
      ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: `${BASE_URL}${product.image}`,
    url,
    sku: slug,
    category: product.category,
    brand: { "@type": "Brand", name: "AutomatPlanet" },
    offers: offers.length > 1 ? offers : offers[0],
  };

  const priceRows = (variants ?? [{ label: product.name, price: product.price }])
    .map(
      (v) =>
        `<li>${escapeHtml(v.label)}: <strong>${formatGross(v.price)}</strong> inkl. 19% MwSt. (${formatNet(
          v.price,
        )} netto) – zzgl. Versand</li>`,
    )
    .join("");

  const body = `
      <h1>${escapeHtml(product.name)} kaufen</h1>
      <p>${escapeHtml(product.description)}</p>
      <ul>${priceRows}</ul>
      <p>Verfügbarkeit: sofort lieferbar, Versand in 24h.</p>`;

  return {
    path: `produkte/${slug}`,
    title: product.metaTitle,
    description: product.metaDescription,
    image: `${BASE_URL}${product.image}`,
    jsonLd,
    body,
  };
}

function renderHtml(template: string, page: PrerenderPage): string {
  const url = `${BASE_URL}/${page.path}`;
  const head = [
    `<title>${escapeHtml(page.title)}</title>`,
    `<meta name="description" content="${escapeHtml(page.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="product" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${escapeHtml(page.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(page.description)}" />`,
    `<meta property="og:image" content="${page.image}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(page.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(page.description)}" />`,
    `<meta name="twitter:image" content="${page.image}" />`,
    `<script type="application/ld+json">${JSON.stringify(page.jsonLd)}</script>`,
  ].join("\n    ");

  let html = template
    // Sitewide Head-Tags entfernen, die pro Route überschrieben werden
    .replace(/<title>[\s\S]*?<\/title>/, "")
    .replace(/<meta name="description"[^>]*>/g, "")
    .replace(/<link rel="canonical"[^>]*>/g, "")
    .replace(/<meta property="og:(type|title|description|image|url)"[^>]*>/g, "")
    .replace(/<meta name="twitter:(card|title|description|image)"[^>]*>/g, "")
    .replace("</head>", `  ${head}\n  </head>`);

  html = html.replace(
    '<div id="root"></div>',
    `<div id="root"></div>\n    <noscript>${page.body}\n    </noscript>`,
  );

  return html;
}

const templatePath = resolve(DIST, "index.html");
if (!existsSync(templatePath)) {
  console.error("prerender: dist/index.html not found – run vite build first");
  process.exit(1);
}

const template = readFileSync(templatePath, "utf8");
const pages = products.slice(0, MAX_PRERENDER_PAGES).map((p) => buildPage(p.slug));

for (const page of pages) {
  const dir = resolve(DIST, page.path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, "index.html"), renderHtml(template, page));
}

console.log(`prerender: ${pages.length} Produktseiten geschrieben`);
