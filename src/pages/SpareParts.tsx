import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronRight, Package, Truck, Wrench } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PhoneBanner from "@/components/sections/PhoneBanner";
import SparePartBuy from "@/components/SparePartBuy";
import { useCatalog } from "@/hooks/useCatalog";
import { useI18n } from "@/lib/i18n";
import { formatGross, formatNet } from "@/lib/pricing";

const SITE = "https://automatplanet.de";

const SpareParts = () => {
  const { spareParts } = useCatalog();
  const { lang } = useI18n();
  const de = lang === "de";
  const title = de ? "Ersatzteile für Boxautomaten kaufen | AutomatPlanet" : "Boxing machine spare parts | AutomatPlanet";
  const description = de
    ? "Ersatzteile für Boxautomaten: Boxbirne, Bälle, Münzprüfer, Scheinwurf, Schlagkraftsensor, Starterknopf und Hauptplatine. In der Regel auf Lager und schnell lieferbar."
    : "Spare parts for boxing machines: punching bag, balls, coin validator, bill acceptor, force sensor, start button and main board.";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${SITE}/ersatzteile`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`${SITE}/ersatzteile`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <Navbar />
      <div className="pt-20">
        <PhoneBanner />
      </div>

      <div className="pt-6 pb-2">
        <div className="container mx-auto px-4 md:px-6">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">{de ? "Ersatzteile" : "Spare parts"}</span>
          </nav>
        </div>
      </div>

      <section className="pb-20 pt-6">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold tracking-wide uppercase mb-4">
              <Wrench className="w-3.5 h-3.5" /> {de ? "Ersatzteile" : "Spare parts"}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
              {de ? "Ersatzteile für deinen Boxautomaten" : "Spare parts for your boxing machine"}
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              {de
                ? "Originale Ersatzteile direkt bestellen. In der Regel auf Lager und schnell lieferbar."
                : "Order spare parts directly. Usually in stock and quickly available."}
            </p>
            <div className="flex flex-wrap gap-3 mt-5 text-sm">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-1.5">
                <Package className="w-4 h-4 text-primary" /> {de ? "In der Regel auf Lager" : "Usually in stock"}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-1.5">
                <Truck className="w-4 h-4 text-primary" />
                {de ? "Reine Ersatzteilbestellungen ohne Versandkosten" : "No shipping costs for spare-part-only orders"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {spareParts.map((p) => (
              <article key={p.slug} className="rounded-2xl border border-border bg-card/60 overflow-hidden flex flex-col">
                <Link to={`/ersatzteile/${p.slug}`} className="block">
                  <div className="h-56 p-4 flex items-center justify-center bg-card">
                    <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-contain" />
                  </div>
                </Link>
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <h2 className="text-lg font-bold leading-tight">
                    <Link to={`/ersatzteile/${p.slug}`} className="hover:text-primary transition-colors">{p.name}</Link>
                  </h2>
                  <p className="text-sm text-muted-foreground">{p.description}</p>
                  {p.highlights && (
                    <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
                      {p.highlights.map((h) => <li key={h}>{h}</li>)}
                    </ul>
                  )}
                  <div className="mt-auto pt-2">
                    <p className="text-2xl font-black text-primary">{formatGross(p.price)}</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      {de ? "inkl. 19% MwSt." : "incl. 19% VAT"} · {formatNet(p.price)} {de ? "netto" : "net"}
                    </p>
                    <SparePartBuy part={p} compact />
                  </div>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-10 text-sm text-muted-foreground">
            {de ? "Passender Automat gesucht? " : "Looking for the machine? "}
            <Link to="/produkte/boxautomat-premium" className="text-primary font-semibold hover:underline">
              {de ? "Zum Boxautomat Premium" : "Boxautomat Premium"}
            </Link>
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default SpareParts;
