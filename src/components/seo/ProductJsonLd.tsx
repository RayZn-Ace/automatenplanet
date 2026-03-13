import { Helmet } from "react-helmet-async";
import { ProductData } from "@/data/products";

interface ProductJsonLdProps {
  product: ProductData;
}

const ProductJsonLd = ({ product }: ProductJsonLdProps) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: `https://automatplanet.de${product.image}`,
    url: `https://automatplanet.de/produkte/${product.slug}`,
    brand: {
      "@type": "Brand",
      name: "AutomatPlanet",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: product.price.toString(),
      priceValidUntil: "2027-12-31",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "AutomatPlanet",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "150",
          currency: "EUR",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "DE",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 3,
            unitCode: "DAY",
          },
        },
      },
    },
    ...(product.dimensions && {
      additionalProperty: [
        {
          "@type": "PropertyValue",
          name: "Dimensions",
          value: product.dimensions,
        },
      ],
    }),
  };

  return (
    <Helmet>
      <title>{product.metaTitle}</title>
      <meta name="description" content={product.metaDescription} />
      <meta name="keywords" content={product.keywords.join(", ")} />
      <link rel="canonical" href={`https://automatplanet.de/produkte/${product.slug}`} />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};

export default ProductJsonLd;
