import { motion } from "framer-motion";
import { Grab, Swords, Target, Gamepad2, Gift, PartyPopper } from "lucide-react";

const categories = [
  {
    icon: Grab,
    title: "Greifautomaten",
    description: "Premium Claw Machines mit LED-Beleuchtung und einstellbarer Greifstärke. Der Klassiker für jeden Standort.",
    color: "from-primary to-pink-600",
  },
  {
    icon: Swords,
    title: "Boxautomaten",
    description: "Highscore-Boxmaschinen mit digitaler Anzeige. Perfekt für Bars, Clubs und Fitnessstudios.",
    color: "from-accent to-purple-600",
  },
  {
    icon: Target,
    title: "Basketball Automaten",
    description: "Arcade-Basketball mit Punktezähler und Multiplayer-Modus. Beliebt bei Jung und Alt.",
    color: "from-secondary to-cyan-400",
  },
  {
    icon: Gamepad2,
    title: "Arcade Automaten",
    description: "Retro & moderne Arcade-Games. Von Pac-Man bis zu aktuellen Racing-Games.",
    color: "from-blue-500 to-blue-700",
  },
  {
    icon: Gift,
    title: "Prize Maschinen",
    description: "Gewinnspielautomaten mit Ticket-Redemption-System. Maximale Kundenbindung.",
    color: "from-yellow-400 to-orange-500",
  },
  {
    icon: PartyPopper,
    title: "Event Automaten",
    description: "Temporäre Mietautomaten für Messen, Firmenfeiern und Festivals.",
    color: "from-green-400 to-emerald-600",
  },
];

const Categories = () => {
  return (
    <section id="kategorien" className="py-24 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Unsere <span className="text-primary text-glow">Automaten</span>-Kategorien
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Von Greifautomaten bis Event-Maschinen – finde den perfekten Automaten für dein Business.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative rounded-2xl border border-white/10 bg-card/50 backdrop-blur-sm p-8 hover:border-primary/50 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${cat.color} mb-4`}>
                <cat.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">{cat.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{cat.description}</p>
              <div className="mt-4 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Mehr erfahren →
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;