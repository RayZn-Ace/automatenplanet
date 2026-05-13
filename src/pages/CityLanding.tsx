import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { getCityBySlug, cities } from "@/data/cities";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityJsonLd from "@/components/seo/CityJsonLd";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Users, Building2, CheckCircle, Phone, MessageCircle } from "lucide-react";

import clawMachine from "@/assets/claw-machine.jpg";
import boxingMachine from "@/assets/boxing-machine.jpg";
import basketballMachine from "@/assets/basketball-machine.jpg";
import miniClaw from "@/assets/mini-claw.jpg";

const products = [
  { name: "Greifautomat", image: clawMachine, price: "Ab 1.290€" },
  { name: "Boxautomat", image: boxingMachine, price: "Ab 3.990€" },
  { name: "Basketball Automat", image: basketballMachine, price: "Ab 2.990€" },
  { name: "Mini Greifautomat", image: miniClaw, price: "Ab 1.290€" },
];

const CityLanding = () => {
  const { slug } = useParams<{ slug: string }>();
  const city = getCityBySlug(slug || "");

  const whatsappUrl = `https://api.whatsapp.com/send?phone=4915510706035&text=${encodeURIComponent(`Hallo, ich interessiere mich für Arcade-Automaten in ${city?.name || "meiner Stadt"}.`)}`;

  if (!city) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 text-center">
          <h1 className="text-4xl font-bold mb-4">Stadt nicht gefunden</h1>
          <Button asChild>
            <Link to="/">Zur Startseite</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const ogTitle = `Arcade Automaten ${city.name} kaufen & mieten | AutomatPlanet`;
  const ogDescription = city.description;
  const ogImage = city.heroImage;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>{ogTitle}</title>
        <meta name="description" content={ogDescription} />
        <link rel="canonical" href={`https://automatplanet.de/standorte/${city.slug}`} />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://automatplanet.de/standorte/${city.slug}`} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:image" content={`https://automatplanet.de${ogImage}`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="AutomatPlanet" />
        <meta property="og:locale" content="de_DE" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@automatplanet" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:image" content={`https://automatplanet.de${ogImage}`} />
      </Helmet>
      <CityJsonLd city={city} />
      <Navbar />
      
      {/* Hero */}
      <section className="relative pt-28 pb-20">
        <div className="absolute inset-0 z-0">
          <img 
            src={city.heroImage} 
            alt={city.heroAlt} 
            loading="eager"
            className="w-full h-full object-cover opacity-30" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/90 to-background" />
        </div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-6">
            <ArrowLeft className="w-4 h-4" /> Zurück zur Startseite
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <MapPin className="w-4 h-4 text-primary" />
              {city.region} • {city.population} Einwohner
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Arcade Automaten <span className="text-primary text-glow">{city.name}</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              {city.description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/80 text-primary-foreground shadow-neon">
                <Phone className="mr-2 w-5 h-5" /> Jetzt beraten lassen
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-foreground" asChild>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 w-5 h-5" /> WhatsApp
                </a>
              </Button>
            </div>
          </motion.div>
          
          {/* Hero Caption */}
          <motion.figcaption
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-sm text-muted-foreground italic border-l-2 border-primary/50 pl-4"
          >
            {city.heroCaption}
          </motion.figcaption>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Warum Arcade-Automaten in <span className="text-secondary">{city.name}</span>?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {city.highlights.map((highlight, i) => (
              <motion.div
                key={highlight}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 p-6 rounded-xl border border-border bg-card/40"
              >
                <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
                <span className="text-lg">{highlight}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Locations */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Top-Standorte in <span className="text-accent">{city.name}</span>
          </h2>
          
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {city.topLocations.map((location) => (
              <span key={location} className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-border bg-card/40 text-sm hover:border-accent/30 transition-colors">
                <Building2 className="w-4 h-4 text-accent" />
                {location}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Products for this city */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold mb-4 text-center">
            Unsere Automaten für {city.name}
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Lieferung, Aufstellung und Service in {city.name} und Umgebung inklusive.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group rounded-xl border border-border bg-card/40 overflow-hidden hover:border-primary/40 transition-all"
              >
                <div className="h-40 overflow-hidden">
                  <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold mb-1">{product.name}</h3>
                  <p className="text-sm text-primary font-semibold">{product.price}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Button asChild className="bg-primary hover:bg-primary/80 text-primary-foreground shadow-neon">
              <Link to="/#produkte">Alle Automaten ansehen</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center p-12 rounded-2xl border border-primary/30 bg-primary/5">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Arcade-Automaten in {city.name} aufstellen?
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Wir beraten Sie kostenlos und unverbindlich zu den besten Standorten und Automaten für Ihr Business in {city.name}.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-primary hover:bg-primary/80 text-primary-foreground shadow-neon">
                <Link to="/#kontakt">Kostenlose Beratung</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground" asChild>
                <a href="tel:+4915123456789">
                  <Phone className="mr-2 w-5 h-5" /> Anrufen
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Other Cities */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl font-bold mb-8 text-center">Weitere Standorte</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {cities.filter(c => c.slug !== city.slug).map((c) => (
              <Link
                key={c.slug}
                to={`/standorte/${c.slug}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/40 text-sm hover:border-primary/30 hover:text-primary transition-all"
              >
                <MapPin className="w-3 h-3" />
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CityLanding;
