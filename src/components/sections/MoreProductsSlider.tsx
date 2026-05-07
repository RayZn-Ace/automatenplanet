import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { products } from "@/data/products";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const EXCLUDED_SLUGS = new Set(["boxautomat-premium", "greifautomat"]);

const MoreProductsSlider = () => {
  const items = products.filter((p) => !EXCLUDED_SLUGS.has(p.slug));

  return (
    <section id="produkte" className="py-20 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Weitere <span className="text-accent">Automaten</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Vom Basketball-Automaten bis zum Tischkicker – alle Preise netto.
          </p>
        </motion.div>

        <Carousel
          opts={{ align: "start", loop: false }}
          className="max-w-7xl mx-auto"
        >
          <CarouselContent className="-ml-4">
            {items.map((p) => (
              <CarouselItem
                key={p.slug}
                className="pl-4 basis-[80%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <Link
                  to={`/produkte/${p.slug}`}
                  className="group block h-full rounded-2xl border border-border bg-card/40 backdrop-blur-sm overflow-hidden hover:border-accent/40 transition-all"
                >
                  <div className="relative h-56 overflow-hidden bg-background/30">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                      {p.category}
                    </div>
                    <h3 className="text-base font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                      {p.name}
                    </h3>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs text-muted-foreground">ab</span>
                      <span className="text-lg font-bold text-primary">
                        {p.price.toLocaleString("de-DE")}€
                      </span>
                      <span className="text-xs text-muted-foreground">netto</span>
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4" />
          <CarouselNext className="hidden md:flex -right-4" />
        </Carousel>
      </div>
    </section>
  );
};

export default MoreProductsSlider;
