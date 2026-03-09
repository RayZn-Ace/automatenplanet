import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Store, Dumbbell, ShoppingBag, Building2, MapPin, Plane, Music, CalendarDays, Calculator } from "lucide-react";

const locations = [
  { icon: Store, name: "Kioske & Spätis", desc: "Kleine Automaten ziehen Laufkundschaft an und generieren zusätzliche Einnahmen." },
  { icon: ShoppingBag, name: "Shopping Malls", desc: "Hohe Frequenz = hohe Einnahmen. Perfekt für Greif- und Basketballautomaten." },
  { icon: Plane, name: "Flughäfen", desc: "Wartende Passagiere suchen Unterhaltung – ideale Zielgruppe." },
  { icon: Building2, name: "Supermärkte", desc: "Entertainment im Eingangsbereich steigert Verweildauer und Kundenzufriedenheit." },
  { icon: MapPin, name: "Freizeitparks", desc: "Arcade-Automaten als perfekte Ergänzung zum bestehenden Entertainment." },
  { icon: Dumbbell, name: "Arcade Studios", desc: "Komplettausstattung für professionelle Arcade-Hallen." },
  { icon: Music, name: "Clubs & Bars", desc: "Boxautomaten und Arcade-Games als Highlight für jede Partylocation." },
  { icon: CalendarDays, name: "Events & Messen", desc: "Mietautomaten für temporäre Events mit garantierter Aufmerksamkeit." },
];

const Business = () => {
  const [machines, setMachines] = useState([3]);
  const [avgEarning, setAvgEarning] = useState([1500]);

  const totalMonthly = machines[0] * avgEarning[0];
  const totalYearly = totalMonthly * 12;

  return (
    <section id="business" className="py-24">
      <div className="container mx-auto px-4 md:px-6">
        {/* Business Opportunity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Dein Arcade-<span className="text-secondary text-glow-blue">Business</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Starten Sie Ihr eigenes Unterhaltungsautomaten-Business und verdienen Sie passiv.
          </p>
        </motion.div>

        {/* Revenue Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto mb-24 rounded-2xl border border-secondary/30 bg-card/60 backdrop-blur-sm p-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <Calculator className="w-6 h-6 text-secondary" />
            <h3 className="text-2xl font-bold">Einnahmen-Kalkulator</h3>
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex justify-between mb-3">
                <label className="text-sm font-medium">Anzahl Automaten</label>
                <span className="text-lg font-bold text-secondary">{machines[0]}</span>
              </div>
              <Slider value={machines} onValueChange={setMachines} min={1} max={20} step={1} className="[&_[role=slider]]:bg-secondary [&_[role=slider]]:border-secondary [&_.bg-primary]:bg-secondary" />
            </div>

            <div>
              <div className="flex justify-between mb-3">
                <label className="text-sm font-medium">Ø Einnahmen pro Automat / Monat</label>
                <span className="text-lg font-bold text-secondary">{avgEarning[0]}€</span>
              </div>
              <Slider value={avgEarning} onValueChange={setAvgEarning} min={300} max={5000} step={100} className="[&_[role=slider]]:bg-secondary [&_[role=slider]]:border-secondary [&_.bg-primary]:bg-secondary" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div className="text-center p-4 rounded-xl bg-secondary/10">
                <p className="text-sm text-muted-foreground mb-1">Monatlich</p>
                <p className="text-3xl font-bold text-secondary">{totalMonthly.toLocaleString("de-DE")}€</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-primary/10">
                <p className="text-sm text-muted-foreground mb-1">Jährlich</p>
                <p className="text-3xl font-bold text-primary">{totalYearly.toLocaleString("de-DE")}€</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Ideal Locations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h3 className="text-3xl font-bold mb-4">Ideale Standorte</h3>
          <p className="text-muted-foreground">Wo Automaten am besten performen.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {locations.map((loc, i) => (
            <motion.div
              key={loc.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="p-6 rounded-xl border border-white/10 bg-card/40 hover:border-secondary/30 transition-all group"
            >
              <loc.icon className="w-8 h-8 text-secondary mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold mb-1">{loc.name}</h4>
              <p className="text-xs text-muted-foreground">{loc.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Business;