import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import PhoneBanner from "@/components/sections/PhoneBanner";
import Benefits from "@/components/sections/Benefits";
import ProductHighlight from "@/components/sections/ProductHighlight";
import MoreProductsSlider from "@/components/sections/MoreProductsSlider";
import HomeTestimonials from "@/components/sections/HomeTestimonials";
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
        <ProductHighlight
          eyebrow="Bestseller 2026"
          title="Boxautomat Premium"
          description="Der günstigste Boxautomat Deutschlands – wahlweise mit Münzfach oder Münz- & Geldscheinakzeptor. Bis zu 1.500€ Umsatz pro Monat und Standort."
          bullets={[
            "Bis zu 1.500€/Monat passive Einnahmen",
            "Versand in 24h · Rechnung möglich",
            "Plug & Play – kein Internet, kein Personal nötig",
          ]}
          priceFrom={1799}
          ctaHref="/produkte/boxautomat-premium"
          ctaLabel="Zum Boxautomat"
          image="/images/products/boxing-machine-new.png"
          video="/boxautomat-loop.mp4"
          imageAlt="Boxautomat Premium"
          imageSide="left"
          highlighted
        />
        <ProductHighlight
          eyebrow="Klassiker"
          title="Greifautomat – Der Klassiker für jeden Standort"
          description="Professionelle Claw Machine mit LED-Beleuchtung und einstellbarer Greifkraft. Perfekt für Kioske, Spätis, Shoppingcenter und Gastronomie."
          bullets={[
            "Hochwertige Verarbeitung & zuverlässige Technik",
            "Einstellbare Greifkraft für maximale Erträge",
            "LED-Beleuchtung für maximale Aufmerksamkeit",
          ]}
          priceFrom={2499}
          ctaHref="/produkte/greifautomat"
          ctaLabel="Zum Greifautomat"
          image="/images/products/claw-machine-new.png"
          imageAlt="Greifautomat"
          imageSide="right"
        />
        <MoreProductsSlider />
        <Benefits />
        <HomeTestimonials />
        <Team />
        <BlogPreview limit={3} />
        <Contact />
        <SEOInfo />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
