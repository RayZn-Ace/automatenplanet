import { useState, useEffect } from "react";
import { Menu, X, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import logo from "@/assets/logo-automatplanet.jpg";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { lang, setLang, t } = useI18n();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: t("nav.categories"), href: "#kategorien" },
    { name: t("nav.benefits"), href: "#vorteile" },
    { name: t("nav.products"), href: "#produkte" },
    { name: t("nav.business"), href: "#business" },
    { name: t("nav.faq"), href: "#faq" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/90 backdrop-blur-md border-b border-white/10 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <img src={logo} alt="AutomatPlanet" className="h-10 w-auto" />
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === "de" ? "en" : "de")}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-white transition-colors px-2 py-1 rounded border border-white/10"
              aria-label="Switch language"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang.toUpperCase()}
            </button>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white border-2">
              {t("nav.consultation")}
            </Button>
            <Button className="bg-primary hover:bg-primary/80 text-white shadow-neon">
              {t("nav.inquiry")}
            </Button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-white/10 p-4 flex flex-col gap-4">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className="text-lg font-medium text-muted-foreground hover:text-white block py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
          <button
            onClick={() => setLang(lang === "de" ? "en" : "de")}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-white py-2"
          >
            <Globe className="w-4 h-4" />
            {lang === "de" ? "English" : "Deutsch"}
          </button>
          <div className="flex flex-col gap-3 mt-4">
            <Button variant="outline" className="w-full border-primary text-primary border-2">
              {t("nav.consultation")}
            </Button>
            <Button className="w-full bg-primary text-white shadow-neon">
              {t("nav.inquiry")}
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
