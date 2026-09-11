import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Truck, Wrench, FileText, LifeBuoy, ArrowRight, Building2 } from "lucide-react";

const services = [
  {
    icon: Truck,
    title: "Versand ab Lager Hannover",
    text: "Spedition frei Bordsteinkante, Versand in der Regel innerhalb von 24 Stunden nach Zahlungseingang.",
    to: "/versand",
    linkLabel: "Versanddetails",
  },
  {
    icon: Building2,
    title: "Showroom-Besichtigung",
    text: "Automaten auf 1.000 m² in Hannover ansehen - nach Terminvereinbarung.",
    to: "/#showroom",
    linkLabel: "Termin anfragen",
  },
  {
    icon: Wrench,
    title: "Aufbau & Inbetriebnahme",
    text: "Handbücher zu Einstellungen und Münzprüfer, telefonische Begleitung bei der Einrichtung.",
    to: "/handbuch",
    linkLabel: "Handbücher öffnen",
  },
  {
    icon: LifeBuoy,
    title: "Technik & Ersatzteile",
    text: "Fragen zu Technik, Einstellungen oder Ersatzteilen klären wir persönlich mit dir.",
    to: "/support",
    linkLabel: "Support-Bereich",
  },
  {
    icon: FileText,
    title: "Gewährleistung & Rückgabe",
    text: "Bedingungen und Ablauf transparent nachlesen - Verkauf ausschließlich an Unternehmer.",
    to: "/rueckgabe",
    linkLabel: "Bedingungen lesen",
  },
];

const ServiceCards = () => {
  const reduceMotion = useReducedMotion();
  return (
    <section id="service" className="py-20 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Service</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold">Wir begleiten dich vor und nach dem Kauf</h2>
          <p className="mt-4 text-muted-foreground">
            Von der Auswahl über die Lieferung bis zum laufenden Betrieb - alle Leistungen im Überblick.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.title}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={s.to}
                  className="group flex h-full flex-col rounded-3xl border border-border bg-card/60 p-6 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="text-lg font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    {s.linkLabel}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServiceCards;
