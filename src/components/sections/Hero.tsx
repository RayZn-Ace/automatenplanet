import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, MessageCircle } from "lucide-react";
import arcadeHero from "@/assets/arcade-hero.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background z-10" />
        
        {/* Hero background image */}
        <img src={arcadeHero} alt="Arcade Hall" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        
        {/* Animated grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] z-10 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/40 border border-border text-sm mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Europas #1 für Arcade & Entertainment
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
          >
            Arcade-Automaten für <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary text-glow">
              dein Business
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Greifautomaten, Boxautomaten, Basketball-Automaten und Arcade-Games für Kioske, Spätis, Arcades, Shoppingcenter und Events.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-neon h-14 px-8 text-lg rounded-xl">
              Automaten entdecken
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
            
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-secondary text-secondary hover:bg-secondary hover:text-background shadow-neon-blue h-14 px-8 text-lg rounded-xl backdrop-blur-sm">
              <MessageCircle className="mr-2 w-5 h-5" />
              Beratung anfragen
            </Button>

            <Button size="lg" variant="ghost" className="w-full sm:w-auto h-14 px-8 text-lg hover:bg-muted/40 rounded-xl">
              Preis anfragen
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;