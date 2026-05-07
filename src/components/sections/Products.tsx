import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Ruler, Euro, MessageCircle, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { products } from "@/data/products";

const Products = () => {
  const whatsappUrl = `https://wa.me/4905111228957?text=${encodeURIComponent("Hallo, ich interessiere mich für Arcade-Automaten.")}`;

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
            Professionelle Unterhaltungsautomaten mit maximaler Ertragskraft. Alle Preise netto.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group rounded-2xl border border-border bg-card/40 backdrop-blur-sm overflow-hidden hover:border-accent/40 transition-all"
            >
              <Link to={`/produkte/${p.slug}`} className="block">
                <div className="relative h-64 overflow-hidden bg-background/30">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                  <span className="absolute bottom-4 left-4 bg-primary/90 text-foreground text-sm font-bold px-3 py-1 rounded-full">
                    {p.price.toLocaleString("de-DE")} € netto
                  </span>
                </div>
              </Link>
              <div className="p-6">
                <Link to={`/produkte/${p.slug}`}>
                  <h3 className="text-xl font-bold mb-2 hover:text-primary transition-colors">{p.name}</h3>
                </Link>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{p.description}</p>
                <div className="space-y-2 text-sm border-t border-white/5 pt-4">
                  {p.dimensions && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Ruler className="w-4 h-4 text-secondary" />
                      {p.dimensions}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Euro className="w-4 h-4 text-green-400" />
                    <span className="font-semibold text-green-400">{p.price.toLocaleString("de-DE")} €</span>
                    <span className="text-muted-foreground text-xs">netto</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button className="flex-1 bg-primary hover:bg-primary/80 text-foreground shadow-neon" asChild>
                    <Link to={`/produkte/${p.slug}`}>
                      <ShoppingCart className="mr-1 w-4 h-4" /> Details
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-green-500 text-green-500 hover:bg-green-500 hover:text-foreground"
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
