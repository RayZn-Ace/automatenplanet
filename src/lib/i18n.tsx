import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "de" | "en";

function detectLanguage(): Lang {
  const browserLang = navigator.language || (navigator as any).userLanguage || "de";
  return browserLang.startsWith("de") ? "de" : "en";
}

const translations = {
  de: {
    // Navbar
    "nav.boxautomat": "Boxautomat",
    "nav.greifautomat": "Greifautomat",
    "nav.allMachines": "Alle Automaten",
    "nav.locations": "Standorte",
    "nav.blog": "Blog",
    "nav.contact": "Kontakt",
    "nav.consultation": "Beratung",
    "nav.inquiry": "Anfrage",
    // Product page
    "product.backToProducts": "Zurück zu Produkten",
    "product.notFound": "Produkt nicht gefunden",
    "product.viewAll": "Alle Produkte ansehen",
    "product.net": "netto",
    "product.dimensions": "Maße",
    "product.power": "Leistung",
    "product.shippingTitle": "Europaweiter Versand in 24h",
    "product.shippingCost": "Deutschland: 150€ netto (zzgl. zum Produktpreis)",
    "product.buyNow": "Jetzt kaufen",
    "product.datasheet": "Produktdatenblatt",
    "product.callUs": "Fragen? Rufen Sie uns an:",
    "product.details": "Details",
    "product.relatedProducts": "Ähnliche Produkte",
    // SEO sections
    "seo.features": "Eigenschaften & Features",
    "seo.useCases": "Einsatzbereiche",
    "seo.benefits": "Ihre Vorteile",
    "seo.faq": "Häufige Fragen",
    "seo.gallery": "Impressionen",
    "seo.perfectFor": "Perfekt geeignet für",
    "seo.whyChoose": "Warum diesen Automaten wählen?",
    "seo.technicalDetails": "Technische Details",
    "seo.included": "Im Lieferumfang enthalten",
    "seo.roi": "Return on Investment",
    "seo.roiDescription": "Erfahrungsgemäß amortisieren sich unsere Automaten innerhalb weniger Monate.",
    // Products section
    "products.title": "Unsere",
    "products.titleAccent": "Top-Automaten",
    "products.subtitle": "Professionelle Unterhaltungsautomaten mit maximaler Ertragskraft. Alle Preise netto.",
    // Hero
    "hero.cta": "Jetzt anfragen",
    // General
    "general.learnMore": "Mehr erfahren",
    "general.contact": "Kontakt",
  },
  en: {
    // Navbar
    "nav.boxautomat": "Boxing Machine",
    "nav.greifautomat": "Claw Machine",
    "nav.allMachines": "All Machines",
    "nav.locations": "Locations",
    "nav.blog": "Blog",
    "nav.contact": "Contact",
    "nav.consultation": "Consultation",
    "nav.inquiry": "Inquiry",
    // Product page
    "product.backToProducts": "Back to Products",
    "product.notFound": "Product not found",
    "product.viewAll": "View all products",
    "product.net": "net",
    "product.dimensions": "Dimensions",
    "product.power": "Power",
    "product.shippingTitle": "Europe-wide shipping within 24h",
    "product.shippingCost": "Germany: €150 net",
    "product.buyNow": "Buy Now",
    "product.datasheet": "Product Datasheet",
    "product.callUs": "Questions? Call us:",
    "product.details": "Details",
    "product.relatedProducts": "Related Products",
    // SEO sections
    "seo.features": "Features & Specifications",
    "seo.useCases": "Use Cases",
    "seo.benefits": "Your Benefits",
    "seo.faq": "Frequently Asked Questions",
    "seo.gallery": "Gallery",
    "seo.perfectFor": "Perfect for",
    "seo.whyChoose": "Why choose this machine?",
    "seo.technicalDetails": "Technical Details",
    "seo.included": "Included in Delivery",
    "seo.roi": "Return on Investment",
    "seo.roiDescription": "Our machines typically pay for themselves within just a few months.",
    // Products section
    "products.title": "Our",
    "products.titleAccent": "Top Machines",
    "products.subtitle": "Professional entertainment machines with maximum earning potential. All prices net.",
    // Hero
    "hero.cta": "Get a Quote",
    // General
    "general.learnMore": "Learn More",
    "general.contact": "Contact",
  },
} as const;

type TranslationKey = keyof typeof translations.de;

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>(detectLanguage);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: TranslationKey): string => {
    return translations[lang][key] || translations.de[key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
};
