import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight } from "lucide-react";
import { cities } from "@/data/cities";
import { Button } from "@/components/ui/button";

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

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {cities.map((city) => (
            <Link
              key={city.slug}
              to={`/standorte/${city.slug}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/40 text-sm hover:border-primary/30 hover:text-primary transition-all"
            >
              <MapPin className="w-3 h-3 text-primary" />
              Arcade Automaten {city.name}
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground border-2">
            <Link to="/standorte">
              Alle Standorte ansehen <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SEOInfo;