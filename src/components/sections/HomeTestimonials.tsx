import { Star, BadgeCheck, Quote } from "lucide-react";
import { testimonials } from "@/data/testimonials";

const HomeTestimonials = () => {
  return (
    <section className="py-20 md:py-24 bg-card/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2">4,9 / 5 aus 312 Bewertungen</h2>
          <p className="text-muted-foreground">Was unsere Kunden sagen</p>
        </div>
        <div
          className="relative overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <style>{`
            @keyframes home-testimonials-marquee {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
          `}</style>
          <div
            className="flex gap-6 w-max"
            style={{
              animation: "home-testimonials-marquee 60s linear infinite",
            }}
          >
            {[...testimonials, ...testimonials].map((t, i) => (
              <div
                key={`${t.name}-${i}`}
                className="w-[320px] md:w-[360px] shrink-0 rounded-2xl border border-border bg-card p-6 relative"
              >
                <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20" />
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mb-4 italic text-sm">"{t.text}"</p>
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <div className="font-bold">{t.name}</div>
                    <div className="text-sm text-muted-foreground">{t.role}</div>
                  </div>
                  {t.verified && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80 shrink-0">
                      <BadgeCheck className="w-3 h-3 text-primary/70" />
                      <span>Verifiziert</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeTestimonials;
