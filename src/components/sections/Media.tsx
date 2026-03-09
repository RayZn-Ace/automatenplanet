import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { useState } from "react";

const videos = [
  {
    title: "Greifautomat Gameplay",
    thumbnail: "https://images.unsplash.com/photo-1632501641765-e568d28b0015?q=80&w=600&auto=format&fit=crop",
    videoId: "dQw4w9WgXcQ",
  },
  {
    title: "Boxautomat Challenge",
    thumbnail: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=600&auto=format&fit=crop",
    videoId: "dQw4w9WgXcQ",
  },
  {
    title: "Basketball Arcade Action",
    thumbnail: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=600&auto=format&fit=crop",
    videoId: "dQw4w9WgXcQ",
  },
  {
    title: "Arcade in Aktion",
    thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop",
    videoId: "dQw4w9WgXcQ",
  },
];

const Media = () => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <section className="py-24 bg-card/30">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Automaten <span className="text-primary text-glow">in Aktion</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Erleben Sie unsere Automaten live – überzeugen Sie sich selbst!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative group rounded-2xl overflow-hidden border border-white/10 cursor-pointer"
              onClick={() => setActiveVideo(v.videoId)}
            >
              <div className="relative aspect-video">
                <img
                  src={v.thumbnail}
                  alt={v.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-neon group-hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 text-white ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="bg-black/60 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full">
                    {v.title}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Video Modal */}
        {activeVideo && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setActiveVideo(null)}
          >
            <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title="Video Demo"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Media;