import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

const cities = [
  "Berlin", "Hamburg", "München", "Köln", "Frankfurt", "Hannover", "Stuttgart", "Düsseldorf", "Leipzig", "Dresden",
];

const SEOInfo = () => {
  return (
    <section className="py-24 bg-card/30">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Arcade-Automaten in <span className="text-primary">ganz Deutschland</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Wir liefern und installieren Greifautomaten, Boxautomaten, Basketball-Automaten und Arcade-Games in allen deutschen Großstädten.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3">
          {cities.map((city) => (
            <span key={city} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-card/40 text-sm hover:border-primary/30 transition-colors cursor-default">
              <MapPin className="w-3 h-3 text-primary" />
              Arcade Automaten {city}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SEOInfo;