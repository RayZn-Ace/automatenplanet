import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HandbuchPdfDownload from "@/components/handbuch/HandbuchPdfDownload";
import HandbuchPdfPreview from "@/components/handbuch/HandbuchPdfPreview";
import HandbuchTableOfContents from "@/components/handbuch/HandbuchTableOfContents";
import HandbuchAnchorHeading from "@/components/handbuch/HandbuchAnchorHeading";
import {
  HANDBUCH_BOXAUTOMAT_FAQ,
  HANDBUCH_BOXAUTOMAT_META,
  HANDBUCH_BOXAUTOMAT_SECTIONS,
  type HandbuchBlock,
  type HandbuchSection,
} from "@/data/handbuchBoxautomat";
import { HANDBUCH_IMAGE_ASSETS } from "@/data/handbuchAssets";

const PAGE_URL = HANDBUCH_BOXAUTOMAT_META.url;
const PAGE_TITLE =
  "Boxautomat Handbuch – Box & Kick Maschine | Anleitung, Wartung & Fehlerbehebung";
const PAGE_DESCRIPTION =
  "Offizielles Boxautomat Handbuch: Anleitung zur Box & Kick Maschine inkl. Aufbau, Inbetriebnahme, Münzprüfer, Wartung, Schlagball-Wechsel, Menüführung und Fehlerbehebung.";

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: HANDBUCH_BOXAUTOMAT_META.title,
  description: PAGE_DESCRIPTION,
  inLanguage: "de-DE",
  url: PAGE_URL,
  mainEntityOfPage: PAGE_URL,
  image: "https://automatplanet.de/images/og/og-default.jpg",
  datePublished: HANDBUCH_BOXAUTOMAT_META.lastUpdated,
  dateModified: HANDBUCH_BOXAUTOMAT_META.lastUpdated,
  about: {
    "@type": "Product",
    name: HANDBUCH_BOXAUTOMAT_META.product,
    sku: HANDBUCH_BOXAUTOMAT_META.articleNumber,
    brand: { "@type": "Brand", name: "AutomatPlanet" },
    category: "Unterhaltungsautomat / Boxautomat",
  },
  author: {
    "@type": "Organization",
    name: HANDBUCH_BOXAUTOMAT_META.publisher.name,
    url: "https://automatplanet.de",
  },
  publisher: {
    "@type": "Organization",
    name: "AutomatPlanet",
    url: "https://automatplanet.de",
  },
  keywords:
    "Boxautomat Handbuch, Box Maschine Anleitung, Kick Maschine, Schlagkraft Messgerät, Boxautomat Wartung, Boxautomat Fehlerbehebung, Münzprüfer, Schlagball wechseln, Boxautomat kaufen",
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HANDBUCH_BOXAUTOMAT_FAQ.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Startseite", item: "https://automatplanet.de/" },
    {
      "@type": "ListItem",
      position: 2,
      name: "Handbücher",
      item: "https://automatplanet.de/handbuch",
    },
    { "@type": "ListItem", position: 3, name: "Boxautomat", item: PAGE_URL },
  ],
};

const renderBlock = (block: HandbuchBlock, key: string) => {
  switch (block.type) {
    case "paragraph":
      return (
        <p key={key} className={block.emphasis ? "mt-3 font-semibold text-foreground" : "mt-3"}>
          {block.text}
        </p>
      );
    case "subheading":
      return (
        <h3 key={key} className="text-lg font-semibold text-foreground mt-4 mb-2">
          {block.text}
        </h3>
      );
    case "list":
      if (block.ordered) {
        return (
          <ol key={key} className="list-decimal pl-6 space-y-1">
            {block.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ol>
        );
      }
      return (
        <ul key={key} className="list-disc pl-6 space-y-1">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    case "callout": {
      const isWarning = block.variant === "warning";
      return (
        <div
          key={key}
          className={`mt-4 p-4 border-l-4 rounded ${
            isWarning
              ? "border-destructive bg-destructive/5"
              : "border-primary bg-primary/5"
          }`}
        >
          {block.title && <p className="font-semibold text-foreground">{block.title}</p>}
          {block.lines.length === 1 ? (
            <p className={isWarning ? "font-semibold text-foreground" : ""}>{block.lines[0]}</p>
          ) : (
            <ul className="list-disc pl-6 space-y-1">
              {block.lines.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          )}
        </div>
      );
    }
    case "table":
      return (
        <div key={key} className="overflow-x-auto">
          <table className="w-full text-left border border-border rounded">
            <tbody className="divide-y divide-white/10">
              {block.rows.map((row) => (
                <tr key={row.label}>
                  <th className="py-2 px-3 font-semibold text-foreground w-1/2">{row.label}</th>
                  <td className="py-2 px-3">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "image": {
      const asset = HANDBUCH_IMAGE_ASSETS[block.assetKey];
      if (!asset) return null;
      const widthPct = block.maxWidthPct ?? 100;
      return (
        <figure key={key} className="mt-5">
          <img
            src={asset.publicUrl}
            alt={block.alt}
            loading="lazy"
            decoding="async"
            className="rounded-lg border border-border shadow-md w-full h-auto bg-black/20"
            style={{ maxWidth: `${widthPct}%` }}
          />
          {block.caption && (
            <figcaption className="mt-2 text-sm text-muted-foreground italic">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    }
    default:
      return null;
  }
};

const renderSection = (section: HandbuchSection) => (
  <div key={section.id} id={section.id} className="scroll-mt-28">
    <HandbuchAnchorHeading anchorId={section.id}>
      {section.icon ? `${section.icon} ` : ""}
      {section.number}. {section.title}
    </HandbuchAnchorHeading>
    {section.blocks.map((block, i) => renderBlock(block, `${section.id}-${i}`))}
  </div>
);

const HandbuchBoxautomat = () => {
  return (
    <>
      <Helmet>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <meta
          name="keywords"
          content="Boxautomat Handbuch, Box Maschine Anleitung, Kick Maschine, Schlagkraft messen, Boxautomat Wartung, Boxautomat Fehlerbehebung, Münzprüfer reinigen, Schlagball wechseln, Boxautomat Bedienungsanleitung, Box & Kick Maschine"
        />
        <meta name="robots" content="index,follow,max-image-preview:large" />
        <meta name="author" content={HANDBUCH_BOXAUTOMAT_META.publisher.name} />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:type" content="article" />
        <meta property="og:locale" content="de_DE" />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESCRIPTION} />
        <meta property="og:image" content="https://automatplanet.de/images/og/og-default.jpg" />
        <meta property="og:site_name" content="AutomatPlanet" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={PAGE_DESCRIPTION} />
        <meta name="twitter:image" content="https://automatplanet.de/images/og/og-default.jpg" />
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>
      <Navbar />
      <main className="min-h-screen pt-28 pb-16 bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <header className="mb-10">
            <p className="text-sm uppercase tracking-widest text-primary mb-2">
              {HANDBUCH_BOXAUTOMAT_META.subtitle}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {HANDBUCH_BOXAUTOMAT_META.product}
            </h1>
            <div className="text-muted-foreground text-sm leading-relaxed">
              <p className="font-semibold text-foreground">
                {HANDBUCH_BOXAUTOMAT_META.publisher.name}
              </p>
              <p>{HANDBUCH_BOXAUTOMAT_META.publisher.address}</p>
              <p>
                📧{" "}
                <a
                  href={`mailto:${HANDBUCH_BOXAUTOMAT_META.publisher.email}`}
                  className="text-primary hover:underline"
                >
                  {HANDBUCH_BOXAUTOMAT_META.publisher.email}
                </a>
                {" "}· 🌐{" "}
                <a
                  href={`https://${HANDBUCH_BOXAUTOMAT_META.publisher.website}`}
                  className="text-primary hover:underline"
                >
                  {HANDBUCH_BOXAUTOMAT_META.publisher.website}
                </a>
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <HandbuchPdfDownload
                primaryUrl={HANDBUCH_BOXAUTOMAT_META.pdfPath}
                fileName="handbuch-boxautomat.pdf"
                ariaLabel="Handbuch Boxautomat als PDF herunterladen"
              >
                Handbuch als PDF herunterladen
              </HandbuchPdfDownload>
            </div>
          </header>

          <HandbuchTableOfContents
            sections={HANDBUCH_BOXAUTOMAT_SECTIONS}
            extraEntries={[
              {
                id: "faq",
                icon: "❓",
                label: "Häufig gestellte Fragen",
                keywords: HANDBUCH_BOXAUTOMAT_FAQ.map(
                  (f) => `${f.question} ${f.answer}`,
                ).join(" "),
              },
              {
                id: "support",
                icon: "📞",
                label: "Support",
                keywords: "Kontakt Hilfe E-Mail Telefon Service",
              },
              {
                id: "pdf-vorschau",
                icon: "👁️",
                label: "PDF Vorschau",
                keywords: "Vorschau Download PDF Dokument",
              },
            ]}
          />

          <section className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
            {HANDBUCH_BOXAUTOMAT_SECTIONS.map(renderSection)}

            <div id="faq" className="scroll-mt-28">
              <HandbuchAnchorHeading anchorId="faq">
                ❓ Häufig gestellte Fragen zum Boxautomat
              </HandbuchAnchorHeading>
              <p>
                Antworten auf die wichtigsten Fragen rund um die Box &amp; Kick Maschine – von der
                Wartung über die Fehlerbehebung bis zur Menüführung.
              </p>
              <div className="mt-4 space-y-4">
                {HANDBUCH_BOXAUTOMAT_FAQ.map((item) => (
                  <article
                    key={item.question}
                    className="rounded-lg border border-border bg-muted/40 p-4"
                    itemScope
                    itemType="https://schema.org/Question"
                  >
                    <h3 className="text-lg font-semibold text-foreground mb-2" itemProp="name">
                      {item.question}
                    </h3>
                    <div
                      itemScope
                      itemProp="acceptedAnswer"
                      itemType="https://schema.org/Answer"
                    >
                      <p itemProp="text">{item.answer}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div id="support" className="scroll-mt-28">
              <HandbuchAnchorHeading anchorId="support">📞 Support</HandbuchAnchorHeading>
              <p>Bei Fragen oder Problemen:</p>
              <p className="mt-2">
                <span className="font-semibold text-foreground">
                  {HANDBUCH_BOXAUTOMAT_META.publisher.name}
                </span>
                <br />
                📧{" "}
                <a
                  href={`mailto:${HANDBUCH_BOXAUTOMAT_META.publisher.email}`}
                  className="text-primary hover:underline"
                >
                  {HANDBUCH_BOXAUTOMAT_META.publisher.email}
                </a>
                <br />
                🌐{" "}
                <a
                  href={`https://${HANDBUCH_BOXAUTOMAT_META.publisher.website}`}
                  className="text-primary hover:underline"
                >
                  {HANDBUCH_BOXAUTOMAT_META.publisher.website}
                </a>
              </p>
            </div>
          </section>

          <HandbuchPdfPreview />
        </div>
      </main>
      <Footer />
    </>
  );
};

export default HandbuchBoxautomat;
