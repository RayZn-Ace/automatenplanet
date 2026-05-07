import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { products } from "@/data/products";
import { useI18n } from "@/lib/i18n";
import { Link } from "react-router-dom";

const ProductSlideshow = () => {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const { lang } = useI18n();

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % products.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + products.length) % products.length);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(next, 4000);
    return () => clearInterval(interval);
  }, [isPlaying, next]);

  const product = products[current];

  return (
    <section className="py-24 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-center mb-4"
        >
          {lang === "de" ? "Alle " : "All "}
          <span className="text-accent">
            {lang === "de" ? "Produkte" : "Products"}
          </span>
        </motion.h2>
        <p className="text-center text-muted-foreground mb-12">
          {lang === "de"
            ? `${products.length} Automaten im Überblick – klicken Sie für Details`
            : `${products.length} machines at a glance – click for details`}
        </p>

        <div className="relative max-w-5xl mx-auto">
          {/* Main slide */}
          <div className="relative h-[400px] md:h-[500px] rounded-2xl border border-border bg-card/40 backdrop-blur-sm overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -80 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="absolute inset-0 flex flex-col md:flex-row"
              >
                {/* Image */}
                <Link
                  to={`/produkte/${product.slug}`}
                  className="flex-1 flex items-center justify-center p-6 md:p-10 bg-background/30 cursor-pointer"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-h-[250px] md:max-h-[380px] object-contain hover:scale-105 transition-transform duration-500"
                  />
                </Link>

                {/* Info */}
                <div className="flex-1 p-6 md:p-10 flex flex-col justify-center">
                  <span className="inline-block w-fit px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold mb-3">
                    {product.category}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{product.description}</p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-bold text-primary">
                      {product.price.toLocaleString("de-DE")} €
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {lang === "de" ? "netto" : "net"}
                    </span>
                  </div>
                  <Link
                    to={`/produkte/${product.slug}`}
                    className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-semibold"
                  >
                    {lang === "de" ? "Details ansehen →" : "View details →"}
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Nav arrows */}
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center hover:bg-primary/20 transition-colors z-10"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center hover:bg-primary/20 transition-colors z-10"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-primary/20 transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {products.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-6 bg-primary"
                      : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>

            <span className="text-xs text-muted-foreground tabular-nums">
              {current + 1}/{products.length}
            </span>
          </div>

          {/* Thumbnail strip */}
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {products.map((p, i) => (
              <button
                key={p.slug}
                onClick={() => setCurrent(i)}
                className={`shrink-0 w-20 h-20 rounded-lg border overflow-hidden p-1 transition-all ${
                  i === current
                    ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                    : "border-border bg-card/40 hover:border-white/30"
                }`}
              >
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductSlideshow;
