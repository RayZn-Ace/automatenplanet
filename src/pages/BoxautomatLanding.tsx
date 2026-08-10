import { useState, useMemo, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import ProductJsonLd from "@/components/seo/ProductJsonLd";
import { formatGross, formatNet, grossPriceValue } from "@/lib/pricing";

import { motion } from "framer-motion";
import {
  ShoppingCart, CheckCircle, Truck, Shield, Star, Quote,
  TrendingUp, Zap, Ruler, Award, MessageCircle, Phone, Package, BadgeCheck,
  Wrench, Move, Headphones, Euro,
} from "lucide-react";

const whyAutomatplanet = [
  { icon: Euro, title: "Günstigster Anbieter", desc: "Günstigster Anbieter in Deutschland - garantiert." },
  { icon: Shield, title: "Langlebig & wartungsarm", desc: "Unsere Automaten halten lange und brauchen kaum Service." },
  { icon: Wrench, title: "Alles reparierbar", desc: "Sollte mal etwas sein, haben wir alle Ersatzteile da, geben Support oder schicken einen Techniker vorbei." },
  { icon: Move, title: "Einfacher Transport", desc: "Mit den Rollen einfach bewegt – passt in jeden Kastenwagen. Gewicht: 125 kg." },
  { icon: Headphones, title: "24/7 WhatsApp-Support", desc: "Immer alle Ersatzteile auf Lager und persönlicher Support rund um die Uhr." },
  { icon: Truck, title: "Versand in 24h", desc: "Schnelle Lieferung direkt aus unserem Lager – europaweit." },
];
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getProductBySlug } from "@/data/products";
import ScrollFrameSequence from "@/components/ScrollFrameSequence";
import { useCartStore } from "@/stores/cartStore";
import WhatsAppConsultButton from "@/components/WhatsAppConsultButton";
import PaymentMethods from "@/components/PaymentMethods";
import { Loader2 } from "lucide-react";
import ProductImageGallery from "@/components/ProductImageGallery";
import { trackEvent } from "@/lib/tracking";

import { VARIANTS_BY_SLUG } from "@/lib/variants";

const PRODUCT_SLUG = "boxautomat-premium";
const GALLERY_IMAGES = [
  "/images/products/boxing-machine-new.png",
  "/images/products/boxing-machine.png",
  "/images/products/combo-boxing-machine.png",
];
const VARIANTS = VARIANTS_BY_SLUG[PRODUCT_SLUG];

const benefits = [
  { icon: TrendingUp, title: "Bis zu 1.500€/Monat", desc: "Hohe Einnahmen pro Aufstellort durch Highscore-Effekt." },
  { icon: Zap, title: "Sofort einsatzbereit", desc: "Plug & Play – einstecken, einschalten, verdienen." },
  { icon: Shield, title: "Robuste Industriequalität", desc: "Hochwertige Verarbeitung für jahrelangen Dauerbetrieb." },
  { icon: Truck, title: "Versand in 24h", desc: "Europaweite Lieferung direkt zu deinem Standort." },
  { icon: Award, title: "Bewährte Technik", desc: "Über 500 verkaufte Boxautomaten in DACH." },
  { icon: CheckCircle, title: "Geldscheinakzeptor", desc: "5€, 10€, 20€ Scheine – mehr Umsatz pro Spiel." },
];

import { testimonials } from "@/data/testimonials";


const faqs = [
  { q: "Wie hoch ist der durchschnittliche Verdienst?", a: "Je nach Standort zwischen 400€ und 1.500€ pro Monat. Bars, Clubs und Einkaufszentren erzielen die höchsten Umsätze." },
  { q: "Wie lange dauert die Lieferung?", a: "Wir versenden innerhalb von 24h ab Bestellung. Lieferzeit DACH-Region: 2–4 Werktage." },
  { q: "Brauche ich eine spezielle Genehmigung?", a: "Nein. Boxautomaten sind reine Geschicklichkeitsspiele und benötigen keine Spielhallen-Erlaubnis." },
  { q: "Welche Garantie gibt es?", a: "Du erhältst Gewährleistung gemäß gesetzlicher Vorgaben inkl. Ersatzteilversorgung und telefonischem Support." },
  { q: "Kann der Geldscheinakzeptor nachgerüstet werden?", a: "Ja, wir bieten den Akzeptor sowohl ab Werk als auch als Nachrüstkit an." },
];

const variantSlug = (label: string) =>
  label.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");

const BoxautomatLanding = () => {
  const product = getProductBySlug(PRODUCT_SLUG)!;
  const addBySlug = useCartStore((s) => s.addBySlug);
  const cartLoading = useCartStore((s) => s.isLoading);
  const [searchParams, setSearchParams] = useSearchParams();
  const variantParam = searchParams.get("variante");
  const paramIdx = VARIANTS.findIndex((v) => variantSlug(v.label) === variantParam);
  const [variantIdx, setVariantIdx] = useState(paramIdx >= 0 ? paramIdx : 1); // default: Münz- & Geldschein
  const selectedVariant = VARIANTS[variantIdx];

  // Variante <-> URL synchron halten (eigene, teilbare & indexierbare URL pro Variante)
  const selectVariant = (idx: number) => {
    setVariantIdx(idx);
    const next = new URLSearchParams(searchParams);
    next.set("variante", variantSlug(VARIANTS[idx].label));
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    if (paramIdx >= 0 && paramIdx !== variantIdx) setVariantIdx(paramIdx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramIdx]);

  const [coinPrice, setCoinPrice] = useState(2);
  const [playsPerDay, setPlaysPerDay] = useState(40);
  const roi = useMemo(() => {
    const monthly = coinPrice * playsPerDay * 30;
    const months = Math.max(1, Math.ceil(selectedVariant.price / monthly));
    return { monthly, months };
  }, [coinPrice, playsPerDay, selectedVariant.price]);

  useEffect(() => {
    trackEvent("view_content", {
      value: selectedVariant.price,
      currency: "EUR",
      contentName: product.name,
      contentType: "product",
      items: [{ id: PRODUCT_SLUG, name: product.name, price: selectedVariant.price, quantity: 1 }],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canonicalUrl = `https://automatplanet.de/produkte/${PRODUCT_SLUG}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Boxautomat Premium kaufen – ab {formatGross(VARIANTS[0].price)} inkl. MwSt. | AutomatPlanet</title>
        <meta name="description" content={`Boxautomat Premium in 2 Varianten: Münzfach (${formatGross(VARIANTS[0].price)}) oder Münz- & Geldscheinfach (${formatGross(VARIANTS[1].price)}) inkl. MwSt. Bis zu 1.500€/Monat. Versand in 24h.`} />
        <link rel="canonical" href={variantParam && paramIdx >= 0 ? `${canonicalUrl}?variante=${variantSlug(selectedVariant.label)}` : canonicalUrl} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="product:price:amount" content={grossPriceValue(selectedVariant.price)} />
        <meta property="product:price:currency" content="EUR" />
      </Helmet>
      <ProductJsonLd product={product} jsonLdOnly />


      <Navbar />

      {/* HERO */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto text-center">
            <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-6 text-center">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span className="text-sm font-medium">Bestseller 2026 · 500+ verkauft</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6 leading-tight break-words">
              Der günstigste Boxautomat Deutschlands, der sich <span className="text-primary">selbst bezahlt</span>.
            </h1>
            <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Profi-Qualität – wahlweise mit oder ohne Geldscheinakzeptor. Bis zu 1.500€ Umsatz pro Monat – pro Standort.
              Versand in 24 Stunden.
            </p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative mb-8 max-w-md mx-auto"
            >
              <video
                src="/boxautomat-loop.mp4"
                autoPlay
                loop
                muted
                playsInline
                disablePictureInPicture
                controls={false}
                aria-label={product.name}
                className="w-full aspect-[3/4] object-contain pointer-events-none"
              />
            </motion.div>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Button size="lg" asChild>
                <a href="#bestellen">
                  <ShoppingCart className="mr-2" /> Jetzt bestellen
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="tel:+4951112282957">
                  <Phone className="mr-2" /> 0511 12282957
                </a>
              </Button>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> Versand in 24h</div>
              <div className="flex items-center gap-2">
                <img
                  src="/klarna-badge.svg"
                  alt="Klarna Ratenzahlung"
                  className="h-8 w-auto bg-white rounded px-2 py-1"
                  loading="lazy"
                />
                <span>Ratenzahlung</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PRODUCT / DIRECT BUY */}
      <section id="bestellen" className="py-20 bg-card/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto rounded-3xl border border-border bg-card p-5 sm:p-8 md:p-12 overflow-hidden">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              {/* Product image gallery */}
              <ProductImageGallery
                images={GALLERY_IMAGES}
                alt={product.name}
                imageClassName="p-0"
                badge={
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold">
                    <Star className="w-3.5 h-3.5 fill-current" /> Bestseller
                  </div>
                }
              />

              {/* Product info */}
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{product.category}</div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 break-words">{product.name}</h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6 break-words">{product.description}</p>

                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex items-start gap-3"><CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" /><span>Passive Einnahmen mit Laufkundschaft</span></div>
                  <div className="flex items-start gap-3"><CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" /><span>Der Automat zahlt sich nach ⌀ 2–4 Monaten von selbst ab</span></div>
                  <div className="flex items-start gap-3"><CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" /><span>Kein Personal · kein Abo · kein Internet – anstecken und losboxen</span></div>
                </div>

                {/* Variant pills */}
                <div className="mb-5">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Variante wählen</div>
                  <div className="flex flex-wrap gap-2">
                    {VARIANTS.map((v, idx) => {
                      const active = idx === variantIdx;
                      return (
                        <button
                          key={v.variantId}
                          type="button"
                          onClick={() => selectVariant(idx)}
                          className={`group inline-flex w-full min-w-0 items-center justify-between gap-2 rounded-2xl border px-4 py-2 text-left text-sm font-medium transition-all sm:w-auto sm:rounded-full ${
                            active
                              ? "border-primary bg-primary/15 text-foreground shadow-neon"
                              : "border-border bg-background hover:border-primary/50"
                          }`}
                        >
                          <span className="min-w-0 font-semibold break-words">{v.label}</span>
                          <span className={`shrink-0 text-xs ${active ? "text-primary" : "text-muted-foreground"}`}>
                            {formatGross(v.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1 mb-1">
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary break-words">
                    {formatGross(selectedVariant.price)}
                  </span>
                  <span className="text-muted-foreground">inkl. 19% MwSt.</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6 break-words leading-relaxed">
                  {formatNet(selectedVariant.price)} netto · {selectedVariant.label} · zzgl. Versand (DE 150€)
                </p>


                <Button
                  size="lg"
                  className="w-full text-base h-14 relative overflow-hidden isolate"
                  onClick={() =>
                    addBySlug(PRODUCT_SLUG, 1, {
                      variantId: selectedVariant.variantId,
                      price: selectedVariant.price,
                      nameSuffix: selectedVariant.label,
                    })
                  }
                  disabled={cartLoading}
                >
                  {cartLoading
                    ? <><Loader2 className="mr-2 animate-spin" /> In den Warenkorb</>
                    : <><ShoppingCart className="mr-2" /> In den Warenkorb</>
                  }
                  {!cartLoading && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-button-shine"
                    />
                  )}
                </Button>

                <WhatsAppConsultButton productName={`${product.name} – ${selectedVariant.label}`} className="w-full text-base mt-3" />

                <p className="mt-3 text-xs text-muted-foreground text-center">
                  Es gelten unsere{" "}
                  <a
                    href="/downloads/agb-boxautomaten.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-foreground"
                  >
                    AGB für Boxautomaten
                  </a>
                  .
                </p>

                <PaymentMethods className="mt-6" />
              </div>
            </div>

            {/* Trust elements */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 rounded-xl bg-background/50 border border-border px-4 py-3">
                <Package className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm">Sicherer und schneller Versand aus Deutschland</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-background/50 border border-border px-4 py-3">
                <BadgeCheck className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm">12 Monate Gewährleistung auf technische Fehler</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-background/50 border border-border px-4 py-3">
                <MessageCircle className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm">Hochwertige Automaten und 24/7 WhatsApp-Support</span>
              </div>
            </div>

            {/* Mini reviews */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-border">
              <div className="flex -space-x-3">
                {[
                  "https://i.pravatar.cc/80?img=11",
                  "https://i.pravatar.cc/80?img=32",
                  "https://i.pravatar.cc/80?img=47",
                  "https://i.pravatar.cc/80?img=68",
                  "https://i.pravatar.cc/80?img=15",
                ].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`Kunde ${i + 1}`}
                    loading="lazy"
                    className="w-10 h-10 rounded-full border-2 border-card object-cover"
                  />
                ))}
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1 mb-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="text-sm font-semibold">Bereits 300+ zufriedene Kunden</div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* LOCATIONS */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Hier kannst du deinen Boxautomaten am besten aufstellen
              </h2>
            </div>

            {/* Desktop: 4-col grid */}
            <div className="hidden md:grid grid-cols-4 gap-4">
              {[
                { src: "/images/locations/kiosk.png", alt: "Boxautomat im Kiosk" },
                { src: "/images/locations/clubs.png", alt: "Boxautomat in Clubs" },
                { src: "/images/locations/gyms.png", alt: "Boxautomat im Gym" },
                { src: "/images/locations/freizeiteinrichtungen.png", alt: "Boxautomat in Freizeiteinrichtungen" },
              ].map((img) => (
                <div key={img.src} className="rounded-2xl overflow-hidden border border-border bg-card/40">
                  <img src={img.src} alt={img.alt} loading="lazy" className="w-full h-full object-cover aspect-[4/5]" />
                </div>
              ))}
            </div>

            {/* Mobile: infinite auto-scroll slider */}
            <div className="md:hidden relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
              <div className="flex gap-4 w-max animate-marquee-locations">
                {[...Array(2)].flatMap((_, dup) =>
                  [
                    { src: "/images/locations/kiosk.png", alt: "Boxautomat im Kiosk" },
                    { src: "/images/locations/clubs.png", alt: "Boxautomat in Clubs" },
                    { src: "/images/locations/gyms.png", alt: "Boxautomat im Gym" },
                    { src: "/images/locations/freizeiteinrichtungen.png", alt: "Boxautomat in Freizeiteinrichtungen" },
                  ].map((img, i) => (
                    <div
                      key={`${dup}-${i}`}
                      className="w-[70vw] max-w-[280px] shrink-0 rounded-2xl overflow-hidden border border-border bg-card/40"
                    >
                      <img src={img.src} alt={img.alt} loading="lazy" className="w-full h-full object-cover aspect-[4/5]" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto rounded-3xl border border-border bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden">
            <div className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-0 items-stretch">
              {/* Image - left on desktop, bottom on mobile */}
              <div className="order-last md:order-first relative flex items-end justify-center md:items-stretch min-h-[280px] md:min-h-0">
                <img
                  src="/boxautomat-closeup.png"
                  alt="Boxautomat Premium Close-up"
                  className="w-full h-full object-contain object-bottom md:object-left-bottom max-h-[480px] md:max-h-none"
                  loading="lazy"
                />
              </div>
              {/* Content */}
              <div className="p-6 md:p-10 lg:p-12 order-first md:order-last">
                <div className="mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold mb-3">Warum dieser Boxautomat?</h2>
                  <p className="text-muted-foreground">Sechs Gründe, warum Profis auf unser Modell setzen.</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {benefits.map((b, i) => (
                    <motion.div
                      key={b.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-5"
                    >
                      <h3 className="font-bold mb-1.5 text-sm flex items-center gap-2">
                        <b.icon className="w-4 h-4 text-primary shrink-0" />
                        {b.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">{b.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL QUOTE */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Quote className="w-10 h-10 text-primary mx-auto mb-6" />
            <blockquote className="text-2xl md:text-4xl font-bold leading-tight italic text-foreground">
              "500€ Umsatz am ersten Tag. Der Automat zieht Leute von alleine an."
            </blockquote>
            <p className="mt-6 text-base md:text-lg font-semibold text-muted-foreground">
              – Späti Gifhorn
            </p>
          </div>
        </div>
      </section>

      {/* WHY AUTOMATPLANET */}
      <section className="py-20 bg-white text-neutral-900">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* LEFT: Content */}
            <div className="text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-5">
                <BadgeCheck className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-neutral-900">Direkt vom Hersteller</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-neutral-900">
                Warum <span className="text-primary">AutomatPlanet</span>?
              </h2>
              <p className="text-neutral-600 text-base md:text-lg mb-8">
                Faire Preise, schneller Versand und persönlicher Support – wir liefern Profi-Automaten ohne Umwege.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {whyAutomatplanet.map((b, i) => (
                  <motion.div
                    key={b.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <b.icon className="w-5 h-5 text-primary shrink-0" />
                      <h3 className="font-bold text-sm text-neutral-900">{b.title}</h3>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed">{b.desc}</p>
                  </motion.div>
                ))}
              </div>

              <WhatsAppConsultButton
                productName="AutomatPlanet Beratung"
                label="Jetzt beraten lassen"
                className="h-12 px-6 text-base"
              />
              <div className="mt-5 flex items-center gap-3">
                <img
                  src="/kay-engelmann.jpg"
                  alt="Kay Engelmann"
                  loading="lazy"
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary/40"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://i.pravatar.cc/96?img=12"; }}
                />
                <div>
                  <div className="text-xs text-neutral-500 uppercase tracking-wider">Dein Ansprechpartner</div>
                  <div className="text-sm font-semibold text-neutral-900">Kay Engelmann</div>
                </div>
              </div>
            </div>

            {/* RIGHT: Scattered polaroid-style gallery */}
            <div className="relative h-[600px] md:h-[680px] hidden lg:block">
              {/* Main hero image - portrait */}
              <motion.div
                initial={{ opacity: 0, y: 20, rotate: -3 }}
                whileInView={{ opacity: 1, y: 0, rotate: -3 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="absolute top-4 left-2 w-[55%] bg-white p-3 pb-10 rounded-sm shadow-2xl ring-1 ring-black/5 z-10"
              >
                <div className="aspect-[3/4] overflow-hidden bg-neutral-100">
                  <img src="/why-slide-2.jpg" alt="AutomatPlanet Werkstatt" loading="lazy" className="w-full h-full object-cover" />
                </div>
              </motion.div>

              {/* Top right - landscape */}
              <motion.div
                initial={{ opacity: 0, y: 20, rotate: 4 }}
                whileInView={{ opacity: 1, y: 0, rotate: 4 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="absolute top-0 right-0 w-[50%] bg-white p-3 pb-10 rounded-sm shadow-2xl ring-1 ring-black/5 z-20"
              >
                <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
                  <img src="/why-slide-1.jpg" alt="AutomatPlanet Produktion" loading="lazy" className="w-full h-full object-cover" />
                </div>
              </motion.div>

              {/* Mid right - square-ish */}
              <motion.div
                initial={{ opacity: 0, y: 20, rotate: -2 }}
                whileInView={{ opacity: 1, y: 0, rotate: -2 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="absolute top-[44%] right-4 w-[42%] bg-white p-3 pb-10 rounded-sm shadow-2xl ring-1 ring-black/5 z-30"
              >
                <div className="aspect-square overflow-hidden bg-neutral-100">
                  <img src="/why-slide-3.jpg" alt="AutomatPlanet Lager" loading="lazy" className="w-full h-full object-cover" />
                </div>
              </motion.div>

              {/* Bottom left - small landscape */}
              <motion.div
                initial={{ opacity: 0, y: 20, rotate: 5 }}
                whileInView={{ opacity: 1, y: 0, rotate: 5 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="absolute bottom-0 left-[20%] w-[42%] bg-white p-3 pb-10 rounded-sm shadow-2xl ring-1 ring-black/5 z-40"
              >
                <div className="aspect-[5/4] overflow-hidden bg-neutral-100">
                  <img src="/why-slide-4.jpg" alt="AutomatPlanet Team" loading="lazy" className="w-full h-full object-cover" />
                </div>
              </motion.div>
            </div>

            {/* Mobile: simple polaroid gallery */}
            <div className="grid grid-cols-2 gap-5 px-2 py-4 lg:hidden">
              {[
                { src: "/why-slide-2.jpg", rot: "-rotate-2" },
                { src: "/why-slide-1.jpg", rot: "rotate-2" },
                { src: "/why-slide-3.jpg", rot: "rotate-1" },
                { src: "/why-slide-4.jpg", rot: "-rotate-1" },
              ].map((p, i) => (
                <div key={i} className={`bg-white p-2 pb-6 rounded-sm shadow-xl ring-1 ring-black/5 ${p.rot}`}>
                  <div className="aspect-square overflow-hidden bg-neutral-100">
                    <img src={p.src} alt="" loading="lazy" className="w-full h-full object-cover" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">4,9 / 5 aus 312 Bewertungen</h2>
            <p className="text-muted-foreground">Was unsere Kunden sagen</p>
          </div>
          <div
            className="relative overflow-hidden"
            style={{
              maskImage:
                "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            }}
          >
            <style>{`
              @keyframes boxautomat-marquee {
                from { transform: translateX(0); }
                to { transform: translateX(-50%); }
              }
            `}</style>
            <div
              className="flex gap-6 w-max"
              style={{
                animation: "boxautomat-marquee 60s linear infinite",
              }}
            >
              {[...testimonials, ...testimonials].map((t, i) => (
                <div
                  key={`${t.name}-${i}`}
                  className="w-[320px] md:w-[360px] shrink-0 rounded-2xl border border-border bg-card p-6 relative"
                >
                  <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20" />
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="mb-4 italic text-sm">"{t.text}"</p>
                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <div className="font-bold">{t.name}</div>
                      <div className="text-sm text-muted-foreground">{t.role}</div>
                    </div>
                    {t.verified && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80 shrink-0">
                        <BadgeCheck className="w-3 h-3 text-primary/70" />
                        <span>Verifiziert</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ROI CALCULATOR */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto rounded-3xl border border-border bg-gradient-to-br from-primary/5 to-secondary/5 p-5 sm:p-8 md:p-12 overflow-hidden">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Wann hat sich der Automat von selbst bezahlt?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Stell einfach ein, wie viel ein Spiel kostet und wie oft am Tag jemand spielt. Du siehst sofort, wie viel du im Monat verdienst – und nach wie vielen Monaten der Automat sich selbst bezahlt hat.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-sm font-medium mb-3">
                  Was kostet ein Spiel? <span className="text-primary font-bold">{coinPrice}€</span>
                </label>
                <input type="range" min="1" max="5" step="0.5" value={coinPrice}
                  onChange={(e) => setCoinPrice(parseFloat(e.target.value))}
                  className="w-full accent-primary" />
                <p className="text-xs text-muted-foreground mt-2">Üblich sind 1–2 € pro Spiel.</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-3">
                  Wie viele spielen pro Tag? <span className="text-primary font-bold">{playsPerDay}</span>
                </label>
                <input type="range" min="5" max="150" step="5" value={playsPerDay}
                  onChange={(e) => setPlaysPerDay(parseInt(e.target.value))}
                  className="w-full accent-primary" />
                <p className="text-xs text-muted-foreground mt-2">In Bars & Spätis oft 30–80 Spiele am Tag.</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-card border border-border p-6 text-center">
                <div className="text-sm text-muted-foreground mb-2">Das verdienst du pro Monat</div>
                <div className="text-3xl sm:text-4xl font-bold text-primary break-words">{roi.monthly.toLocaleString("de-DE")}€</div>
              </div>
              <div className="rounded-2xl bg-card border border-border p-6 text-center">
                <div className="text-sm text-muted-foreground mb-2">Nach so vielen Monaten ist er bezahlt</div>
                <div className="text-3xl sm:text-4xl font-bold text-secondary break-words">{roi.months} Monate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Häufige Fragen</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="rounded-xl border border-border bg-card px-6">
                  <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="text-center mt-12">
              <Button size="lg" asChild>
                <a href="#bestellen"><ShoppingCart className="mr-2" /> Jetzt bestellen</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 py-6 text-center text-xs text-muted-foreground">
        <a
          href="/downloads/agb-boxautomaten.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          AGB für Boxautomaten (PDF)
        </a>
      </div>

      <Footer />
    </div>
  );
};

export default BoxautomatLanding;
