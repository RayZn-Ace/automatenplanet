import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { CheckCircle, ChevronRight, Package, Phone, Truck } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PhoneBanner from "@/components/sections/PhoneBanner";
import SparePartBuy from "@/components/SparePartBuy";
import PaymentMethods from "@/components/PaymentMethods";
import { Button } from "@/components/ui/button";
import { useCatalog } from "@/hooks/useCatalog";
import { spareParts as STATIC_PARTS } from "@/data/spareParts";
import { useI18n } from "@/lib/i18n";
import { formatGross, formatNet, grossPriceValue } from "@/lib/pricing";
import { trackEvent } from "@/lib/tracking";
import { track } from "@/lib/analytics";
import { trackContactClick } from "@/lib/contactTracking";

const SITE = "https://automatplanet.de";

const SparePartPage = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const { spareParts } = useCatalog();
  const part = spareParts.find((p) => p.slug === slug) ?? STATIC_PARTS.find((p) => p.slug === slug);
  const { lang } = useI18n();
  const de = lang === "de";

  useEffect(() => {
    if (!part) return;
    trackEvent("view_content", {
      value: part.price,
      currency: "EUR",
      contentName: part.name,
      contentType: "product",
      category: part.category,
      items: [{ id: part.slug, name: part.name, price: part.price, quantity: 1 }],
    });
    track("product_viewed", {
      question_id: part.slug,
      question_title: part.name,
      value_cents: Math.round(part.price * 100),
      currency: "EUR",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!part) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 pb-20 text-center">
          <h1 className="text-3xl font-bold mb-4">{de ? "Ersatzteil nicht gefunden" : "Spare part not found"}</h1>
          <Button asChild><Link to="/ersatzteile">{de ? "Alle Ersatzteile" : "All spare parts"}</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  const url = `${SITE}/ersatzteile/${part.slug}`;
  const title = `${part.name} ${de ? "kaufen – Boxautomat Ersatzteil" : "– boxing machine spare part"} | AutomatPlanet`;
  const others = spareParts.filter((p) => p.slug !== part.slug).slice(0, 4);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: part.name,
    description: part.description,
    image: `${SITE}${part.image}`,
    sku: part.mpn || part.slug,
    ...(part.mpn ? { mpn: part.mpn } : {}),
    brand: { "@type": "Brand", name: "AutomatPlanet" },
    category: part.category,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "EUR",
      price: grossPriceValue(part.price),
      availability:
        part.availability === "out_of_stock" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={part.metaDescription || part.description} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={part.description} />
        <meta property="og:image" content={`${SITE}${part.image}`} />
        <meta property="product:price:amount" content={grossPriceValue(part.price)} />
        <meta property="product:price:currency" content="EUR" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <Navbar />
      <div className="pt-20">
        <PhoneBanner />
      </div>

      <div className="pt-6 pb-2">
        <div className="container mx-auto px-4 md:px-6">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/ersatzteile" className="hover:text-primary transition-colors">{de ? "Ersatzteile" : "Spare parts"}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">{part.name}</span>
          </nav>
        </div>
      </div>

      <section className="pb-16 pt-4">
        <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <div className="rounded-2xl border border-border bg-card overflow-hidden h-[360px] md:h-[500px] p-6 flex items-center justify-center">
            <img src={part.image} alt={part.name} loading="eager" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold tracking-wide uppercase mb-4">
              {part.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight break-words">{part.name}</h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-6">{part.description}</p>
            {part.highlights && (
              <ul className="space-y-2 mb-6">
                {part.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" /> {h}
                  </li>
                ))}
              </ul>
            )}

            <div className="rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5 p-4 sm:p-6 mb-6">
              <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1">
                <span className="text-3xl sm:text-4xl font-black text-primary">{formatGross(part.price)}</span>
                <span className="text-muted-foreground text-sm font-medium">{de ? "inkl. 19% MwSt." : "incl. 19% VAT"}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatNet(part.price)} {de ? "netto" : "net"}
                {part.mpn && <> · {de ? "Art.-Nr." : "Item no."} {part.mpn}</>}
              </p>
              <div className="flex flex-wrap gap-2 mt-3 text-xs font-bold">
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-accent/15 text-accent">
                  <Package className="w-3.5 h-3.5" />
                  {part.availability === "out_of_stock"
                    ? de ? "Derzeit nicht verfügbar" : "Currently unavailable"
                    : de ? "In der Regel auf Lager und schnell lieferbar" : "Usually in stock and quickly available"}
                </span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground flex items-start gap-2">
                <Truck className="w-4 h-4 shrink-0" />
                {de
                  ? "Reine Ersatzteilbestellungen ohne Versandkosten. Zusammen mit einem Automaten gilt die Versandpauschale des Automaten."
                  : "No shipping costs for spare-part-only orders. Combined with a machine, the machine shipping rate applies."}{" "}
                <Link to="/versand" className="underline hover:text-primary">{de ? "Versand" : "Shipping"}</Link>
              </p>
            </div>

            <div className="mb-6"><SparePartBuy part={part} /></div>
            <PaymentMethods className="mb-6" />
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Phone className="w-4 h-4 text-primary" />
              {de ? "Fragen zum passenden Teil?" : "Questions about the right part?"}
              <a
                href="tel:+4951112282957"
                onClick={() => trackContactClick("phone", { label: "0511 12282957", productName: part.name, placement: "spare_part" })}
                className="text-primary font-bold hover:underline"
              >
                0511 12282957
              </a>
            </div>
          </div>
        </div>
      </section>

      {others.length > 0 && (
        <section className="py-14 border-t border-border">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-2xl font-bold mb-6">{de ? "Weitere Ersatzteile" : "More spare parts"}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {others.map((p) => (
                <Link key={p.slug} to={`/ersatzteile/${p.slug}`} className="rounded-xl border border-border bg-card/60 p-4 hover:border-primary/50 transition-colors">
                  <div className="h-32 flex items-center justify-center bg-card mb-3">
                    <img src={p.image} alt={p.name} loading="lazy" className="h-full object-contain" />
                  </div>
                  <p className="font-semibold text-sm">{p.name}</p>
                  <p className="text-primary font-bold">{formatGross(p.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      <Footer />
    </div>
  );
};

export default SparePartPage;
