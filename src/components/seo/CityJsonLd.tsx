import { Helmet } from "react-helmet-async";
import { CityData } from "@/data/cities";

interface CityJsonLdProps {
  city: CityData;
}

const CityJsonLd = ({ city }: CityJsonLdProps) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `AutomatPlanet – Arcade-Automaten ${city.name}`,
    description: city.description,
    url: `https://automatplanet.de/standorte/${city.slug}`,
    image: city.heroImage,
    telephone: "+4915123456789",
    address: {
      "@type": "PostalAddress",
      addressLocality: city.name,
      addressRegion: city.region,
      addressCountry: "DE",
    },
    areaServed: {
      "@type": "City",
      name: city.name,
    },
    priceRange: "€€",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    sameAs: [
      "https://wa.me/4915123456789",
    ],
    serviceArea: city.topLocations.map((loc) => ({
      "@type": "Place",
      name: `${loc}, ${city.name}`,
    })),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Arcade-Automaten",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: { "@type": "Product", name: "Greifautomat" },
          priceCurrency: "EUR",
          price: "1290",
        },
        {
          "@type": "Offer",
          itemOffered: { "@type": "Product", name: "Boxautomat" },
          priceCurrency: "EUR",
          price: "3990",
        },
        {
          "@type": "Offer",
          itemOffered: { "@type": "Product", name: "Basketball Automat" },
          priceCurrency: "EUR",
          price: "2990",
        },
      ],
    },
  };

  return (
    <Helmet>
      <title>{`Arcade Automaten ${city.name} – Kaufen & Mieten | AutomatPlanet`}</title>
      <meta
        name="description"
        content={`Arcade-Automaten in ${city.name}: Greifautomaten, Boxautomaten & mehr. Lieferung, Aufstellung und Service in ${city.name} und ${city.region}. Jetzt beraten lassen!`}
      />
      <link rel="canonical" href={`https://automatplanet.de/standorte/${city.slug}`} />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};

export default CityJsonLd;