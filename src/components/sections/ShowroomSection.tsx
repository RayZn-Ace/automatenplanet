import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { Building2, Eye, Users, CalendarCheck, Phone } from "lucide-react";
import { trackContactClick } from "@/lib/contactTracking";
import {
  APPOINTMENT_TEXT,
  PHONE_DISPLAY,
  PHONE_HREF,
  SHOWROOM_AREA,
  SHOWROOM_CITY,
  whatsappHref,
} from "@/lib/supportContacts";

const points = [
  { icon: Eye, text: "Maschinen in Ruhe ansehen und ausprobieren" },
  { icon: Building2, text: `${SHOWROOM_AREA} Ausstellungs- und Lagerfläche in ${SHOWROOM_CITY}` },
  { icon: Users, text: "Persönliche Beratung durch unser Team vor Ort" },
  { icon: CalendarCheck, text: "Besichtigung nach Terminvereinbarung" },
];

const ShowroomSection = () => {
  const reduceMotion = useReducedMotion();
  return (
    <section id="showroom" className="py-20 md:py-24 bg-card/40 border-y border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Showroom</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold">
              Automaten live erleben - auf {SHOWROOM_AREA} in {SHOWROOM_CITY}
            </h2>
            <p className="mt-4 text-muted-foreground">
              Modelle direkt vergleichen, Größe und Verarbeitung selbst prüfen und offene Fragen im
              Gespräch klären. Eine Besichtigung ist nach Terminvereinbarung möglich - die genaue
              Adresse erhältst du mit der Terminbestätigung.
            </p>

            <ul className="mt-6 space-y-3">
              {points.map((p) => {
                const Icon = p.icon;
                return (
                  <li key={p.text} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm text-foreground">{p.text}</span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href={whatsappHref(`${APPOINTMENT_TEXT}(Showroom Hannover)`)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackContactClick("whatsapp", {
                    label: "Showroom-Termin vereinbaren",
                    placement: "showroom_section",
                  })
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <CalendarCheck className="h-4 w-4" /> Showroom-Termin vereinbaren
              </a>
              <a
                href={PHONE_HREF}
                onClick={() =>
                  trackContactClick("phone", { label: PHONE_DISPLAY, placement: "showroom_section" })
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-contact/40 px-6 py-3 text-sm font-bold text-foreground transition-colors hover:bg-contact/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-contact focus-visible:ring-offset-2"
              >
                <Phone className="h-4 w-4 text-contact" /> {PHONE_DISPLAY}
              </a>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Lieferung und Abholung laufen ebenfalls über unser Lager in Hannover -{" "}
              <Link to="/versand" className="text-primary underline">
                Details zu Versand und Lieferung
              </Link>
              .
            </p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-3xl border border-border bg-background"
          >
            <img
              src="/automatplanet-warehouse.jpg"
              alt={`Lager und Ausstellungsfläche von AutomatPlanet in ${SHOWROOM_CITY}`}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ShowroomSection;
