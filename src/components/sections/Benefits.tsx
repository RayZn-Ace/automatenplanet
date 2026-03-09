import { motion } from "framer-motion";
import { TrendingUp, Users, Coins, UserMinus, Sparkles } from "lucide-react";

const benefits = [
  {
    icon: TrendingUp,
    title: "Passives Einkommen",
    description: "Einmal aufgestellt, verdienen Automaten rund um die Uhr – ohne aktive Arbeit.",
    stat: "500–3.000€",
    statLabel: "pro Monat / Automat",
  },
  {
    icon: Users,
    title: "Kundenmagnet",
    description: "Arcade-Automaten ziehen Laufkundschaft an und erhöhen die Verweildauer in Ihrem Geschäft.",
    stat: "40%",
    statLabel: "mehr Laufkundschaft",
  },
  {
    icon: Coins,
    title: "Münzbasiert",
    description: "Bargeldbetrieb ohne komplizierte Abrechnungssysteme. Einfach und transparent.",
    stat: "0€",
    statLabel: "Transaktionsgebühren",
  },
  {
    icon: UserMinus,
    title: "Kein Personal nötig",
    description: "Automaten arbeiten selbstständig. Kein zusätzliches Personal erforderlich.",
    stat: "24/7",
    statLabel: "autonomer Betrieb",
  },
  {
    icon: Sparkles,
    title: "Hoher Unterhaltungswert",
    description: "Entertainment steigert die Kundenzufriedenheit und schafft einzigartige Erlebnisse.",
    stat: "95%",
    statLabel: "Kundenzufriedenheit",
  },
];

const Benefits = () => {
  return (
    <section id="vorteile" className="py-24 bg-card/30">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Warum Arcade-Automaten <span className="text-secondary text-glow-blue">profitabel</span> sind
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Entdecken Sie, wie Unterhaltungsautomaten Ihr Geschäft transformieren.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative rounded-2xl border border-white/10 bg-card/60 backdrop-blur-sm p-8 hover:border-secondary/30 transition-all group"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-xl bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                  <b.icon className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.description}</p>
                </div>
              </div>
              <div className="border-t border-white/5 pt-4">
                <span className="text-3xl font-bold text-secondary">{b.stat}</span>
                <span className="block text-xs text-muted-foreground mt-1">{b.statLabel}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;