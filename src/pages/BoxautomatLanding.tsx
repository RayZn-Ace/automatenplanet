import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ShoppingCart, CheckCircle, Truck, Shield, Star, Quote,
  TrendingUp, Zap, Ruler, Award, MessageCircle, Phone, Send,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getProductBySlug } from "@/data/products";

const PRODUCT_SLUG = "boxautomat-mit-geldscheinakzeptor";

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
  const [coinPrice, setCoinPrice] = useState(2);
  const [playsPerDay, setPlaysPerDay] = useState(40);
  const roi = useMemo(() => {
    const monthly = coinPrice * playsPerDay * 30;
    const months = Math.max(1, Math.ceil(product.price / monthly));
    return { monthly, months };
  }, [coinPrice, playsPerDay, product.price]);

  const [form, setForm] = useState({ name: "", email: "", phone: "", quantity: "1", address: "" });

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      toast.error("Bitte Name, E-Mail und Telefon ausfüllen.");
      return;
    }
    toast.success("Bestellung eingegangen! Wir bestätigen innerhalb von 2 Stunden.");
    setForm({ name: "", email: "", phone: "", quantity: "1", address: "" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Boxautomat kaufen – Direktbestellung ab 1.949€ | AutomatPlanet</title>
        <meta name="description" content="Profi-Boxautomat mit Geldscheinakzeptor. Bis zu 1.500€/Monat. Versand in 24h. Jetzt direkt online bestellen." />
        <link rel="canonical" href="https://automatplanet.de/boxautomat" />
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
              Profi-Qualität mit Geldscheinakzeptor. Bis zu 1.500€ Umsatz pro Monat – pro Standort.
              Versand in 24 Stunden, 2 Jahre Garantie.
            </p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative mb-8 max-w-md mx-auto"
            >
              <ScrollFrameSequence
                framesBase="/boxautomat-frames/f"
                frameCount={87}
                ext="webp"
                width={360}
                height={480}
                alt={product.name}
                className="w-full aspect-[3/4]"
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
          <div className="max-w-5xl mx-auto rounded-3xl border border-border bg-card p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <h2 className="text-3xl font-bold mb-2">{product.name}</h2>
                <p className="text-muted-foreground mb-6">{product.description}</p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3"><Ruler className="w-5 h-5 text-primary" /><span>{product.dimensions}</span></div>
                  <div className="flex items-center gap-3"><Zap className="w-5 h-5 text-primary" /><span>{product.power}</span></div>
                  <div className="flex items-center gap-3"><Truck className="w-5 h-5 text-primary" /><span>Versand innerhalb 24h</span></div>
                </div>
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-5xl font-bold text-primary">{product.price.toLocaleString("de-DE")}€</span>
                  <span className="text-muted-foreground">netto</span>
                </div>
                <p className="text-sm text-muted-foreground">zzgl. MwSt. · inkl. Versand DACH</p>
              </div>

              <form onSubmit={handleOrder} className="space-y-4">
                <h3 className="text-xl font-bold mb-2">Direkt bestellen</h3>
                <Input placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Input type="email" placeholder="E-Mail *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <Input type="tel" placeholder="Telefon *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <Input type="number" min="1" placeholder="Menge" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                <Textarea placeholder="Lieferadresse" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={3} />
                <Button type="submit" size="lg" className="w-full">
                  <ShoppingCart className="mr-2" /> Verbindlich bestellen
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Wir bestätigen Ihre Bestellung innerhalb von 2 Stunden per E-Mail.
                </p>
              </form>
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
