import { openConsentSettings } from "@/components/CookieBanner";
import logo from "@/assets/logo-automatplanet.png";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="AutomatPlanet" className="h-10 w-auto" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Europas führender Anbieter für Arcade-Automaten und Entertainment-Maschinen.
            </p>
            <p className="text-sm text-muted-foreground">
              Fragen? Rufen Sie uns an:{" "}
              <a href="tel:+4951112282957" className="font-bold text-primary hover:underline">
                0511 12282957
              </a>
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">Automaten</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Greifautomaten</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Boxautomaten</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Basketball Automaten</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Arcade Automaten</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Prize Maschinen</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">Unternehmen</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Über uns</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Kontakt</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Karriere</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">Rechtliches</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/impressum" className="hover:text-foreground transition-colors">Impressum</a></li>
              <li><a href="/datenschutz" className="hover:text-foreground transition-colors">Datenschutz</a></li>
              <li>
                <button type="button" onClick={openConsentSettings} className="hover:text-foreground transition-colors">
                  Cookie-Einstellungen
                </button>
              </li>
              <li><a href="#" className="hover:text-foreground transition-colors">AGB</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} AutomatPlanet.de – Alle Rechte vorbehalten.
        </div>
      </div>
    </footer>
  );
};

export default Footer;