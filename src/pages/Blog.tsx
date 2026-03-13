import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Clock, Calendar, ArrowLeft } from "lucide-react";
import { blogArticles } from "@/data/blogArticles";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

const Blog = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Arcade-Automaten Blog – Tipps, Guides & News | AutomatPlanet</title>
        <meta name="description" content="Expertenwissen rund um Arcade-Automaten: Business-Tipps, Einnahmen-Guides, Standort-Strategien und Branchennews." />
        <link rel="canonical" href="https://automatplanet.de/blog" />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://automatplanet.de/blog" />
        <meta property="og:title" content="Arcade-Automaten Blog – Tipps, Guides & News" />
        <meta property="og:description" content="Expertenwissen rund um Arcade-Automaten: Business-Tipps, Einnahmen-Guides und Branchennews." />
        <meta property="og:image" content="https://automatplanet.de/images/og/og-blog.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="AutomatPlanet" />
        <meta property="og:locale" content="de_DE" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@automatplanet" />
        <meta name="twitter:title" content="Arcade-Automaten Blog – Tipps, Guides & News" />
        <meta name="twitter:description" content="Expertenwissen rund um Arcade-Automaten: Business-Tipps, Einnahmen-Guides und Branchennews." />
        <meta name="twitter:image" content="https://automatplanet.de/images/og/og-blog.jpg" />
      </Helmet>
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
              Arcade-<span className="text-primary text-glow">Blog</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Expertenwissen rund um Arcade-Automaten, Business-Tipps und Branchennews.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogArticles.map((article, i) => (
              <motion.div
                key={article.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  to={`/blog/${article.slug}`}
                  className="group block rounded-2xl border border-white/10 bg-card/40 backdrop-blur-sm overflow-hidden hover:border-primary/40 transition-all h-full"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                    <span className="absolute top-4 left-4 bg-primary/90 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {article.category}
                    </span>
                  </div>
                  <div className="p-6">
                    <h2 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{article.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {article.readTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(article.date).toLocaleDateString("de-DE")}
                      </span>
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

export default Blog;