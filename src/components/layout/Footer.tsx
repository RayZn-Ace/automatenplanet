import { Link } from "react-router-dom";
import { openConsentSettings } from "@/components/CookieBanner";
import logo from "@/assets/logo-automatplanet.png";

const productLinks = [
  { label: "Greifautomaten", to: "/produkte/greifautomat" },
  { label: "Boxautomaten", to: "/produkte/boxautomat-premium" },
  { label: "Basketball Automaten", to: "/produkte/basketball-machine" },
  { label: "Arcade Automaten", to: "/produkte/arcade-machine" },
  { label: "Prize Maschinen", to: "/produkte/lucky-7-machine" },
];

const legalLinks = [
  { label: "Impressum", to: "/impressum" },
  { label: "Datenschutz", to: "/datenschutz" },
  { label: "AGB", to: "/agb" },
  { label: "Rückgabe und Gewährleistung", to: "/rueckgabe" },
  { label: "Versand und Lieferung", to: "/versand" },
];

const companyLinks = [
  { label: "Blog", to: "/blog" },
  { label: "Kontakt", to: "/#kontakt" },
];

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
              {productLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">Unternehmen</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {companyLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">Rechtliches</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {legalLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <button type="button" onClick={openConsentSettings} className="hover:text-foreground transition-colors">
                  Cookie-Einstellungen
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/50 p-4 mb-8 text-sm text-foreground font-medium text-center">
          Verkauf ausschließlich an Unternehmer im Sinne des § 14 BGB. Alle Preise zzgl. gesetzlicher Mehrwertsteuer
          und Versandkosten.
        </div>

        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} AutomatPlanet.de – Alle Rechte vorbehalten.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
