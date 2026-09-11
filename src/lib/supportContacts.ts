// Zentrale, bereits im Projekt verwendete Kontaktdaten.
// Bewusst nur bestehende Kanäle - keine neuen Nummern, Adressen oder Öffnungszeiten.

export const PHONE_DISPLAY = "0511 12282957";
export const PHONE_HREF = "tel:+4951112282957";
export const CONTACT_EMAIL = "kontakt@automatplanet.com";
export const WHATSAPP_PHONE = "4915510706035";

export const whatsappHref = (text: string): string =>
  `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(text)}`;

export const mailtoHref = (subject: string, body?: string): string => {
  const params = new URLSearchParams({ subject, ...(body ? { body } : {}) });
  return `mailto:${CONTACT_EMAIL}?${params.toString().replace(/\+/g, "%20")}`;
};

/** Vorbefüllte Nachricht für eine Terminanfrage (Beratung / Showroom Hannover). */
export const APPOINTMENT_TEXT =
  "Hallo, ich möchte einen Termin vereinbaren (Beratung oder Showroom-Besichtigung in Hannover). Passende Zeiten bei mir: ";

/** Showroom-Fläche - vom Betreiber bestätigt. Adresse liegt hier bewusst nicht vor. */
export const SHOWROOM_AREA = "1.000 m²";
export const SHOWROOM_CITY = "Hannover";
