import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { getProductBySlug, products } from "@/data/products";
import { getSeoContent } from "@/data/productSeoContent";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductJsonLd from "@/components/seo/ProductJsonLd";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useI18n } from "@/lib/i18n";
import {
  ArrowLeft, Ruler, Zap, ShoppingCart, Download, Truck, Phone,
  ZoomIn, CheckCircle, MapPin, Star, Package, TrendingUp, MessageCircle
} from "lucide-react";

const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = getProductBySlug(slug || "");
  const seoContent = getSeoContent(slug || "");
  const [imageOpen, setImageOpen] = useState(false);
  const { lang, t } = useI18n();

  const whatsappUrl = `https://wa.me/4905111228957?text=${encodeURIComponent(`Hallo, ich interessiere mich für: ${product?.name || "ein Produkt"}`)}`;

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 text-center">
          <h1 className="text-4xl font-bold mb-4">{t("product.notFound")}</h1>
          <Button asChild>
            <Link to="/#produkte">{t("product.viewAll")}</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedProducts = products.filter((p) => p.slug !== product.slug && p.category === product.category).slice(0, 4);
  const txt = (item: { de: string; en: string }) => item[lang];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ProductJsonLd product={product} />
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <Link to="/#produkte" className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-6">
            <ArrowLeft className="w-4 h-4" /> {t("product.backToProducts")}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-2xl border border-white/10 bg-card/40 overflow-hidden"
            >
              <div
                className="h-[420px] md:h-[520px] bg-background/30 p-4 flex items-center justify-center cursor-zoom-in relative group/img"
                onClick={() => setImageOpen(true)}
              >
                <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover/img:bg-black/20 transition-colors">
                  <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
                </div>
              </div>

              <Dialog open={imageOpen} onOpenChange={setImageOpen}>
                <DialogContent className="max-w-[90vw] max-h-[90vh] p-2 bg-background/95 border-white/10">
                  <img src={product.image} alt={product.name} className="w-full h-full object-contain max-h-[85vh]" />
                </DialogContent>
              </Dialog>
            </motion.div>

            {/* Details */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold mb-4">
                {product.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{product.name}</h1>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{product.description}</p>

              {/* Price */}
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-primary text-glow">
                    {product.price.toLocaleString("de-DE")} €
                  </span>
                  <span className="text-muted-foreground text-sm">{t("product.net")}</span>
                </div>
              </div>

              {/* Specs */}
              <div className="space-y-3 mb-6">
                {product.dimensions && (
                  <div className="flex items-center gap-3 text-sm">
                    <Ruler className="w-5 h-5 text-secondary" />
                    <span className="text-muted-foreground">{t("product.dimensions")}:</span>
                    <span className="font-semibold">{product.dimensions}</span>
                  </div>
                )}
                {product.power && (
                  <div className="flex items-center gap-3 text-sm">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="text-muted-foreground">{t("product.power")}:</span>
                    <span className="font-semibold">{product.power}</span>
                  </div>
                )}
              </div>

              {/* ROI Badge */}
              {seoContent?.roiMonths && (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-accent/30 bg-accent/5 mb-4">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  <div className="text-sm">
                    <p className="font-semibold text-accent">{t("seo.roi")}</p>
                    <p className="text-muted-foreground">
                      {lang === "de"
                        ? `Amortisation in ca. ${seoContent.roiMonths} Monaten`
                        : `Pays for itself in approx. ${seoContent.roiMonths} months`}
                    </p>
                  </div>
                </div>
              )}

              {/* Shipping */}
              <div className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-card/40 mb-6">
                <Truck className="w-5 h-5 text-secondary" />
                <div className="text-sm">
                  <p className="font-semibold">{t("product.shippingTitle")}</p>
                  <p className="text-muted-foreground">{t("product.shippingCost")}</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="flex-1 bg-primary hover:bg-primary/80 text-white shadow-neon" asChild>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <ShoppingCart className="mr-2 w-5 h-5" /> {t("product.buyNow")}
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="flex-1 border-white/10">
                  <Download className="mr-2 w-5 h-5" /> {t("product.datasheet")}
                </Button>
              </div>

              {/* Phone */}
              <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" />
                {t("product.callUs")}
                <a href="tel:+4905111228957" className="text-primary font-semibold hover:underline">
                  0511 12282957
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Extended Description */}
      {seoContent && (
        <section className="py-16 border-t border-white/5">
          <div className="container mx-auto px-4 md:px-6">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-lg text-muted-foreground leading-relaxed max-w-4xl"
            >
              {txt(seoContent.longDescription)}
            </motion.p>
          </div>
        </section>
      )}

      {/* Features */}
      {seoContent && (
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4 md:px-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold mb-8"
            >
              {t("seo.features")}
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {seoContent.features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 p-4 rounded-xl border border-white/10 bg-card/40"
                >
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">{txt(feature)}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Use Cases */}
      {seoContent && (
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold mb-2"
            >
              {t("seo.perfectFor")}
            </motion.h2>
            <p className="text-muted-foreground mb-8">{t("seo.useCases")}</p>
            <div className="flex flex-wrap gap-3">
              {seoContent.useCases.map((useCase, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-2 px-4 py-3 rounded-full border border-primary/30 bg-primary/5 text-sm font-medium"
                >
                  <MapPin className="w-4 h-4 text-primary" />
                  {txt(useCase)}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Benefits */}
      {seoContent && (
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4 md:px-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold mb-8"
            >
              {t("seo.whyChoose")}
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {seoContent.benefits.map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 p-5 rounded-xl border border-white/10 bg-card/60"
                >
                  <Star className="w-6 h-6 text-accent shrink-0" />
                  <span className="font-medium">{txt(benefit)}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lifestyle Image */}
      {seoContent?.lifestyleImage && (
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold mb-8"
            >
              {t("seo.gallery")}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl overflow-hidden border border-white/10"
            >
              <img
                src={seoContent.lifestyleImage}
                alt={`${product.name} im Einsatz`}
                className="w-full h-[300px] md:h-[450px] object-cover"
                loading="lazy"
              />
            </motion.div>
          </div>
        </section>
      )}

      {/* Included */}
      {seoContent && (
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4 md:px-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold mb-8"
            >
              {t("seo.included")}
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {seoContent.included.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-card/40"
                >
                  <Package className="w-5 h-5 text-secondary shrink-0" />
                  <span className="text-sm">{txt(item)}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {seoContent && seoContent.faq.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold mb-8"
            >
              {t("seo.faq")}
            </motion.h2>
            <Accordion type="single" collapsible className="space-y-3">
              {seoContent.faq.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border border-white/10 rounded-xl px-6 bg-card/40"
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">
                    {txt(item.question)}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {txt(item.answer)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-primary/5 border-t border-primary/20">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {lang === "de" ? `${product.name} jetzt bestellen` : `Order ${product.name} now`}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            {lang === "de"
              ? "Kontaktieren Sie uns für ein individuelles Angebot. Europaweiter Versand in 24 Stunden."
              : "Contact us for a custom quote. Europe-wide shipping within 24 hours."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/80 text-white shadow-neon" asChild>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 w-5 h-5" /> WhatsApp
              </a>
            </Button>
            <Button size="lg" variant="outline" className="border-white/10" asChild>
              <a href="tel:+4905111228957">
                <Phone className="mr-2 w-5 h-5" /> 0511 12282957
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-2xl font-bold mb-8">{t("product.relatedProducts")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <Link
                  key={p.slug}
                  to={`/produkte/${p.slug}`}
                  className="group rounded-xl border border-white/10 bg-card/40 overflow-hidden hover:border-primary/40 transition-all"
                >
                  <div className="h-44 overflow-hidden bg-background/30 p-2">
                    <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-1">{p.name}</h3>
                    <p className="text-primary font-semibold">{p.price.toLocaleString("de-DE")} € {t("product.net")}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default ProductPage;
