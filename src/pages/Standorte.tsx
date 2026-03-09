import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import { cities } from "@/data/cities";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

const Standorte = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-6">
            <Button asChild variant="ghost" size="sm">
              <Link to="/"><ArrowLeft className="w-4 h-4 mr-2" /> Startseite</Link>
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Arcade-Automaten in <span className="text-primary text-glow">Deutschland</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Wir liefern und installieren Greifautomaten, Boxautomaten und Arcade-Games in allen deutschen Großstädten.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities.map((city, i) => (
              <motion.div
                key={city.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/standorte/${city.slug}`}
                  className="group block rounded-2xl border border-white/10 bg-card/40 backdrop-blur-sm overflow-hidden hover:border-primary/40 transition-all h-full"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={city.heroImage}
                      alt={city.heroAlt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <MapPin className="w-3 h-3" /> {city.region}
                      </div>
                      <h2 className="text-2xl font-bold">{city.name}</h2>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{city.description}</p>
                    <div className="mt-3 text-primary text-sm font-medium group-hover:underline">
                      Mehr erfahren →
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Standorte;