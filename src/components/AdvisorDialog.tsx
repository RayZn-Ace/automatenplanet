import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bot, ArrowLeft, ArrowRight, RotateCcw, MessageCircle, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCatalog } from "@/hooks/useCatalog";
import { formatNet } from "@/lib/pricing";
import { trackContactClick } from "@/lib/contactTracking";
import { whatsappHref } from "@/lib/supportContacts";

/**
 * Automaten-Berater: Auswahl aus dem echten Katalog.
 * Budget und Stellflaeche sind harte Filter, der Standort bestimmt nur die Reihenfolge.
 */

type Option = { value: string; label: string; hint?: string };

const questions: { id: "location" | "space" | "budget"; title: string; options: Option[] }[] = [
  {
    id: "location",
    title: "Wo soll der Automat stehen?",
    options: [
      { value: "gastro", label: "Bar, Club oder Gastronomie" },
      { value: "fitness", label: "Fitnessstudio oder Verein" },
      { value: "kiosk", label: "Kiosk, Späti oder Ladenlokal" },
      { value: "freizeit", label: "Freizeitpark, Spielhalle oder Center" },
      { value: "sonstiges", label: "Etwas anderes" },
    ],
  },
  {
    id: "space",
    title: "Wie viel Stellfläche ist vorhanden?",
    options: [
      { value: "klein", label: "Wenig Platz", hint: "bis etwa 1 m² Grundfläche" },
      { value: "mittel", label: "Normale Fläche", hint: "etwa 1 bis 2 m²" },
      { value: "gross", label: "Viel Platz", hint: "mehr als 2 m²" },
    ],
  },
  {
    id: "budget",
    title: "Welches Budget planst du (netto)?",
    options: [
      { value: "low", label: "bis 2.000 €" },
      { value: "mid", label: "2.000 bis 3.500 €" },
      { value: "high", label: "über 3.500 €" },
      { value: "open", label: "Noch offen" },
    ],
  },
];

/** Kategorien exakt wie im Katalog. */
const categoryPreference: Record<string, string[]> = {
  gastro: ["Boxautomaten", "Tischspiele", "Arcade", "Kraftspiele", "Greifautomaten"],
  fitness: ["Boxautomaten", "Kraftspiele", "Basketball", "Verkaufsautomaten"],
  kiosk: ["Greifautomaten", "Verkaufsautomaten", "Arcade", "Boxautomaten"],
  freizeit: ["Kinderattraktionen", "Basketball", "Arcade", "Greifautomaten", "Tischspiele"],
  sonstiges: [],
};

const priceRange: Record<string, [number, number]> = {
  low: [0, 2000],
  mid: [2000, 3500],
  high: [3500, Number.MAX_SAFE_INTEGER],
  open: [0, Number.MAX_SAFE_INTEGER],
};

/** Grundflaeche in m^2 aus "B × T × H cm". Ohne verwertbare Angabe: null. */
const footprintM2 = (dimensions?: string): number | null => {
  if (!dimensions) return null;
  const nums = dimensions.match(/\d+(?:[.,]\d+)?/g)?.map((n) => Number(n.replace(",", "."))) ?? [];
  if (nums.length < 2) return null;
  const area = (nums[0] * nums[1]) / 10000;
  return area > 0 ? area : null;
};

const spaceLimit: Record<string, [number, number]> = {
  klein: [0, 1.0],
  mittel: [0, 2.2],
  gross: [0, Number.MAX_SAFE_INTEGER],
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AdvisorDialog = ({ open, onOpenChange }: Props) => {
  const { products } = useCatalog();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const isResult = step >= questions.length;

  const results = useMemo(() => {
    if (!isResult) return [];
    const prefs = categoryPreference[answers.location ?? "sonstiges"] ?? [];
    const [minPrice, maxPrice] = priceRange[answers.budget ?? "open"];
    const [, maxArea] = spaceLimit[answers.space ?? "gross"];

    // Harte Filter: Budget und bekannte Stellflaeche.
    const candidates = products.filter((p) => {
      if (p.price < minPrice || p.price > maxPrice) return false;
      const area = footprintM2(p.dimensions);
      if (area === null) return false; // ohne belegte Masse nicht als passend ausgeben
      return area <= maxArea;
    });

    // Standort bestimmt nur die Sortierung.
    return candidates
      .map((p) => {
        const idx = prefs.indexOf(p.category);
        return { p, rank: idx === -1 ? prefs.length : idx };
      })
      .sort((a, b) => a.rank - b.rank || a.p.price - b.p.price)
      .slice(0, 3)
      .map((s) => s.p);
  }, [isResult, answers, products]);

  const reset = () => {
    setStep(0);
    setAnswers({});
  };

  const close = () => {
    onOpenChange(false);
    reset();
  };

  const answerLabel = (id: string) =>
    questions.find((x) => x.id === id)?.options.find((o) => o.value === answers[id])?.label ?? "-";

  const summary = () =>
    `Standort: ${answerLabel("location")}, Platz: ${answerLabel("space")}, Budget: ${answerLabel("budget")}`;

  const consultText = results.length
    ? `Hallo, ich habe den Automaten-Berater genutzt. ${summary()}. Vorschläge: ${results
        .map((r) => r.name)
        .join(", ")}. Bitte beraten Sie mich dazu.`
    : `Hallo, ich habe den Automaten-Berater genutzt. ${summary()}. Dazu wurde nichts angezeigt - bitte beraten Sie mich persönlich.`;

  const current = questions[Math.min(step, questions.length - 1)];

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="max-w-lg max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" /> Automaten-Berater
          </DialogTitle>
          <DialogDescription>
            Drei kurze Fragen zu Standort, Platz und Budget. Entdecke passende Modelle.
          </DialogDescription>
        </DialogHeader>

        {!isResult ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Frage {step + 1} von {questions.length}
            </p>
            <h3 className="mt-1 mb-4 text-lg font-bold">{current.title}</h3>
            <div className="space-y-2">
              {current.options.map((o) => {
                const active = answers[current.id] === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => {
                      setAnswers((a) => ({ ...a, [current.id]: o.value }));
                      setStep((s) => s + 1);
                    }}
                    className={`w-full rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                      active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <span className="block text-sm font-semibold">{o.label}</span>
                    {o.hint && <span className="block text-xs text-muted-foreground">{o.hint}</span>}
                  </button>
                );
              })}
            </div>
            {step > 0 && (
              <Button variant="ghost" size="sm" className="mt-4" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft className="mr-1 h-4 w-4" /> Zurück
              </Button>
            )}
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground">{summary()}</p>

            {results.length === 0 ? (
              <div className="mt-3">
                <h3 className="text-lg font-bold">Dazu passt aktuell kein Modell</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Mit dieser Kombination aus Budget und Stellfläche finden wir im aktuellen Sortiment
                  keinen Automaten, den wir dir guten Gewissens empfehlen können. Sieh dir gern die{" "}
                  <Link to="/#produkte" onClick={close} className="text-primary underline">
                    gesamte Übersicht
                  </Link>{" "}
                  an oder lass dich persönlich beraten - oft finden wir gemeinsam doch eine Lösung.
                </p>
              </div>
            ) : (
              <>
                <h3 className="mt-2 mb-3 text-lg font-bold">
                  {results.length === 1 ? "Dieser Automat passt dazu" : "Diese Automaten passen dazu"}
                </h3>
                <ul className="space-y-2">
                  {results.map((p) => (
                    <li key={p.slug}>
                      <Link
                        to={`/produkte/${p.slug}`}
                        onClick={close}
                        className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <img src={p.image} alt={p.name} loading="lazy" className="h-14 w-14 object-contain" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">{p.name}</span>
                          <span className="block text-xs text-muted-foreground">
                            {formatNet(p.price)} netto{p.dimensions ? ` · ${p.dimensions}` : ""}
                          </span>
                        </span>
                        <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Die Maße sind die Gerätemaße. Für Bedienung und Sicherheitsabstand plane je nach Modell
                  zusätzliche Fläche ein - wir prüfen das gern mit dir.
                </p>
              </>
            )}

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <a
                href={whatsappHref(consultText)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackContactClick("whatsapp", {
                    label: "Persönlich beraten lassen",
                    placement: "advisor_dialog",
                  })
                }
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-contact px-4 py-3 text-sm font-bold text-contact-foreground transition-colors hover:bg-contact/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-contact focus-visible:ring-offset-2"
              >
                <MessageCircle className="h-4 w-4" /> Persönlich beraten lassen
              </a>
              <Button variant="outline" onClick={reset} className="sm:w-auto">
                <RotateCcw className="mr-2 h-4 w-4" /> Neu starten
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdvisorDialog;
