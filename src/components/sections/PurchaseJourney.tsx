import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Phone,
  Bot,
  ArrowRight,
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
    title: "Beratung und Standortcheck",
    badge: "Freiwillig",
    bullets: [
      "Wir klären Zielgruppe, Stellfläche und Bezahlsystem.",
      "Du erfährst, welche Modelle für deinen Standort in Frage kommen.",
      "Direkt per WhatsApp oder Telefon - ohne Formularpflicht.",
    ],
    contact: UFUK,
    cta: {
      label: "WhatsApp Beratung starten",
      href: whatsappHref("Ich komme von der Automatplanet Website und hätte gern eine Beratung."),
      channel: "whatsapp",
    },
  },
  {
    icon: Search,
    title: "Automat auswählen",
    badge: "In deinem Tempo",
    bullets: [
      "Alle Modelle mit Maßen, Stromangabe und Nettopreis vergleichen.",
      "Varianten wie Münz- oder Scheineinwurf direkt auf der Produktseite wählen.",
      "Unsicher? Der Automaten-Berater filtert nach Standort, Platz und Budget.",
    ],
    contact: UFUK,
    cta: { label: "Automaten entdecken", to: "/#produkte" },
  },
  {
    icon: FileText,
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

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const last = steps.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = index === last ? 0 : index + 1;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = index === 0 ? last : index - 1;
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

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-6 lg:gap-10">
          {/* Schritte */}
          <div role="tablist" aria-label="Schritte zum Automatenkauf" className="space-y-2">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const selected = i === active;
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
                  className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background hover:border-primary/40"
                  }`}
                >
                  <span
                    className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                      selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold leading-snug">{s.title}</span>
                    <span className="block text-xs text-muted-foreground">{s.badge}</span>
                  </span>
                  <Icon
                    className={`ml-auto h-4 w-4 shrink-0 ${selected ? "text-primary" : "text-muted-foreground"}`}
                  />
                </button>
              );
            })}
          </div>

          {/* Detail */}
          <motion.div
            key={active}
            id="journey-panel"
            role="tabpanel"
            aria-labelledby={`journey-tab-${active}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-3xl border border-border bg-card/60 p-6 md:p-8"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <StepIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Schritt {active + 1} von {steps.length}
                </p>
                <h3 className="text-xl font-bold">{step.title}</h3>
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

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <img
                  src={step.contact.image}
                  alt={`${step.contact.name} - Team AutomatPlanet`}
                  loading="lazy"
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-bold">{step.contact.name}</p>
                  <p className="text-xs text-muted-foreground">{step.contact.role}</p>
                </div>
              </div>

              {step.cta.to ? (
                <Link
                  to={step.cta.to}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 sm:ml-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-contact px-5 py-3 text-sm font-bold text-contact-foreground transition-colors hover:bg-contact/90 sm:ml-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-contact focus-visible:ring-offset-2"
                >
                  <MessageCircle className="h-4 w-4" /> {step.cta.label}
                </a>
              )}
            </div>
          </motion.div>
        </div>

        {/* Hilfe-CTA */}
        <div className="mt-10 rounded-3xl border border-border bg-background p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="lg:max-w-md">
              <h3 className="text-xl font-bold">Du weißt nicht, welcher Automat passt?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Wähle den Weg, der dir am liebsten ist. Alles ist unverbindlich.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:ml-auto lg:min-w-[520px]">
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
