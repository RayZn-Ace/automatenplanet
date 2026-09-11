import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Search, Phone, MessageCircle, Mail, Bot, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdvisorDialog from "@/components/AdvisorDialog";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supportFaqs, supportFaqTopics } from "@/data/supportFaq";
import { trackContactClick } from "@/lib/contactTracking";
import {
  APPOINTMENT_TEXT,
  CONTACT_EMAIL,
  PHONE_DISPLAY,
  PHONE_HREF,
  mailtoHref,
  whatsappHref,
} from "@/lib/supportContacts";

const Support = () => {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<string>("Alle");
  const [advisorOpen, setAdvisorOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return supportFaqs.filter((f) => {
      const topicOk = topic === "Alle" || f.topic === topic;
      const queryOk = !q || `${f.q} ${f.a} ${f.topic}`.toLowerCase().includes(q);
      return topicOk && queryOk;
    });
  }, [query, topic]);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: supportFaqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <Helmet>
        <title>Support und Hilfe zu Automaten | AutomatPlanet</title>
        <meta
          name="description"
          content="Support von AutomatPlanet: Antworten zu Auswahl, Showroom, Lieferung, Aufbau, Technik und Gewährleistung. Persönlich erreichbar per Telefon, WhatsApp und E-Mail."
        />
        <link rel="canonical" href="https://automatplanet.de/support" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://automatplanet.de/support" />
        <meta property="og:title" content="Support und Hilfe zu Automaten | AutomatPlanet" />
        <meta
          property="og:description"
          content="Antworten zu Auswahl, Lieferung, Aufbau, Technik und Gewährleistung - plus persönlicher Kontakt."
        />
        <meta property="og:image" content="https://automatplanet.de/images/og/og-default.jpg" />
        <meta property="og:site_name" content="AutomatPlanet" />
        <meta name="twitter:card" content="summary" />
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-background pt-28 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Support</p>
            <h1 className="mt-2 text-3xl md:text-4xl font-bold">Hilfe und Antworten</h1>
            <p className="mt-4 text-muted-foreground">
              Suche nach einem Thema oder filtere nach Bereich. Findest du nichts Passendes, melde dich
              direkt bei uns - wir antworten persönlich.
            </p>
          </div>

          {/* Suche und Filter */}
          <div className="mt-8 max-w-3xl">
            <label htmlFor="support-search" className="sr-only">
              Support durchsuchen
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="support-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="z.B. Lieferung, Münzprüfer, Showroom"
                className="pl-9"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {supportFaqTopics.map((tp) => (
                <button
                  key={tp}
                  type="button"
                  onClick={() => setTopic(tp)}
                  aria-pressed={topic === tp}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    topic === tp
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {tp}
                </button>
              ))}
            </div>
          </div>

          {/* Ergebnisse */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-10">
            <div>
              <p aria-live="polite" className="text-sm text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? "Antwort" : "Antworten"} gefunden
              </p>
              {filtered.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-border p-6">
                  <p className="text-sm text-muted-foreground">
                    Dazu haben wir noch keinen Eintrag. Schreib uns per WhatsApp oder E-Mail - wir
                    beantworten deine Frage direkt.
                  </p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="mt-4">
                  {filtered.map((f) => (
                    <AccordionItem key={f.id} value={f.id}>
                      <AccordionTrigger className="text-left">
                        <span>
                          <span className="mr-2 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                            {f.topic}
                          </span>
                          <span className="text-sm font-semibold">{f.q}</span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        {f.a}
                        {f.links && (
                          <span className="mt-3 flex flex-wrap gap-3">
                            {f.links.map((l) => (
                              <Link key={l.to + l.label} to={l.to} className="text-primary underline">
                                {l.label}
                              </Link>
                            ))}
                          </span>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>

            {/* Kontakt */}
            <aside id="kontakt" className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-3xl border border-border bg-card/60 p-6">
                <h2 className="text-xl font-bold">Direkter Kontakt</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Nenne uns Modell, Bestellnummer und dein Anliegen - so können wir sofort helfen.
                </p>

                <div className="mt-5 space-y-3">
                  <a
                    href={PHONE_HREF}
                    onClick={() =>
                      trackContactClick("phone", { label: PHONE_DISPLAY, placement: "support_page" })
                    }
                    className="flex items-center gap-3 rounded-2xl bg-contact p-4 text-contact-foreground transition-colors hover:bg-contact/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-contact focus-visible:ring-offset-2"
                  >
                    <Phone className="h-5 w-5" />
                    <span>
                      <span className="block text-sm font-bold">Anrufen</span>
                      <span className="block text-sm opacity-90">{PHONE_DISPLAY}</span>
                    </span>
                  </a>
                  <a
                    href={whatsappHref("Ich komme von der Automatplanet Website und habe eine Frage: ")}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackContactClick("whatsapp", { label: "WhatsApp", placement: "support_page" })
                    }
                    className="flex items-center gap-3 rounded-2xl border border-contact/40 p-4 transition-colors hover:bg-contact/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-contact focus-visible:ring-offset-2"
                  >
                    <MessageCircle className="h-5 w-5 text-contact" />
                    <span>
                      <span className="block text-sm font-bold">WhatsApp schreiben</span>
                      <span className="block text-sm text-muted-foreground">Antwort im Chat</span>
                    </span>
                  </a>
                  <a
                    href={mailtoHref("Support-Anfrage über automatplanet.com")}
                    className="flex items-center gap-3 rounded-2xl border border-border p-4 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Mail className="h-5 w-5 text-primary" />
                    <span className="min-w-0">
                      <span className="block text-sm font-bold">E-Mail senden</span>
                      <span className="block truncate text-sm text-muted-foreground">{CONTACT_EMAIL}</span>
                    </span>
                  </a>
                  <a
                    href={whatsappHref(APPOINTMENT_TEXT)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackContactClick("whatsapp", {
                        label: "Termin vereinbaren",
                        placement: "support_page",
                      })
                    }
                    className="flex items-center gap-3 rounded-2xl border border-border p-4 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <span>
                      <span className="block text-sm font-bold">Termin vereinbaren</span>
                      <span className="block text-sm text-muted-foreground">Beratung oder Showroom</span>
                    </span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setAdvisorOpen(true)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-border p-4 text-left transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <Bot className="h-5 w-5 text-primary" />
                    <span>
                      <span className="block text-sm font-bold">Automaten-Berater</span>
                      <span className="block text-sm text-muted-foreground">Passende Modelle finden</span>
                    </span>
                  </button>
                </div>
              </div>

              <div className="mt-4 rounded-3xl border border-border p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider">Weiterführende Seiten</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {[
                    { label: "Versand und Lieferung", to: "/versand" },
                    { label: "Rückgabe und Gewährleistung", to: "/rueckgabe" },
                    { label: "Handbücher", to: "/handbuch" },
                    { label: "AGB", to: "/agb" },
                    { label: "Alle Automaten", to: "/#produkte" },
                  ].map((l) => (
                    <li key={l.to}>
                      <Link
                        to={l.to}
                        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                      >
                        {l.label} <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <AdvisorDialog open={advisorOpen} onOpenChange={setAdvisorOpen} />
      <Footer />
    </>
  );
};

export default Support;
