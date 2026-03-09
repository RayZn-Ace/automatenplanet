import clawMachine from "@/assets/claw-machine.jpg";
import boxingMachine from "@/assets/boxing-machine.jpg";
import basketballMachine from "@/assets/basketball-machine.jpg";
import arcadeCabinet from "@/assets/arcade-cabinet.jpg";
import miniClaw from "@/assets/mini-claw.jpg";
import ticketMachine from "@/assets/ticket-machine.jpg";
import arcadeHero from "@/assets/arcade-hero.jpg";

export interface BlogArticle {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  image: string;
}

export const blogArticles: BlogArticle[] = [
  {
    slug: "greifautomat-kaufen-lohnt-sich-das",
    title: "Greifautomat kaufen – lohnt sich das?",
    excerpt: "Erfahren Sie, warum Greifautomaten eine der besten Investitionen im Unterhaltungsbereich sind und wie Sie damit passives Einkommen erzielen.",
    category: "Greifautomaten",
    readTime: "8 Min.",
    date: "2026-03-01",
    image: clawMachine,
  },
  {
    slug: "boxautomat-aufstellen-einnahmen-tipps",
    title: "Boxautomat aufstellen – Einnahmen und Tipps",
    excerpt: "Boxautomaten sind absolute Publikumsmagnete. Hier erfahren Sie alles über Standortwahl, Einnahmen und die besten Modelle.",
    category: "Boxautomaten",
    readTime: "7 Min.",
    date: "2026-02-25",
    image: boxingMachine,
  },
  {
    slug: "arcade-automaten-fuer-kioske-spaetis",
    title: "Arcade Automaten für Kioske und Spätis",
    excerpt: "Kompakte Automaten für kleine Ladenflächen – so steigern Kiosk-Besitzer ihren Umsatz mit Entertainment.",
    category: "Standorte",
    readTime: "6 Min.",
    date: "2026-02-20",
    image: miniClaw,
  },
  {
    slug: "basketball-automaten-publikumsmagnet",
    title: "Basketball Automaten als Publikumsmagnet",
    excerpt: "Warum Basketball-Arcade-Automaten zu den beliebtesten Entertainment-Maschinen gehören und wo sie am besten performen.",
    category: "Basketball",
    readTime: "5 Min.",
    date: "2026-02-15",
    image: basketballMachine,
  },
  {
    slug: "arcade-business-starten-deutschland",
    title: "Arcade Business starten in Deutschland",
    excerpt: "Der komplette Leitfaden: Von der Geschäftsidee über Genehmigungen bis zum profitablen Arcade-Business.",
    category: "Business",
    readTime: "12 Min.",
    date: "2026-02-10",
    image: arcadeHero,
  },
  {
    slug: "welche-automaten-bringen-am-meisten-geld",
    title: "Welche Automaten bringen am meisten Geld?",
    excerpt: "Vergleich der profitabelsten Arcade-Automaten: Greifautomat vs. Boxautomat vs. Basketball – wer gewinnt?",
    category: "Business",
    readTime: "9 Min.",
    date: "2026-02-05",
    image: ticketMachine,
  },
  {
    slug: "arcade-automaten-im-einkaufszentrum",
    title: "Arcade Automaten im Einkaufszentrum",
    excerpt: "Shoppingcenter sind Premium-Standorte für Arcade-Automaten. Erfahren Sie, wie Sie dort erfolgreich aufstellen.",
    category: "Standorte",
    readTime: "7 Min.",
    date: "2026-01-30",
    image: arcadeHero,
  },
  {
    slug: "claw-machine-business-guide",
    title: "Claw Machine Business Guide",
    excerpt: "The complete English guide to starting a claw machine business in Europe – from procurement to profit optimization.",
    category: "Greifautomaten",
    readTime: "10 Min.",
    date: "2026-01-25",
    image: clawMachine,
  },
  {
    slug: "arcade-automaten-events-messen",
    title: "Arcade Automaten für Events und Messen",
    excerpt: "Mietautomaten als Show-Highlight: So setzen Sie Arcade-Games auf Events gewinnbringend ein.",
    category: "Events",
    readTime: "6 Min.",
    date: "2026-01-20",
    image: arcadeCabinet,
  },
  {
    slug: "wie-viel-umsatz-bringt-ein-greifautomat",
    title: "Wie viel Umsatz bringt ein Greifautomat?",
    excerpt: "Konkrete Zahlen und Fallstudien: Was Sie realistisch mit einem Greifautomaten verdienen können.",
    category: "Greifautomaten",
    readTime: "8 Min.",
    date: "2026-01-15",
    image: miniClaw,
  },
];