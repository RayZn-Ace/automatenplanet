import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  MessageCircle,
  Phone,
  Bot,
  ArrowRight,
  ArrowLeft,
  Check,
  Search,
  FileText,
  Truck,
  Wrench,
  LifeBuoy,
} from "lucide-react";
import AdvisorDialog from "@/components/AdvisorDialog";
import { trackContactClick } from "@/lib/contactTracking";
import {
  APPOINTMENT_TEXT,
  PHONE_DISPLAY,
  PHONE_HREF,
  whatsappHref,
} from "@/lib/supportContacts";

/**
 * Freiwilliger 6-Schritte-Ablauf. Rein informativ: keine Pflichtstrecke,
 * alle CTAs zeigen auf bereits bestehende Ziele.
 */

type Cta = { label: string; to?: string; href?: string; channel?: "whatsapp" | "phone" };

interface Step {
  icon: typeof Search;
  short: string;
  title: string;
  badge: string;
  bullets: string[];
  contact: { name: string; role: string; image: string };
  cta: Cta;
}

const DENNIS = { name: "Dennis P.", role: "Geschäftsführung", image: "/images/team/dennis-p.png" };
const UFUK = { name: "Ufuk C.", role: "Account Manager", image: "/images/team/ufuk-c.png" };
const KAY = { name: "Kay E.", role: "Technik & Service", image: "/images/team/kay-e.png" };
const RAPHAEL = { name: "Raphael K.", role: "Logistik", image: "/images/team/raphael-k.png" };

const steps: Step[] = [
  {
    icon: MessageCircle,
    short: "Beratung",
    title: "Beratung und Standortcheck",
    badge: "Freiwillig",
    bullets: [
      "Wir klären Zielgruppe, Stellfläche und Bezahlsystem.",
      "Du erfährst, welche Modelle für deinen Standort in Frage kommen.",
      "Direkt per WhatsApp oder Telefon - ohne Formularpflicht.",
    ],
    contact: RAPHAEL,
    cta: {
      label: "WhatsApp Beratung starten",
      href: whatsappHref("Ich komme von der Automatplanet Website und hätte gern eine Beratung."),
      channel: "whatsapp",
    },
  },
  {
    icon: Search,
    short: "Auswahl",
    title: "Automat auswählen",
    badge: "In deinem Tempo",
    bullets: [
      "Alle Modelle mit Maßen, Stromangabe und Nettopreis vergleichen.",
      "Varianten wie Münz- oder Scheineinwurf direkt auf der Produktseite wählen.",
      "Unsicher? Der Automaten-Berater filtert nach Standort, Platz und Budget.",
    ],
    contact: RAPHAEL,
    cta: { label: "Automaten entdecken", to: "/#produkte" },
  },
  {
    icon: FileText,
    short: "Angebot",
    title: "Angebot oder direkt kaufen",
    badge: "Beides möglich",
    bullets: [
      "Sofort online bestellen oder ein unverbindliches Angebot anfordern.",
      "Alle Preise netto, Versandkosten werden separat ausgewiesen.",
      "Finanzierungsmöglichkeiten klären wir individuell mit dir.",
    ],
    contact: DENNIS,
    cta: {
      label: "Finanzierung anfragen",
      href: whatsappHref(
        "Hallo, ich interessiere mich für einen Automaten und hätte gern Infos zu Finanzierungsmöglichkeiten."
      ),
      channel: "whatsapp",
    },
  },
  {
    icon: Truck,
    short: "Lieferung",
    title: "Lieferung ab Lager Hannover",
    badge: "2 bis 8 Werktage",
    bullets: [
      "Versand in der Regel innerhalb von 24 Stunden nach Zahlungseingang.",
      "Zustellung per Spedition, frei Bordsteinkante.",
      "Laufzeit je Zielland 2 bis 8 Werktage.",
    ],
    contact: RAPHAEL,
    cta: { label: "Versand und Lieferung", to: "/versand" },
  },
  {
    icon: Wrench,
    short: "Aufbau",
    title: "Aufbau und Inbetriebnahme",
    badge: "Mit Anleitung",
    bullets: [
      "Geräte kommen betriebsbereit oder mit überschaubarem Montageaufwand.",
      "Handbücher zu Einstellungen und Münzprüfer stehen online bereit.",
      "Bei Fragen begleiten wir die Inbetriebnahme telefonisch.",
    ],
    contact: KAY,
    cta: { label: "Handbücher ansehen", to: "/handbuch" },
  },
  {
    icon: LifeBuoy,
    short: "Support",
    title: "Betrieb und Support",
    badge: "Auch nach dem Kauf",
    bullets: [
      "Ansprechpartner für Technik, Ersatzteile und Einstellungen.",
      "Gewährleistungsfälle mit klarer Abwicklung.",
      "Erreichbar per Telefon, WhatsApp und E-Mail.",
    ],
    contact: KAY,
    cta: { label: "Zum Support-Bereich", to: "/support" },
  },
];

const PurchaseJourney = () => {
  const [active, setActive] = useState(0);
  const [advisorOpen, setAdvisorOpen] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduceMotion = useReducedMotion();
  const last = steps.length - 1;

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = index === last ? 0 : index + 1;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = index === 0 ? last : index - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = last;
    if (next !== null) {
      e.preventDefault();
      setActive(next);
      tabRefs.current[next]?.focus();
    }
  };

  const step = steps[active];
  const StepIcon = step.icon;

  return (
    <section id="ablauf" className="py-20 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">So läuft es ab</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold">
            In sechs Schritten zum eigenen Automaten
          </h2>
          <p className="mt-4 text-muted-foreground">
            Du kannst jeden Schritt nutzen - musst aber keinen. Wer direkt weiß, was er will, bestellt
            sofort online. Wer Fragen hat, bekommt bei jedem Schritt einen persönlichen Ansprechpartner.
          </p>
        </div>

        {/* Stepper: Desktop horizontal mit Verbindungslinie, Mobil als Raster */}
        <div
          role="tablist"
          aria-label="Schritte zum Automatenkauf"
          className="relative mt-10 grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[8.333%] right-[8.333%] top-5 hidden h-0.5 bg-border sm:block"
          />
          {steps.map((s, i) => {
            const selected = i === active;
            const done = i < active;
            return (
              <button
                key={s.title}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                id={`journey-tab-${i}`}
                aria-selected={selected}
                aria-controls="journey-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className="group relative z-10 flex flex-col items-center gap-2 rounded-2xl px-1 py-2 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : done
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground group-hover:border-primary/50"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span
                  className={`text-xs font-semibold leading-tight sm:text-sm ${
                    selected ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s.short}
                </span>
              </button>
            );
          })}
        </div>

        {/* Detailkarte */}
        <motion.div
          key={active}
          id="journey-panel"
          role="tabpanel"
          aria-labelledby={`journey-tab-${active}`}
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-6 rounded-3xl border border-border bg-card/60 p-5 md:p-8"
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-10">
            {/* Inhalt links */}
            <div>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <StepIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Schritt {active + 1} von {steps.length}
                  </p>
                  <h3 className="text-xl font-bold md:text-2xl">{step.title}</h3>
                </div>
              </div>

              <ul className="mt-5 space-y-3">
                {step.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-contact" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ansprechpartner rechts */}
            <div className="rounded-2xl border border-border bg-background p-5">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                {step.badge}
              </span>
              <div className="mt-4 flex items-center gap-3">
                <img
                  src={step.contact.image}
                  alt={`${step.contact.name} - Team AutomatPlanet`}
                  loading="lazy"
                  className="h-14 w-14 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold">{step.contact.name}</p>
                  <p className="text-xs text-muted-foreground">{step.contact.role}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">Dein Ansprechpartner in diesem Schritt.</p>

              {step.cta.to ? (
                <Link
                  to={step.cta.to}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {step.cta.label} <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <a
                  href={step.cta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    step.cta.channel &&
                    trackContactClick(step.cta.channel, {
                      label: step.cta.label,
                      placement: `journey_step_${active + 1}`,
                    })
                  }
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-contact px-5 py-3 text-sm font-bold text-contact-foreground transition-colors hover:bg-contact/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-contact focus-visible:ring-offset-2"
                >
                  <MessageCircle className="h-4 w-4" /> {step.cta.label}
                </a>
              )}
            </div>
          </div>

          {/* Navigation Zurück / X von 6 / Weiter */}
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-5">
            <button
              type="button"
              onClick={() => setActive((s) => Math.max(0, s - 1))}
              disabled={active === 0}
              aria-label="Vorheriger Schritt"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Zurück</span>
            </button>

            <p aria-live="polite" className="text-sm font-bold text-muted-foreground">
              {active + 1} / {steps.length}
            </p>

            <button
              type="button"
              onClick={() => setActive((s) => Math.min(last, s + 1))}
              disabled={active === last}
              aria-label="Nächster Schritt"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <span className="hidden sm:inline">Weiter</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        {/* Hilfe-Karte */}
        <div className="mt-8 rounded-3xl border border-border bg-background p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="lg:max-w-md">
              <h3 className="text-xl font-bold">Fragen zwischendurch?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Wähle den Weg, der dir am liebsten ist. Alles ist unverbindlich.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:ml-auto lg:min-w-[520px]">
              <a
                href={PHONE_HREF}
                onClick={() =>
                  trackContactClick("phone", { label: PHONE_DISPLAY, placement: "journey_help" })
                }
                className="flex flex-col items-start rounded-2xl border border-contact/40 p-4 transition-colors hover:bg-contact/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-contact focus-visible:ring-offset-2"
              >
                <Phone className="mb-2 h-5 w-5 text-contact" />
                <span className="text-sm font-bold">Experten anrufen</span>
                <span className="text-xs text-muted-foreground">{PHONE_DISPLAY}</span>
              </a>
              <a
                href={whatsappHref(APPOINTMENT_TEXT)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackContactClick("whatsapp", { label: "Termin vereinbaren", placement: "journey_help" })
                }
                className="flex flex-col items-start rounded-2xl border border-contact/40 p-4 transition-colors hover:bg-contact/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-contact focus-visible:ring-offset-2"
              >
                <MessageCircle className="mb-2 h-5 w-5 text-contact" />
                <span className="text-sm font-bold">Termin vereinbaren</span>
                <span className="text-xs text-muted-foreground">Per WhatsApp abstimmen</span>
              </a>
              <button
                type="button"
                onClick={() => setAdvisorOpen(true)}
                className="flex flex-col items-start rounded-2xl border border-border p-4 text-left transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Bot className="mb-2 h-5 w-5 text-primary" />
                <span className="text-sm font-bold">Automaten-Berater</span>
                <span className="text-xs text-muted-foreground">3 Fragen, sofort Vorschläge</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <AdvisorDialog open={advisorOpen} onOpenChange={setAdvisorOpen} />
    </section>
  );
};

export default PurchaseJourney;
