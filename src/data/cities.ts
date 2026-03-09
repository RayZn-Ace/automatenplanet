import berlinArcade from "@/assets/cities/berlin-arcade.jpg";
import hamburgArcade from "@/assets/cities/hamburg-arcade.jpg";
import muenchenArcade from "@/assets/cities/muenchen-arcade.jpg";
import koelnArcade from "@/assets/cities/koeln-arcade.jpg";
import frankfurtArcade from "@/assets/cities/frankfurt-arcade.jpg";
import hannoverArcade from "@/assets/cities/hannover-arcade.jpg";
import duesseldorfArcade from "@/assets/cities/duesseldorf-arcade.jpg";
import stuttgartArcade from "@/assets/cities/stuttgart-arcade.jpg";
import leipzigArcade from "@/assets/cities/leipzig-arcade.jpg";
import dresdenArcade from "@/assets/cities/dresden-arcade.jpg";
import dortmundArcade from "@/assets/cities/dortmund-arcade.jpg";
import essenArcade from "@/assets/cities/essen-arcade.jpg";
import bremenArcade from "@/assets/cities/bremen-arcade.jpg";
import nuernbergArcade from "@/assets/cities/nuernberg-arcade.jpg";

export interface CityData {
  slug: string;
  name: string;
  region: string;
  population: string;
  heroImage: string;
  description: string;
  highlights: string[];
  topLocations: string[];
}

export const cities: CityData[] = [
  {
    slug: "berlin",
    name: "Berlin",
    region: "Berlin",
    population: "3,7 Mio.",
    heroImage: berlinArcade,
    description: "Als Deutschlands größte Stadt bietet Berlin unzählige Möglichkeiten für Arcade-Automaten. Von Spätis in Kreuzberg bis zu Shoppingcentern am Alexanderplatz – die Nachfrage nach Entertainment ist enorm.",
    highlights: ["Höchste Späti-Dichte Deutschlands", "Internationale Touristen als Zielgruppe", "Starke Club- und Barszene"],
    topLocations: ["Alexanderplatz", "Friedrichshain", "Kreuzberg", "Prenzlauer Berg", "Charlottenburg"],
  },
  {
    slug: "hamburg",
    name: "Hamburg",
    region: "Hamburg",
    population: "1,9 Mio.",
    heroImage: hamburgArcade,
    description: "Die Hansestadt Hamburg ist bekannt für ihre lebendige Entertainment-Szene. Besonders auf der Reeperbahn und in den zahlreichen Einkaufszentren sind Arcade-Automaten absolute Publikumsmagnete.",
    highlights: ["Reeperbahn – Europas größte Partymeile", "Starke Kaufkraft", "Hoher Tourismusanteil"],
    topLocations: ["Reeperbahn", "Jungfernstieg", "Wandsbek", "Altona", "Harburg"],
  },
  {
    slug: "muenchen",
    name: "München",
    region: "Bayern",
    population: "1,5 Mio.",
    heroImage: muenchenArcade,
    description: "München steht für Qualität und Kaufkraft. Die bayerische Metropole bietet ideale Bedingungen für Premium-Automaten in gehobenen Einkaufszentren und trendigen Stadtvierteln.",
    highlights: ["Höchste Kaufkraft Deutschlands", "Oktoberfest-Stadt", "Premium-Standorte"],
    topLocations: ["Marienplatz", "Schwabing", "Olympiapark", "Pasing", "Sendling"],
  },
  {
    slug: "koeln",
    name: "Köln",
    region: "Nordrhein-Westfalen",
    population: "1,1 Mio.",
    heroImage: koelnArcade,
    description: "Köln ist bekannt für seine Lebensfreude und Feierkultur. Die Stadt am Rhein bietet perfekte Bedingungen für Unterhaltungsautomaten – besonders während der Karnevalszeit.",
    highlights: ["Karnevals-Hochburg", "Starke Kiosk-Kultur", "Viele Einkaufszentren"],
    topLocations: ["Innenstadt", "Ehrenfeld", "Nippes", "Deutz", "Mülheim"],
  },
  {
    slug: "frankfurt",
    name: "Frankfurt am Main",
    region: "Hessen",
    population: "760.000",
    heroImage: frankfurtArcade,
    description: "Die Finanzmetropole Frankfurt bietet eine internationale Zielgruppe mit hoher Kaufkraft. Vom Flughafen bis zur Zeil – überall finden Arcade-Automaten begeisterte Spieler.",
    highlights: ["Internationaler Flughafen", "Business-Publikum", "Die Zeil – Einkaufsmeile"],
    topLocations: ["Hauptwache", "Sachsenhausen", "Flughafen", "MyZeil", "Nordend"],
  },
  {
    slug: "hannover",
    name: "Hannover",
    region: "Niedersachsen",
    population: "540.000",
    heroImage: hannoverArcade,
    description: "Hannover ist die Messestadt Deutschlands. Während der zahlreichen Großveranstaltungen bieten Arcade-Automaten perfekte Unterhaltung für internationale Besucher.",
    highlights: ["Weltgrößtes Messegelände", "Zentrale Lage", "Starke Event-Kultur"],
    topLocations: ["Hauptbahnhof", "Linden", "Ernst-August-Galerie", "Messegelände", "Vahrenwald"],
  },
  {
    slug: "duesseldorf",
    name: "Düsseldorf",
    region: "Nordrhein-Westfalen",
    population: "620.000",
    heroImage: duesseldorfArcade,
    description: "Die Landeshauptstadt NRWs ist bekannt für Mode, Kunst und eine lebendige Altstadt. Die 'längste Theke der Welt' bietet ideale Standorte für Entertainment-Automaten.",
    highlights: ["Altstadt-Gastronomie", "Königsallee Shopping", "Japanische Community"],
    topLocations: ["Altstadt", "Königsallee", "Bilk", "Flingern", "Oberkassel"],
  },
  {
    slug: "stuttgart",
    name: "Stuttgart",
    region: "Baden-Württemberg",
    population: "635.000",
    heroImage: stuttgartArcade,
    description: "Die schwäbische Metropole vereint Industrie und Lifestyle. Mit starker Kaufkraft und vielen Einkaufszentren bietet Stuttgart exzellente Bedingungen für Arcade-Automaten.",
    highlights: ["Automobil-Stadt", "Hohe Kaufkraft", "Milaneo Shopping"],
    topLocations: ["Königstraße", "Bad Cannstatt", "Milaneo", "Gerber", "Vaihingen"],
  },
  {
    slug: "leipzig",
    name: "Leipzig",
    region: "Sachsen",
    population: "600.000",
    heroImage: leipzigArcade,
    description: "Leipzig ist eine der am schnellsten wachsenden Städte Deutschlands. Die junge, kreative Bevölkerung macht die Stadt zum perfekten Markt für Arcade-Entertainment.",
    highlights: ["Junge Bevölkerung", "Kreative Szene", "Wachstumsmarkt"],
    topLocations: ["Innenstadt", "Connewitz", "Plagwitz", "Höfe am Brühl", "Reudnitz"],
  },
  {
    slug: "dresden",
    name: "Dresden",
    region: "Sachsen",
    population: "560.000",
    heroImage: dresdenArcade,
    description: "Die sächsische Landeshauptstadt verbindet Kultur und moderne Lebensart. Touristen und Einheimische sorgen für konstante Nachfrage nach Entertainment.",
    highlights: ["Touristenmagnet", "Altmarkt-Galerie", "Studentenstadt"],
    topLocations: ["Altstadt", "Neustadt", "Altmarkt-Galerie", "Prager Straße", "Striesen"],
  },
];

export const getCityBySlug = (slug: string): CityData | undefined => {
  return cities.find(city => city.slug === slug);
};