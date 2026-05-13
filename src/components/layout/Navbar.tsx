import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import logo from "@/assets/logo-automatplanet.png";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppConsultButton from "@/components/WhatsAppConsultButton";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { lang, setLang, t } = useI18n();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const hashHref = (hash: string) => (isHome ? hash : `/${hash}`);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: t("nav.boxautomat"), href: "/produkte/boxautomat-premium", type: "route" as const },
    { name: t("nav.greifautomat"), href: "/produkte/greifautomat", type: "route" as const },
    { name: t("nav.allMachines"), href: hashHref("#produkte"), type: "hash" as const },
    { name: t("nav.locations"), href: "/standorte", type: "route" as const },
    { name: t("nav.blog"), href: "/blog", type: "route" as const },
    { name: t("nav.contact"), href: hashHref("#kontakt"), type: "hash" as const },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img src={logo} alt="AutomatPlanet" className="h-5 md:h-10 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.name}>
                {link.type === "route" ? (
                  <Link
                    to={link.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                )}
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <WhatsAppConsultButton className="!h-10 !w-auto !px-4 !text-sm" label="WhatsApp Beratung" />
            <CartDrawer />
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <CartDrawer />
          <button
            className="text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border p-4 flex flex-col gap-4">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.name}>
                {link.type === "route" ? (
                  <Link
                    to={link.href}
                    className="text-lg font-medium text-muted-foreground hover:text-foreground block py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    className="text-lg font-medium text-muted-foreground hover:text-foreground block py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                )}
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3 mt-4">
            <WhatsAppConsultButton />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
