import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ChevronRight, Star } from "lucide-react";

interface ProductHighlightProps {
  eyebrow?: string;
  title: string;
  description: string;
  bullets: string[];
  priceFrom: number;
  ctaHref: string;
  ctaLabel: string;
  image: string;
  imageAlt: string;
  video?: string;
  imageSide?: "left" | "right";
  highlighted?: boolean;
}

const ProductHighlight = ({
  eyebrow,
  title,
  description,
  bullets,
  priceFrom,
  ctaHref,
  ctaLabel,
  image,
  imageAlt,
  video,
  imageSide = "right",
  highlighted = false,
}: ProductHighlightProps) => {
  const imageOrder = imageSide === "left" ? "md:order-first" : "md:order-last";
  const contentOrder = imageSide === "left" ? "md:order-last" : "md:order-first";

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div
          className={`max-w-6xl mx-auto rounded-3xl border bg-card/40 backdrop-blur-sm overflow-hidden ${
            highlighted ? "border-primary/40 shadow-neon" : "border-border"
          }`}
        >
          <div className="grid md:grid-cols-2 gap-0 items-center">
            {/* Image / Video */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`relative flex items-center justify-center p-6 md:p-10 min-h-[340px] md:min-h-[480px] ${
                video ? "bg-white" : "bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"
              } ${imageOrder}`}
            >
              <Link to={ctaHref} aria-label={title} className="block w-full max-w-md">
                {video ? (
                  <video
                    src={video}
                    autoPlay
                    loop
                    muted
                    playsInline
                    disablePictureInPicture
                    controls={false}
                    aria-label={imageAlt}
                    className="w-full aspect-[3/4] object-contain pointer-events-none"
                  />
                ) : (
                  <img
                    src={image}
                    alt={imageAlt}
                    loading="lazy"
                    className="w-full h-auto object-contain max-h-[420px] md:max-h-[520px] mx-auto transition-transform duration-500 hover:scale-105"
                  />
                )}
              </Link>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className={`p-6 md:p-10 lg:p-12 ${contentOrder}`}
            >
              {eyebrow && (
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 mb-4">
                  <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {eyebrow}
                  </span>
                </div>
              )}
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                {title}
              </h2>
              <p className="text-base md:text-lg text-muted-foreground mb-6">{description}</p>

              <ul className="space-y-2.5 mb-7">
                {bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm md:text-base">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-sm text-muted-foreground">ab</span>
                <span className="text-4xl md:text-5xl font-bold text-primary">
                  {priceFrom.toLocaleString("de-DE")}€
                </span>
                <span className="text-muted-foreground">netto</span>
              </div>

              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-neon h-13 px-7 text-base"
              >
                <Link to={ctaHref}>
                  {ctaLabel}
                  <ChevronRight className="ml-1 w-5 h-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductHighlight;
