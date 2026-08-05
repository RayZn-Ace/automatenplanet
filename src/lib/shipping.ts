// Versandkosten (netto, EUR) je Zielland – Speditionsversand.
export const SHIPPING_NET_BY_COUNTRY: Record<string, number> = {
  DE: 150,
  AT: 250,
  NL: 250,
  BE: 250,
  LU: 250,
  FR: 290,
  PL: 250,
  CZ: 250,
  DK: 290,
  IT: 320,
  ES: 350,
  CH: 390,
};

export const SHIPPING_COUNTRIES = [
  { code: "DE", name: "Deutschland" },
  { code: "AT", name: "Österreich" },
  { code: "CH", name: "Schweiz" },
  { code: "NL", name: "Niederlande" },
  { code: "BE", name: "Belgien" },
  { code: "LU", name: "Luxemburg" },
  { code: "FR", name: "Frankreich" },
  { code: "PL", name: "Polen" },
  { code: "CZ", name: "Tschechien" },
  { code: "DK", name: "Dänemark" },
  { code: "IT", name: "Italien" },
  { code: "ES", name: "Spanien" },
];

export const shippingNet = (country: string) => SHIPPING_NET_BY_COUNTRY[country] ?? 350;
