import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { getProductBySlug, products } from "@/data/products";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductJsonLd from "@/components/seo/ProductJsonLd";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft, Ruler, Zap, Euro, ShoppingCart, Download, Truck, Phone, MessageCircle, ZoomIn } from "lucide-react";

const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = getProductBySlug(slug || "");
  const [imageOpen, setImageOpen] = useState(false);

  const whatsappUrl = `https://wa.me/4905111228957?text=${encodeURIComponent(`Hallo, ich interessiere mich für: ${product?.name || "ein Produkt"}`)}`;

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 text-center">
          <h1 className="text-4xl font-bold mb-4">Produkt nicht gefunden</h1>
          <Button asChild>
            <Link to="/#produkte">Alle Produkte ansehen</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedProducts = products.filter((p) => p.slug !== product.slug && p.category === product.category).slice(0, 4);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ProductJsonLd product={product} />
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <Link to="/#produkte" className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-6">
            <ArrowLeft className="w-4 h-4" /> Zurück zu Produkten
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
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover/img:bg-black/20 transition-colors">
                  <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
                </div>
              </div>

              <Dialog open={imageOpen} onOpenChange={setImageOpen}>
                <DialogContent className="max-w-[90vw] max-h-[90vh] p-2 bg-background/95 border-white/10">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain max-h-[85vh]"
                  />
                </DialogContent>
              </Dialog>
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
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
                  <span className="text-muted-foreground text-sm">netto</span>
                </div>
              </div>

              {/* Specs */}
              <div className="space-y-3 mb-6">
                {product.dimensions && (
                  <div className="flex items-center gap-3 text-sm">
                    <Ruler className="w-5 h-5 text-secondary" />
                    <span className="text-muted-foreground">Maße:</span>
                    <span className="font-semibold">{product.dimensions}</span>
                  </div>
                )}
                {product.power && (
                  <div className="flex items-center gap-3 text-sm">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="text-muted-foreground">Leistung:</span>
                    <span className="font-semibold">{product.power}</span>
                  </div>
                )}
              </div>

              {/* Shipping */}
              <div className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-card/40 mb-6">
                <Truck className="w-5 h-5 text-secondary" />
                <div className="text-sm">
                  <p className="font-semibold">Europaweiter Versand in 24h</p>
                  <p className="text-muted-foreground">Deutschland: 150€ netto</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="flex-1 bg-primary hover:bg-primary/80 text-white shadow-neon" asChild>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <ShoppingCart className="mr-2 w-5 h-5" /> Jetzt kaufen
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="flex-1 border-white/10">
                  <Download className="mr-2 w-5 h-5" /> Produktdatenblatt
                </Button>
              </div>

              {/* Phone */}
              <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" />
                Fragen? Rufen Sie uns an:
                <a href="tel:+4905111228957" className="text-primary font-semibold hover:underline">
                  0511 12282957
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-2xl font-bold mb-8">Ähnliche Produkte</h2>
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
                    <p className="text-primary font-semibold">{p.price.toLocaleString("de-DE")} € netto</p>
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
