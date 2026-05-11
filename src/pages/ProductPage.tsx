import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { getProductBySlug, products } from "@/data/products";
import { getSeoContent } from "@/data/productSeoContent";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductJsonLd from "@/components/seo/ProductJsonLd";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useI18n } from "@/lib/i18n";
import { useCartStore } from "@/stores/cartStore";
import WhatsAppConsultButton from "@/components/WhatsAppConsultButton";
import PaymentMethods from "@/components/PaymentMethods";
import { Loader2 } from "lucide-react";
import {
  ArrowLeft, Ruler, Zap, ShoppingCart, Download, Truck, Phone,
  ZoomIn, CheckCircle, MapPin, Star, Package, TrendingUp, MessageCircle,
  Shield, Clock, Award, ChevronRight
} from "lucide-react";

const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = getProductBySlug(slug || "");
  const seoContent = getSeoContent(slug || "");
  const [imageOpen, setImageOpen] = useState(false);
  const { lang, t } = useI18n();
  const addBySlug = useCartStore((s) => s.addBySlug);
  const cartLoading = useCartStore((s) => s.isLoading);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

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

  const ogImage = seoContent?.lifestyleImage || product.image;
  const ogTitle = lang === "de" 
    ? `${product.name} kaufen | AutomatPlanet`
    : `Buy ${product.name} | AutomatPlanet`;
  const ogDescription = product.description;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>{ogTitle}</title>
        <meta name="description" content={ogDescription} />
        <link rel="canonical" href={`https://automatplanet.de/produkte/${product.slug}`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="product" />
        <meta property="og:url" content={`https://automatplanet.de/produkte/${product.slug}`} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:image" content={`https://automatplanet.de${ogImage}`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="AutomatPlanet" />
        <meta property="og:locale" content={lang === "de" ? "de_DE" : "en_US"} />
        <meta property="product:price:amount" content={product.price.toString()} />
        <meta property="product:price:currency" content="EUR" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@automatplanet" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:image" content={`https://automatplanet.de${ogImage}`} />
      </Helmet>
      <ProductJsonLd product={product} />
      <Navbar />

      {/* Breadcrumb */}
      <div className="pt-24 pb-2">
        <div className="container mx-auto px-4 md:px-6">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/#produkte" className="hover:text-primary transition-colors">
              {lang === "de" ? "Produkte" : "Products"}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="pb-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="sticky top-28">
                <div
                  className="rounded-2xl border border-border bg-card/60 overflow-hidden cursor-zoom-in relative group/img"
                  onClick={() => setImageOpen(true)}
                >
                  <div className="h-[400px] md:h-[520px] p-6 flex items-center justify-center bg-gradient-to-b from-card/80 to-background/40">
                    <img src={product.image} alt={product.name} className="w-full h-full object-contain drop-shadow-2xl" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover/img:bg-black/20 transition-colors rounded-2xl">
                    <ZoomIn className="w-8 h-8 text-foreground opacity-0 group-hover/img:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* Trust Badges under image */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    { icon: Shield, label: lang === "de" ? "12 Monate Garantie" : "12 Month Warranty" },
                    { icon: Truck, label: lang === "de" ? "Versand in 24h" : "Ships in 24h" },
                    { icon: Award, label: lang === "de" ? "Geprüfte Qualität" : "Certified Quality" },
                  ].map(({ icon: Icon, label }, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border bg-card/40 text-center">
                      <Icon className="w-4 h-4 text-primary" />
                      <span className="text-[10px] font-medium text-muted-foreground leading-tight">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Dialog open={imageOpen} onOpenChange={setImageOpen}>
                <DialogContent className="max-w-[90vw] max-h-[90vh] p-2 bg-background/95 border-border">
                  <img src={product.image} alt={product.name} className="w-full h-full object-contain max-h-[85vh]" />
                </DialogContent>
              </Dialog>
            </motion.div>

            {/* Details */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <span className="inline-block px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold tracking-wide uppercase mb-4">
                {product.category}
              </span>

              <h1 className="text-3xl md:text-5xl font-extrabold mb-5 leading-tight">{product.name}</h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">{product.description}</p>

              {/* Price Card */}
              <div className="rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5 p-5 sm:p-6 mb-6">
                <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1 mb-2">
                  <span className="text-4xl sm:text-5xl font-black text-primary text-glow tracking-tight break-all">
                    {product.price.toLocaleString("de-DE")} €
                  </span>
                  <span className="text-muted-foreground text-sm font-medium">{t("product.net")}</span>
                </div>
                {seoContent?.roiMonths && (
                  <div className="flex items-center gap-2 mt-3 text-sm">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    <span className="text-accent font-semibold">
                      {lang === "de"
                        ? `ROI in ca. ${seoContent.roiMonths} Monaten`
                        : `ROI in approx. ${seoContent.roiMonths} months`}
                    </span>
                  </div>
                )}
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {product.dimensions && (
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card/40">
                    <Ruler className="w-5 h-5 text-secondary shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{t("product.dimensions")}</p>
                      <p className="text-sm font-bold">{product.dimensions}</p>
                    </div>
                  </div>
                )}
                {product.power && (
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card/40">
                    <Zap className="w-5 h-5 text-secondary shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{t("product.power")}</p>
                      <p className="text-sm font-bold">{product.power}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Shipping */}
              <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card/40 mb-6">
                <Truck className="w-5 h-5 text-secondary shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold">{t("product.shippingTitle")}</p>
                  <p className="text-muted-foreground">{t("product.shippingCost")}</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-3 mb-6">
                <Button
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/80 text-primary-foreground shadow-neon text-base h-14"
                  onClick={() => addBySlug(product.slug)}
                  disabled={cartLoading}
                >
                  {cartLoading
                    ? <><Loader2 className="mr-2 w-5 h-5 animate-spin" /> In den Warenkorb</>
                    : <><ShoppingCart className="mr-2 w-5 h-5" /> In den Warenkorb</>
                  }
                </Button>
                <WhatsAppConsultButton productName={product.name} className="w-full h-14 text-base" />
                <Button size="lg" variant="outline" className="w-full border-border h-14 text-base">
                  <Download className="mr-2 w-5 h-5" /> {t("product.datasheet")}
                </Button>
              </div>

              <PaymentMethods className="mb-6" />

              {/* Phone */}
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" />
                {t("product.callUs")}
                <a href="tel:+4905111228957" className="text-primary font-bold hover:underline">
                  0511 12282957
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Extended Description */}
      {seoContent && (
        <section className="py-20 border-t border-border">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {lang === "de" ? `Alles über den ${product.name}` : `Everything about the ${product.name}`}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {txt(seoContent.longDescription)}
              </p>
            </motion.div>
          </div>
        </section>
      )}

      {/* Features Grid */}
      {seoContent && (
        <section className="py-20 bg-card/30 border-t border-border">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{t("seo.features")}</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {lang === "de"
                  ? `Was den ${product.name} besonders macht`
                  : `What makes the ${product.name} special`}
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {seoContent.features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card/60 hover:border-primary/30 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium leading-relaxed">{txt(feature)}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Use Cases */}
      {seoContent && (
        <section className="py-20 border-t border-border">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{t("seo.perfectFor")}</h2>
              <p className="text-muted-foreground">{t("seo.useCases")}</p>
            </motion.div>
            <div className="flex flex-wrap justify-center gap-4">
              {seoContent.useCases.map((useCase, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 px-6 py-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/8 to-primary/3 text-sm font-semibold hover:border-primary/40 transition-colors"
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
        <section className="py-20 bg-card/30 border-t border-border">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{t("seo.whyChoose")}</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
              {seoContent.benefits.map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -15 : 15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-4 p-6 rounded-2xl border border-border bg-card/60"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5 text-accent" />
                  </div>
                  <span className="font-semibold">{txt(benefit)}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lifestyle Image */}
      {seoContent?.lifestyleImage && (
        <section className="py-20 border-t border-border">
          <div className="container mx-auto px-4 md:px-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-8 text-center"
            >
              {t("seo.gallery")}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl overflow-hidden border border-border"
            >
              <img
                src={seoContent.lifestyleImage}
                alt={`${product.name} im Einsatz`}
                className="w-full h-[300px] md:h-[480px] object-cover"
                loading="lazy"
              />
            </motion.div>
          </div>
        </section>
      )}

      {/* Included */}
      {seoContent && (
        <section className="py-20 bg-card/30 border-t border-border">
          <div className="container mx-auto px-4 md:px-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-10 text-center"
            >
              {t("seo.included")}
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {seoContent.included.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card/60"
                >
                  <Package className="w-5 h-5 text-secondary shrink-0" />
                  <span className="text-sm font-medium">{txt(item)}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {seoContent && seoContent.faq.length > 0 && (
        <section className="py-20 border-t border-border">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-10 text-center"
            >
              {t("seo.faq")}
            </motion.h2>
            <Accordion type="single" collapsible className="space-y-3">
              {seoContent.faq.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border border-border rounded-2xl px-6 bg-card/60 data-[state=open]:border-primary/30"
                >
                  <AccordionTrigger className="text-left font-bold hover:no-underline py-5">
                    {txt(item.question)}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                    {txt(item.answer)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 border-t border-primary/20 bg-gradient-to-b from-primary/8 to-background">
        <div className="container mx-auto px-4 md:px-6 text-center max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {lang === "de" ? `${product.name} jetzt bestellen` : `Order ${product.name} now`}
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              {lang === "de"
                ? "Kontaktieren Sie uns für ein individuelles Angebot. Europaweiter Versand in 24 Stunden."
                : "Contact us for a custom quote. Europe-wide shipping within 24 hours."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/80 text-primary-foreground shadow-neon h-14 text-base px-8" asChild>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 w-5 h-5" /> WhatsApp
                </a>
              </Button>
              <Button size="lg" variant="outline" className="border-border h-14 text-base px-8" asChild>
                <a href="tel:+4905111228957">
                  <Phone className="mr-2 w-5 h-5" /> 0511 12282957
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-20 bg-card/30 border-t border-border">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-10">{t("product.relatedProducts")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <Link
                  key={p.slug}
                  to={`/produkte/${p.slug}`}
                  className="group rounded-2xl border border-border bg-card/40 overflow-hidden hover:border-primary/40 transition-all"
                >
                  <div className="h-44 overflow-hidden bg-background/30 p-4">
                    <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold mb-1">{p.name}</h3>
                    <p className="text-primary font-bold text-lg">{p.price.toLocaleString("de-DE")} € <span className="text-sm font-normal text-muted-foreground">{t("product.net")}</span></p>
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
