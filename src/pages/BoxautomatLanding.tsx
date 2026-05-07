import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  ShoppingCart, CheckCircle, Truck, Shield, Star, Quote,
  TrendingUp, Zap, Ruler, Award, MessageCircle, Phone, Package, BadgeCheck,
} from "lucide-react";
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

import { SHOPIFY_VARIANTS_BY_SLUG } from "@/lib/shopify";

const PRODUCT_SLUG = "boxautomat-premium";
const VARIANTS = SHOPIFY_VARIANTS_BY_SLUG[PRODUCT_SLUG];

const benefits = [
  { icon: TrendingUp, title: "Bis zu 1.500€/Monat", desc: "Hohe Einnahmen pro Aufstellort durch Highscore-Effekt." },
  { icon: Zap, title: "Sofort einsatzbereit", desc: "Plug & Play – einstecken, einschalten, verdienen." },
  { icon: Shield, title: "2 Jahre Garantie", desc: "Robuste Industriequalität für jahrelangen Dauerbetrieb." },
  { icon: Truck, title: "Versand in 24h", desc: "Europaweite Lieferung direkt zu Ihrem Standort." },
  { icon: Award, title: "Bewährte Technik", desc: "Über 500 verkaufte Boxautomaten in DACH." },
  { icon: CheckCircle, title: "Geldscheinakzeptor", desc: "5€, 10€, 20€ Scheine – mehr Umsatz pro Spiel." },
];

const testimonials = [
  { name: "Mehmet K.", role: "Späti-Besitzer, Berlin", text: "Der Boxautomat hat in der ersten Woche schon 380€ eingespielt. Verrückt!", rating: 5 },
  { name: "Sarah L.", role: "Bar-Inhaberin, Hamburg", text: "Unsere Gäste lieben das Teil. Jeden Abend Wartezeit am Automaten.", rating: 5 },
  { name: "Thomas R.", role: "Center-Manager, München", text: "Drei Monate – ROI erreicht. Bestelle jetzt einen zweiten.", rating: 5 },
];

const faqs = [
  { q: "Wie hoch ist der durchschnittliche Verdienst?", a: "Je nach Standort zwischen 400€ und 1.500€ pro Monat. Bars, Clubs und Einkaufszentren erzielen die höchsten Umsätze." },
  { q: "Wie lange dauert die Lieferung?", a: "Wir versenden innerhalb von 24h ab Bestellung. Lieferzeit DACH-Region: 2–4 Werktage." },
  { q: "Brauche ich eine spezielle Genehmigung?", a: "Nein. Boxautomaten sind reine Geschicklichkeitsspiele und benötigen keine Spielhallen-Erlaubnis." },
  { q: "Welche Garantie gibt es?", a: "Sie erhalten 2 Jahre Vollgarantie inkl. Ersatzteilversorgung und telefonischem Support." },
  { q: "Kann der Geldscheinakzeptor nachgerüstet werden?", a: "Ja, wir bieten den Akzeptor sowohl ab Werk als auch als Nachrüstkit an." },
];

const BoxautomatLanding = () => {
  const product = getProductBySlug(PRODUCT_SLUG)!;
  const addBySlug = useCartStore((s) => s.addBySlug);
  const cartLoading = useCartStore((s) => s.isLoading);
  const [variantIdx, setVariantIdx] = useState(1); // default: Münz- & Geldschein
  const selectedVariant = VARIANTS[variantIdx];
  const [coinPrice, setCoinPrice] = useState(2);
  const [playsPerDay, setPlaysPerDay] = useState(40);
  const roi = useMemo(() => {
    const monthly = coinPrice * playsPerDay * 30;
    const months = Math.max(1, Math.ceil(selectedVariant.price / monthly));
    return { monthly, months };
  }, [coinPrice, playsPerDay, selectedVariant.price]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Boxautomat Premium kaufen – ab 1.799€ netto | AutomatPlanet</title>
        <meta name="description" content="Boxautomat Premium in 2 Varianten: Münzfach (1.799€) oder Münz- & Geldscheinfach (1.949€). Bis zu 1.500€/Monat. Versand in 24h." />
        <link rel="canonical" href="https://automatplanet.de/produkte/boxautomat-premium" />
      </Helmet>

      <Navbar />

      {/* HERO */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-6">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span className="text-sm font-medium">Bestseller 2026 · 500+ verkauft</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Der Boxautomat, der sich <span className="text-primary">selbst bezahlt</span>.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Profi-Qualität – wahlweise mit oder ohne Geldscheinakzeptor. Bis zu 1.500€ Umsatz pro Monat – pro Standort.
              Versand in 24 Stunden, 2 Jahre Garantie.
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
                <a href="tel:051112282957">
                  <Phone className="mr-2" /> 0511 12282957
                </a>
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> Versand in 24h</div>
              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> 2 Jahre Garantie</div>
              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> Rechnung möglich</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PRODUCT / DIRECT BUY */}
      <section id="bestellen" className="py-20 bg-card/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto rounded-3xl border border-border bg-card p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              {/* Product image */}
              <div className="relative rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 p-6 flex items-center justify-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full max-w-sm aspect-[3/4] object-contain"
                  loading="lazy"
                />
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 fill-current" /> Bestseller
                </div>
              </div>

              {/* Product info */}
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{product.category}</div>
                <h2 className="text-3xl md:text-4xl font-bold mb-3">{product.name}</h2>
                <p className="text-muted-foreground mb-6">{product.description}</p>

                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex items-center gap-3"><Ruler className="w-4 h-4 text-primary" /><span>{product.dimensions}</span></div>
                  <div className="flex items-center gap-3"><Zap className="w-4 h-4 text-primary" /><span>{product.power}</span></div>
                  <div className="flex items-center gap-3"><Truck className="w-4 h-4 text-primary" /><span>Versand innerhalb 24h</span></div>
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
                          onClick={() => setVariantIdx(idx)}
                          className={`group rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                            active
                              ? "border-primary bg-primary/15 text-foreground shadow-neon"
                              : "border-border bg-background hover:border-primary/50"
                          }`}
                        >
                          <span className="font-semibold">{v.label}</span>
                          <span className={`ml-2 text-xs ${active ? "text-primary" : "text-muted-foreground"}`}>
                            {v.price.toLocaleString("de-DE")}€
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-5xl font-bold text-primary">
                    {selectedVariant.price.toLocaleString("de-DE")}€
                  </span>
                  <span className="text-muted-foreground">netto</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  {selectedVariant.label} · zzgl. MwSt. · inkl. Versand DACH
                </p>

                <Button
                  size="lg"
                  className="w-full text-base h-14"
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
                </Button>

                <WhatsAppConsultButton productName={`${product.name} – ${selectedVariant.label}`} className="w-full h-14 text-base mt-3" />


                <PaymentMethods className="mt-6" />
              </div>
            </div>

            {/* Trust elements */}
            <div className="mt-10 grid md:grid-cols-3 gap-3">
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


      {/* BENEFITS */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Warum dieser Boxautomat?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Sechs Gründe, warum Profis auf unser Modell setzen.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <b.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </motion.div>
            ))}
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
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-2xl border border-border bg-card p-6 relative">
                <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20" />
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mb-4 italic">"{t.text}"</p>
                <div>
                  <div className="font-bold">{t.name}</div>
                  <div className="text-sm text-muted-foreground">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI CALCULATOR */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto rounded-3xl border border-border bg-gradient-to-br from-primary/5 to-secondary/5 p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">ROI-Rechner</h2>
              <p className="text-muted-foreground">Wann hat sich Ihr Boxautomat amortisiert?</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-sm font-medium mb-3">
                  Preis pro Spiel: <span className="text-primary font-bold">{coinPrice}€</span>
                </label>
                <input type="range" min="1" max="5" step="0.5" value={coinPrice}
                  onChange={(e) => setCoinPrice(parseFloat(e.target.value))}
                  className="w-full accent-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-3">
                  Spiele pro Tag: <span className="text-primary font-bold">{playsPerDay}</span>
                </label>
                <input type="range" min="5" max="150" step="5" value={playsPerDay}
                  onChange={(e) => setPlaysPerDay(parseInt(e.target.value))}
                  className="w-full accent-primary" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-card border border-border p-6 text-center">
                <div className="text-sm text-muted-foreground mb-2">Monatlicher Umsatz</div>
                <div className="text-4xl font-bold text-primary">{roi.monthly.toLocaleString("de-DE")}€</div>
              </div>
              <div className="rounded-2xl bg-card border border-border p-6 text-center">
                <div className="text-sm text-muted-foreground mb-2">Amortisation</div>
                <div className="text-4xl font-bold text-secondary">{roi.months} Monate</div>
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

      <Footer />
    </div>
  );
};

export default BoxautomatLanding;
