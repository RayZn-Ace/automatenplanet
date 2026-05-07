import { motion } from "framer-motion";
import { Star, BadgeCheck, Quote } from "lucide-react";
import { testimonials } from "@/data/testimonials";

const HomeTestimonials = () => {
  return (
    <section className="py-20 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Was unsere <span className="text-primary text-glow">Kunden</span> sagen
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Echte Stimmen von Betreibern aus ganz Deutschland.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {testimonials.slice(0, 6).map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 hover:border-primary/40 transition-all"
            >
              <Quote className="w-6 h-6 text-primary mb-3" />
              <p className="text-sm md:text-base mb-5 leading-relaxed">„{t.text}"</p>
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div>
                  <div className="text-sm font-semibold flex items-center gap-1.5">
                    {t.name}
                    {t.verified && <BadgeCheck className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeTestimonials;
