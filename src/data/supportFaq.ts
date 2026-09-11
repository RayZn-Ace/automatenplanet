export interface SupportFaqItem {
  id: string;
  topic: "Auswahl" | "Showroom" | "Lieferung" | "Aufbau" | "Technik" | "Zahlung" | "Support";
  q: string;
  /** Antwort als React-freier Text mit optionalen Links. */
  a: string;
  links?: { label: string; to: string }[];
}

/**
 * Antworten leiten sich ausschließlich aus bestehenden Projektangaben ab
 * (Produktdaten, Versandseite, Rückgabe/Gewährleistung, Handbuch).
 */
export const supportFaqs: SupportFaqItem[] = [
  {
    id: "auswahl-modell",
    topic: "Auswahl",
    q: "Welcher Automat passt zu meinem Standort?",
    a: "Das hängt von Stellfläche, Zielgruppe und gewünschtem Bezahlsystem ab. In der Automatenübersicht siehst du zu jedem Modell Maße, Stromangabe und Nettopreis. Wenn du unsicher bist, gehen wir die Auswahl telefonisch oder per WhatsApp gemeinsam durch.",
    links: [
      { label: "Alle Automaten ansehen", to: "/#produkte" },
      { label: "Boxautomat Premium", to: "/produkte/boxautomat-premium" },
    ],
  },
  {
    id: "auswahl-varianten",
    topic: "Auswahl",
    q: "Kann ich zwischen Münzeinwurf und Scheineinwurf wählen?",
    a: "Beim Boxautomat Premium wählst du die Variante direkt auf der Produktseite. Zusätzlich gibt es den Comboboxautomat mit Münz- und Scheineinwurf als eigenes Modell.",
    links: [
      { label: "Boxautomat Premium", to: "/produkte/boxautomat-premium" },
      { label: "Comboboxautomat", to: "/produkte/comboboxautomat" },
    ],
  },
  {
    id: "showroom-hannover",
    topic: "Showroom",
    q: "Kann ich die Automaten vorher ansehen?",
    a: "Ja. In Hannover stehen die Geräte auf 1.000 m² zum Ansehen und Vergleichen. Eine Besichtigung findet nach Terminvereinbarung statt - melde dich telefonisch oder per WhatsApp.",
    links: [{ label: "Showroom-Termin anfragen", to: "/support#kontakt" }],
  },
  {
    id: "showroom-termin",
    topic: "Showroom",
    q: "Wie vereinbare ich einen Termin?",
    a: "Schreib uns per WhatsApp oder E-Mail mit deinem Wunschzeitraum, oder ruf direkt an. Wir bestätigen den Termin persönlich - eine automatische Online-Buchung gibt es aktuell nicht.",
    links: [{ label: "Kontaktmöglichkeiten", to: "/support#kontakt" }],
  },
  {
    id: "lieferung-ablauf",
    topic: "Lieferung",
    q: "Wie läuft die Lieferung ab?",
    a: "Die Lieferung erfolgt ab Lager Hannover per Spedition, frei Bordsteinkante. Der Versand erfolgt in der Regel innerhalb von 24 Stunden nach Zahlungseingang, die Zustellung dauert je nach Zielland 2 bis 8 Werktage.",
    links: [{ label: "Versand und Lieferung", to: "/versand" }],
  },
  {
    id: "lieferung-europa",
    topic: "Lieferung",
    q: "Liefert ihr auch ins europäische Ausland?",
    a: "Ja, wir versenden europaweit an gewerbliche Kunden. Die Laufzeit richtet sich nach dem Zielland (2 bis 8 Werktage). Versandkosten sind nicht im Nettopreis enthalten und werden separat ausgewiesen.",
    links: [{ label: "Versandkosten und Laufzeiten", to: "/versand" }],
  },
  {
    id: "lieferung-status",
    topic: "Lieferung",
    q: "Wo sehe ich den Status meiner Bestellung?",
    a: "Über den persönlichen Link in deiner Bestellbestätigung gelangst du zur Bestellstatus-Seite. Bei Fragen zur Sendung erreichst du uns telefonisch oder per E-Mail.",
    links: [{ label: "Frage zur Bestellung", to: "/support#kontakt" }],
  },
  {
    id: "aufbau-einweisung",
    topic: "Aufbau",
    q: "Muss ich den Automaten selbst aufbauen?",
    a: "Die Geräte kommen betriebsbereit oder mit überschaubarem Montageaufwand an. Für die Inbetriebnahme gibt es Handbücher, auch zu den Einstellungen am Münzprüfer, und wir unterstützen dich telefonisch. Eine Einweisung vor Ort im Showroom ist nach Terminvereinbarung möglich.",
    links: [{ label: "Handbücher", to: "/handbuch" }],
  },
  {
    id: "technik-strom",
    topic: "Technik",
    q: "Welchen Stromanschluss braucht ein Automat?",
    a: "Die Geräte laufen an einer normalen 220-V-Steckdose. Der genaue Verbrauch ist modellabhängig und steht in den technischen Daten der jeweiligen Produktseite.",
    links: [{ label: "Modelle und technische Daten", to: "/#produkte" }],
  },
  {
    id: "technik-outdoor",
    topic: "Technik",
    q: "Sind die Automaten für den Außenbereich geeignet?",
    a: "Die Geräte sind für den Innenbereich und überdachte, trockene Aufstellorte gedacht. Für einen geplanten Außenstandort sprich uns vorher an - dann prüfen wir, ob das Modell dafür in Frage kommt.",
    links: [{ label: "Technische Rückfrage stellen", to: "/support#kontakt" }],
  },
  {
    id: "zahlung-rechnung",
    topic: "Zahlung",
    q: "Welche Zahlungsarten gibt es im Bestellvorgang?",
    a: "Die im Bestellvorgang angezeigten Zahlungsarten kannst du direkt in der Kasse auswählen. Alle Preise sind netto zzgl. gesetzlicher Mehrwertsteuer und Versandkosten. Verkauft wird ausschließlich an Unternehmer im Sinne des § 14 BGB.",
    links: [
      { label: "Zur Kasse", to: "/kasse" },
      { label: "AGB", to: "/agb" },
    ],
  },
  {
    id: "zahlung-finanzierung",
    topic: "Zahlung",
    q: "Ist eine Finanzierung oder Leasing möglich?",
    a: "Dazu beraten wir individuell. Frag deine Finanzierungsmöglichkeiten mit Modell und Menge bei uns an - wir melden uns mit einer konkreten Auskunft zurück. Eine automatische Leasingberechnung gibt es hier nicht.",
    links: [{ label: "Finanzierung anfragen", to: "/support#kontakt" }],
  },
  {
    id: "support-nachkauf",
    topic: "Support",
    q: "Welchen Support gibt es nach dem Kauf?",
    a: "Du erreichst uns telefonisch, per WhatsApp und per E-Mail. Wir helfen bei Einrichtung, Einstellungen und technischen Fragen und greifen dafür auf die Handbücher zurück.",
    links: [
      { label: "Support kontaktieren", to: "/support#kontakt" },
      { label: "Handbücher", to: "/handbuch" },
    ],
  },
  {
    id: "support-ersatzteile",
    topic: "Support",
    q: "Wie bekomme ich Ersatzteile?",
    a: "Schick uns Modell, Bestellnummer und eine kurze Beschreibung des benötigten Teils, gern mit Foto. Wir prüfen die Verfügbarkeit und melden uns mit Preis und Lieferweg zurück.",
    links: [{ label: "Ersatzteil anfragen", to: "/support#kontakt" }],
  },
  {
    id: "support-gewaehrleistung",
    topic: "Support",
    q: "Wie melde ich einen Gewährleistungsfall?",
    a: "Melde dich mit Modell, Bestellnummer, Fehlerbeschreibung sowie Fotos oder einem kurzen Video und deinen Kontaktdaten. Die geltenden Bedingungen stehen unverändert auf der Seite Rückgabe und Gewährleistung.",
    links: [{ label: "Rückgabe und Gewährleistung", to: "/rueckgabe" }],
  },
];

export const supportFaqTopics = [
  "Alle",
  "Auswahl",
  "Showroom",
  "Lieferung",
  "Aufbau",
  "Technik",
  "Zahlung",
  "Support",
] as const;
