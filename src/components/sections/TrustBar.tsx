import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Globe2, Building2, Headphones, ShieldCheck, Star } from "lucide-react";

const items = [
  {
    icon: Globe2,
    title: "Kunden europaweit",
    text: "Wir liefern an gewerbliche Betreiber in ganz Europa.",
  },
  {
    icon: Building2,
    title: "1.000 m² Showroom in Hannover",
    text: "Automaten vor Ort ansehen und vergleichen.",
    to: "/#showroom",
  },
  {
    icon: Headphones,
    title: "Persönlicher Support",
    text: "Ansprechpartner auch nach dem Kauf.",
    to: "/support",
  },
  {
    icon: ShieldCheck,
    title: "Gewährleistung & Service",
    text: "Abwicklung und Bedingungen transparent nachlesen.",
    to: "/rueckgabe",
  },
  {
    icon: Star,
    title: "Top Google-Bewertungen",
    text: "Rückmeldungen unserer gewerblichen Kunden.",
  },
];

const TrustBar = () => {
  return (
    <section aria-label="Vertrauen und Service" className="py-12 md:py-16 bg-card/40 border-y border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {items.map((item, i) => {
            const Icon = item.icon;
            const inner = (
              <>
                <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="text-base font-bold leading-snug">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
              </>
            );
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="h-full"
              >
                {item.to ? (
                  <Link
                    to={item.to}
                    className="flex h-full flex-col rounded-2xl border border-border bg-background p-5 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div className="flex h-full flex-col rounded-2xl border border-border bg-background p-5">{inner}</div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
