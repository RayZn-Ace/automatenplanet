import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import PhoneBanner from "@/components/sections/PhoneBanner";
import Categories from "@/components/sections/Categories";
import Benefits from "@/components/sections/Benefits";
import ProductHighlight from "@/components/sections/ProductHighlight";
import HomeTestimonials from "@/components/sections/HomeTestimonials";
import Business from "@/components/sections/Business";
import Team from "@/components/sections/Team";
import BlogPreview from "@/components/sections/BlogPreview";
import Contact from "@/components/sections/Contact";
import SEOInfo from "@/components/sections/SEOInfo";
import Footer from "@/components/layout/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden selection:bg-primary/30">
      <Helmet>
        <title>AutomatPlanet – Arcade-Automaten kaufen & mieten | Greifautomaten, Boxautomaten</title>
        <meta name="description" content="Europas führender Anbieter für Arcade-Automaten. Greifautomaten, Boxautomaten, Basketball-Automaten und mehr. Europaweiter Versand in 24h." />
        <link rel="canonical" href="https://automatplanet.de/" />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://automatplanet.de/" />
        <meta property="og:title" content="AutomatPlanet – Arcade-Automaten kaufen & mieten" />
        <meta property="og:description" content="Europas führender Anbieter für Arcade-Automaten. Greifautomaten, Boxautomaten, Basketball-Automaten und mehr." />
        <meta property="og:image" content="https://automatplanet.de/images/og/og-default.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="AutomatPlanet" />
        <meta property="og:locale" content="de_DE" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@automatplanet" />
        <meta name="twitter:title" content="AutomatPlanet – Arcade-Automaten kaufen & mieten" />
        <meta name="twitter:description" content="Europas führender Anbieter für Arcade-Automaten. Greifautomaten, Boxautomaten und mehr." />
        <meta name="twitter:image" content="https://automatplanet.de/images/og/og-default.jpg" />
      </Helmet>
      <Navbar />
      <main>
        <Hero />
        <PhoneBanner />
        <Categories />
        <Benefits />
        <Products />
        <ProductSlideshow />
        <Media />
        <Business />
        <Team />
        <BlogPreview limit={3} />
        <Contact />
        <FAQ />
        <SEOInfo />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
