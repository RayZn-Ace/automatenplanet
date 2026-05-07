export interface Testimonial {
  name: string;
  role: string;
  text: string;
  rating: number;
  verified: boolean;
}

export const testimonials: Testimonial[] = [
  { name: "Mehmet K.", role: "Späti-Besitzer, Berlin", text: "Der Boxautomat hat in der ersten Woche schon 380€ eingespielt. Verrückt!", rating: 5, verified: true },
  { name: "Sarah L.", role: "Bar-Inhaberin, Hamburg", text: "Unsere Gäste lieben das Teil. Jeden Abend Wartezeit am Automaten.", rating: 5, verified: true },
  { name: "Thomas R.", role: "Center-Manager, München", text: "Drei Monate – ROI erreicht. Bestelle jetzt einen zweiten.", rating: 5, verified: false },
  { name: "Daniel B.", role: "Fitnessstudio, Köln", text: "Mega Aufmerksamkeit im Eingangsbereich. Mitglieder lieben es nach dem Training.", rating: 5, verified: true },
  { name: "Aylin Y.", role: "Shisha-Bar, Frankfurt", text: "Top Verarbeitung, schneller Versand. Lief vom ersten Tag an.", rating: 5, verified: true },
  { name: "Markus W.", role: "Eventagentur, Stuttgart", text: "Auf jedem Firmenevent der absolute Hit. Sehr robuste Technik.", rating: 5, verified: false },
  { name: "Lisa H.", role: "Bowlingcenter, Dortmund", text: "Spielt sich praktisch von selbst ab. Wartung quasi null.", rating: 5, verified: true },
  { name: "Kevin S.", role: "Kiosk, Leipzig", text: "ROI nach 9 Wochen. Klare Empfehlung für jede Lage mit Laufkundschaft.", rating: 5, verified: false },
  { name: "Jasmin T.", role: "Bar, Düsseldorf", text: "Service vor und nach dem Kauf war absolut tadellos. Gerne wieder.", rating: 5, verified: true },
  { name: "Robert F.", role: "Spielothek, Nürnberg", text: "Solide Industriequalität, läuft ohne Ausfall im Dauerbetrieb.", rating: 5, verified: true },
];
