import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { blogArticles } from "@/data/blogArticles";
import { Button } from "@/components/ui/button";

interface BlogPreviewProps {
  limit?: number;
  showHeading?: boolean;
}

const BlogPreview = ({ limit = 3, showHeading = true }: BlogPreviewProps) => {
  const articles = blogArticles.slice(0, limit);

  return (
    <section className="py-24">
      <div className="container mx-auto px-4 md:px-6">
        {showHeading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Arcade-<span className="text-primary text-glow">Blog</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Expertenwissen rund um Arcade-Automaten, Business-Tipps und Branchennews.
            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, i) => (
            <motion.div
              key={article.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                to={`/blog/${article.slug}`}
                className="group block rounded-2xl border border-border bg-card/40 backdrop-blur-sm overflow-hidden hover:border-primary/40 transition-all"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                  <span className="absolute top-4 left-4 bg-primary/90 text-foreground text-xs font-bold px-3 py-1 rounded-full">
                    {article.category}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h3>
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

        {showHeading && (
          <div className="text-center mt-12">
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-foreground border-2">
              <Link to="/blog">
                Alle Artikel ansehen <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogPreview;