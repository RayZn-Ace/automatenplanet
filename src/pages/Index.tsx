import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import PhoneBanner from "@/components/sections/PhoneBanner";
import Categories from "@/components/sections/Categories";
import Benefits from "@/components/sections/Benefits";
import Products from "@/components/sections/Products";
import Media from "@/components/sections/Media";
import Business from "@/components/sections/Business";
import Team from "@/components/sections/Team";
import BlogPreview from "@/components/sections/BlogPreview";
import Contact from "@/components/sections/Contact";
import FAQ from "@/components/sections/FAQ";
import SEOInfo from "@/components/sections/SEOInfo";
import Footer from "@/components/layout/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden selection:bg-primary/30">
      <Navbar />
      <main>
        <Hero />
        <PhoneBanner />
        <Categories />
        <Benefits />
        <Products />
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
