import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap, Ruler, Euro, MessageCircle } from "lucide-react";

import clawMachine from "@/assets/claw-machine.jpg";
import boxingMachine from "@/assets/boxing-machine.jpg";
import basketballMachine from "@/assets/basketball-machine.jpg";
import arcadeCabinet from "@/assets/arcade-cabinet.jpg";
import miniClaw from "@/assets/mini-claw.jpg";
import ticketMachine from "@/assets/ticket-machine.jpg";

const products = [
  {
    name: "Premium Greifautomat",
    image: clawMachine,
    description: "Professioneller Greifautomat mit LED-Beleuchtung und einstellbarer Greifkraft.",
    dimensions: "80 × 80 × 180 cm",
    power: "220V / 200W",
    earning: "800–2.500€ / Monat",
    price: "Ab 2.490€",
  },
  {
    name: "LED Boxing Machine",
    image: boxingMachine,
    description: "Digitaler Boxautomat mit LED-Display, Highscore-System und robustem Boxpolster.",
    dimensions: "70 × 65 × 230 cm",
    power: "220V / 300W",
    earning: "1.000–3.000€ / Monat",
    price: "Ab 3.990€",
  },
  {
    name: "Street Basketball Arcade",
    image: basketballMachine,
    description: "Arcade-Basketball mit Timer, Punktezähler und Multiplayer-Modus.",
    dimensions: "100 × 200 × 230 cm",
    power: "220V / 250W",
    earning: "600–1.800€ / Monat",
    price: "Ab 2.990€",
  },
  {
    name: "Classic Arcade Machine",
    image: arcadeCabinet,
    description: "Multi-Game Arcade-Automat mit 500+ klassischen Spielen und modernem Display.",
    dimensions: "60 × 70 × 170 cm",
    power: "220V / 150W",
    earning: "400–1.200€ / Monat",
    price: "Ab 1.990€",
  },
  {
    name: "Mini Claw Machine",
    image: miniClaw,
    description: "Kompakter Greifautomat perfekt für kleine Standorte wie Kioske und Restaurants.",
    dimensions: "45 × 45 × 90 cm",
    power: "220V / 100W",
    earning: "300–900€ / Monat",
    price: "Ab 1.290€",
  },
  {
    name: "Ticket Redemption Machine",
    image: ticketMachine,
    description: "Gewinnspielautomat mit Ticket-System und Prämienshop-Integration.",
    dimensions: "90 × 85 × 200 cm",
    power: "220V / 200W",
    earning: "700–2.000€ / Monat",
    price: "Ab 3.490€",
  },
];

const Products = () => {
  const whatsappUrl = `https://wa.me/4915123456789?text=${encodeURIComponent("Hallo, ich interessiere mich für Arcade-Automaten.")}`;

  return (
    <section id="produkte" className="py-24">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Unsere <span className="text-accent">Top-Automaten</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professionelle Unterhaltungsautomaten mit maximaler Ertragskraft.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group rounded-2xl border border-white/10 bg-card/40 backdrop-blur-sm overflow-hidden hover:border-accent/40 transition-all"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                <span className="absolute bottom-4 left-4 bg-primary/90 text-white text-sm font-bold px-3 py-1 rounded-full">
                  {p.price}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{p.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{p.description}</p>
                <div className="space-y-2 text-sm border-t border-white/5 pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Ruler className="w-4 h-4 text-secondary" />
                    {p.dimensions}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    {p.power}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Euro className="w-4 h-4 text-green-400" />
                    <span className="font-semibold text-green-400">{p.earning}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button className="flex-1 bg-primary hover:bg-primary/80 text-white shadow-neon">
                    Preis anfragen
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                    asChild
                  >
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Products;