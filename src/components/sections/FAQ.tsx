import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "Wie viel kostet ein Greifautomat?",
    a: "Unsere Greifautomaten starten ab 1.290€ für kompakte Modelle und gehen bis 4.990€ für Premium-Versionen mit LED-Beleuchtung und erweiterten Features. Kontaktieren Sie uns für ein individuelles Angebot.",
  },
  {
    q: "Wie viel Strom verbrauchen Arcade-Automaten?",
    a: "Die meisten unserer Automaten verbrauchen zwischen 100W und 300W. Das entspricht ca. 15–45€ Stromkosten pro Monat bei Dauerbetrieb – ein Bruchteil der Einnahmen.",
  },
  {
    q: "Wie profitabel sind Boxautomaten?",
    a: "Boxautomaten gehören zu den profitabelsten Arcade-Geräten. An guten Standorten erzielen sie 1.000–3.000€ Umsatz pro Monat. Die Investition amortisiert sich oft innerhalb von 2–4 Monaten.",
  },
  {
    q: "Können Automaten in Kiosken aufgestellt werden?",
    a: "Ja! Wir bieten kompakte Modelle speziell für Kioske und Spätis. Der Mini Claw Machine benötigt nur 45×45 cm Stellfläche und passt in fast jeden Laden.",
  },
  {
    q: "Bieten Sie Lieferung in ganz Deutschland an?",
    a: "Ja, wir liefern deutschlandweit und auch in ganz Europa. Aufstellung, Einweisung und technischer Support sind im Service enthalten.",
  },
  {
    q: "Gibt es Wartung und Support?",
    a: "Ja, wir bieten umfassenden technischen Support und Wartungsservice. Ersatzteile werden innerhalb von 24–48 Stunden geliefert.",
  },
  {
    q: "Kann ich Automaten auch mieten?",
    a: "Ja, wir bieten flexible Mietoptionen für Events, Messen und temporäre Einsätze. Kontaktieren Sie uns für Mietkonditionen.",
  },
  {
    q: "Welche Zahlungsmethoden akzeptieren die Automaten?",
    a: "Unsere Automaten akzeptieren Münzen (1€ und 2€). Auf Wunsch sind auch Modelle mit Kartenzahlung und kontaktloser Bezahlung erhältlich.",
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-24">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Häufige <span className="text-accent">Fragen</span>
          </h2>
          <p className="text-muted-foreground">Alles was Sie über Arcade-Automaten wissen müssen.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border border-white/10 rounded-xl px-6 bg-card/40 data-[state=open]:border-accent/30">
                <AccordionTrigger className="text-left hover:no-underline py-5 text-base">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;