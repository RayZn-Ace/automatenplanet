import { Helmet } from "react-helmet-async";
import { ProductData } from "@/data/products";
import { grossPriceValue } from "@/lib/pricing";
import { VARIANTS_BY_SLUG } from "@/lib/variants";

interface ProductJsonLdProps {
  product: ProductData;
  /** Nur das JSON-LD ausgeben (wenn die Seite Title/Description/Canonical selbst setzt). */
  jsonLdOnly?: boolean;
}

const variantSlug = (label: string) =>
  label.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");

const ProductJsonLd = ({ product, jsonLdOnly = false }: ProductJsonLdProps) => {

  const url = `https://automatplanet.de/produkte/${product.slug}`;
  const variants = VARIANTS_BY_SLUG[product.slug];

  const shippingDetails = {
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
  };

  const merchantReturnPolicy = {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "DE",
    returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
    merchantReturnLink: "https://automatplanet.de/rueckgabe",
  };

  const availability =
    product.availability === "out_of_stock"
      ? "https://schema.org/OutOfStock"
      : product.availability === "preorder"
        ? "https://schema.org/PreOrder"
        : product.availability === "backorder"
          ? "https://schema.org/BackOrder"
          : "https://schema.org/InStock";

  const baseOffer = {
    "@type": "Offer",
    priceCurrency: "EUR",
    priceValidUntil: "2027-12-31",
    valueAddedTaxIncluded: true,
    availability,
    eligibleCustomerType: "https://schema.org/Business",
    itemCondition: "https://schema.org/NewCondition",
    seller: {
      "@type": "Organization",
      name: "AutomatPlanet",
    },
    shippingDetails,
    hasMerchantReturnPolicy: merchantReturnPolicy,
  };

  const offers = variants
    ? variants.map((v) => ({
        ...baseOffer,
        name: `${product.name} – ${v.label}`,
        sku: `${product.slug}--${variantSlug(v.label)}`,
        url: `${url}?variante=${variantSlug(v.label)}`,
        price: grossPriceValue(v.price),
      }))
    : [
        {
          ...baseOffer,
          sku: product.slug,
          url,
          price: grossPriceValue(product.price),
        },
      ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: `https://automatplanet.de${product.image}`,
    url,
    sku: product.slug,
    category: product.category,
    brand: {
      "@type": "Brand",
      name: "AutomatPlanet",
    },
    offers: offers.length > 1 ? offers : offers[0],

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

  if (jsonLdOnly) {
    return (
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
    );
  }

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
