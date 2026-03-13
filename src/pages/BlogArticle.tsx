import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { blogArticles } from "@/data/blogArticles";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Calendar, Tag } from "lucide-react";
import { motion } from "framer-motion";
import BlogPreview from "@/components/sections/BlogPreview";

// Full article content mapped by slug
const articleContent: Record<string, string[]> = {
  "greifautomat-kaufen-lohnt-sich-das": [
    "## Warum ein Greifautomat eine lohnende Investition ist",
    "Greifautomaten (Claw Machines) gehören zu den beliebtesten Unterhaltungsautomaten weltweit. Sie sind nicht nur ein Klassiker in Arcades und Einkaufszentren, sondern auch ein bewährtes Geschäftsmodell für passives Einkommen.",
    "### Die Zahlen sprechen für sich",
    "Ein gut platzierter Greifautomat erwirtschaftet durchschnittlich **800 bis 2.500 Euro pro Monat**. Bei Anschaffungskosten ab 1.290€ amortisiert sich die Investition oft innerhalb von 2–3 Monaten. Das macht den Greifautomaten zu einer der rentabelsten Investitionen im Entertainment-Bereich.",
    "### Standortwahl ist entscheidend",
    "Der Erfolg eines Greifautomaten hängt maßgeblich vom Standort ab. **Premium-Standorte** sind:\n- Einkaufszentren mit hoher Kundenfrequenz\n- Kioske und Spätis in belebten Vierteln\n- Flughäfen und Bahnhöfe\n- Gaststätten und Restaurants\n- Freizeitparks und Kinos",
    "### Betriebskosten im Überblick",
    "Die laufenden Kosten eines Greifautomaten sind überraschend niedrig:\n- **Strom**: ca. 15–25€ pro Monat\n- **Warenkosten** (Plüschtiere etc.): ca. 50–150€ pro Monat\n- **Wartung**: minimal, da robuste Technik\n- **Standortmiete**: je nach Vereinbarung (oft Umsatzbeteiligung)",
    "### Tipps für maximale Einnahmen",
    "1. **Greifstärke richtig einstellen** – Fair genug, damit Spieler motiviert bleiben\n2. **Attraktive Preise einlegen** – Beliebte Plüschtiere und Trendprodukte\n3. **LED-Beleuchtung nutzen** – Zieht die Aufmerksamkeit auf sich\n4. **Regelmäßig befüllen** – Ein leerer Automat verdient kein Geld",
    "### Fazit",
    "Ein Greifautomat ist eine solide Investition mit niedrigem Risiko und hohem Ertragspotenzial. Besonders für Einsteiger im Automaten-Business ist er der perfekte Start.",
  ],
  "boxautomat-aufstellen-einnahmen-tipps": [
    "## Boxautomat aufstellen: Der komplette Leitfaden",
    "Boxautomaten sind die unangefochtenen Stars unter den Unterhaltungsautomaten. Mit digitalen Highscore-Displays und LED-Effekten ziehen sie in jeder Location die Aufmerksamkeit auf sich.",
    "### Einnahmen mit einem Boxautomaten",
    "Ein Boxautomat an einem guten Standort generiert **1.000 bis 3.000 Euro monatlich**. In Clubs und Bars können die Einnahmen am Wochenende besonders hoch sein, da die Hemmschwelle sinkt und der Wettbewerbsgeist steigt.",
    "### Die besten Standorte für Boxautomaten",
    "- **Bars und Clubs**: Absolute Top-Performer am Wochenende\n- **Fitnessstudios**: Perfekte Zielgruppe\n- **Shoppingcenter**: Hohe Frequenz\n- **Spielhallen**: Klassischer Einsatzort\n- **Veranstaltungsorte**: Events und Messen",
    "### Worauf beim Kauf achten?",
    "1. **Robustes Boxpolster** – Muss tausende Schläge aushalten\n2. **Digitales Display** – LED-Highscore-Anzeige ist Pflicht\n3. **Solide Standfestigkeit** – Sicherheit geht vor\n4. **Münzprüfer-Qualität** – Zuverlässige Annahme von 1€ und 2€ Münzen",
    "### Rechtliche Aspekte",
    "Für das Aufstellen von Boxautomaten benötigen Sie in Deutschland in der Regel **keine Spielhallenkonzession**, da es sich um ein Geschicklichkeitsspiel handelt. Dennoch sollten Sie sich bei Ihrer zuständigen Behörde erkundigen.",
    "### Fazit",
    "Ein Boxautomat ist eine hervorragende Ergänzung für jede Entertainment-Location und amortisiert sich bei guter Platzierung innerhalb von 2–4 Monaten.",
  ],
  "arcade-automaten-fuer-kioske-spaetis": [
    "## Arcade-Automaten für Kioske und Spätis",
    "Kioske und Spätis sind ideale Standorte für kompakte Unterhaltungsautomaten. Mit wenig Platzbedarf generieren sie zusätzliches Einkommen und ziehen neue Kunden an.",
    "### Warum Automaten im Kiosk funktionieren",
    "Kiosk-Kunden kommen oft spontan und haben Bargeld dabei – die perfekte Voraussetzung für Münzautomaten. Besonders in belebten Stadtvierteln sind die **Einnahmen überraschend hoch**, da die Frequenz stimmt.",
    "### Die besten Automaten für Kioske",
    "1. **Mini Greifautomat** (45×45 cm) – Der Platzsparer für jeden Laden\n2. **Kapselautomaten** – Klein, günstig, beliebt bei Kindern\n3. **Boxautomat** – Wenn genug Platz vorhanden ist\n4. **Prize Machines** – Kleine Gewinnspielautomaten",
    "### Platzbedarf und Installation",
    "Ein Mini-Greifautomat benötigt nur **0,5 m² Stellfläche** und eine normale 220V-Steckdose. Die Installation dauert etwa 30 Minuten und erfordert keine baulichen Veränderungen.",
    "### Erfolgsbeispiele",
    "- **Späti in Berlin-Kreuzberg**: 2 Mini-Greifautomaten → 1.200€ Zusatzeinnahmen/Monat\n- **Kiosk in Hamburg-Altona**: 1 Boxautomat → 900€/Monat\n- **Trinkhalle in Köln**: 1 Greifautomat + 1 Kapselautomat → 800€/Monat",
    "### Fazit",
    "Für Kiosk- und Späti-Betreiber sind kompakte Automaten eine einfache Möglichkeit, den Umsatz zu steigern – ohne Personalaufwand und mit minimaler Investition.",
  ],
  "basketball-automaten-publikumsmagnet": [
    "## Basketball Automaten: Der ultimative Publikumsmagnet",
    "Basketball-Arcade-Automaten gehören zu den unterhaltsamsten und profitabelsten Entertainment-Maschinen. Der Wettbewerbscharakter sorgt für hohe Spielfrequenz.",
    "### Warum Basketball-Automaten so beliebt sind",
    "Das Spielprinzip ist universell verständlich: **Ball werfen, Punkte sammeln, Highscore knacken**. Der Multiplayer-Modus sorgt für Gruppendynamik und erhöht die Einnahmen pro Spielrunde.",
    "### Einnahmepotenzial",
    "- **Einkaufszentren**: 600–1.800€/Monat\n- **Freizeitparks**: 800–2.200€/Monat\n- **Arcade-Hallen**: 500–1.500€/Monat\n- **Events**: 200–500€/Tag",
    "### Die richtige Aufstellung",
    "Basketball-Automaten brauchen etwas **mehr Platz** (ca. 100×200 cm) und eine **Deckenhöhe von mindestens 250 cm**. Idealerweise platzieren Sie den Automaten so, dass er von Passanten gut sichtbar ist.",
    "### Features, die den Unterschied machen",
    "1. **LED-Beleuchtung** – Zieht Blicke auf sich\n2. **Digitaler Timer** – Steigert die Spannung\n3. **Multiplayer-Modus** – Doppelte Einnahmen pro Runde\n4. **Robuste Bälle** – Weniger Verschleiß",
    "### Fazit",
    "Basketball-Automaten sind perfekt für Standorte mit Familien und jungen Erwachsenen. Sie bieten hohen Unterhaltungswert und solide Rendite.",
  ],
  "arcade-business-starten-deutschland": [
    "## Arcade Business starten in Deutschland – Der Masterplan",
    "Ein eigenes Arcade-Business aufzubauen klingt nach einem Traum? Es ist leichter als Sie denken. Dieser Guide zeigt Ihnen den Weg von der Idee zum profitablen Unternehmen.",
    "### Schritt 1: Businessplan erstellen",
    "Bevor Sie investieren, brauchen Sie einen soliden Plan:\n- **Zielgruppe definieren**: Familien, junge Erwachsene, Touristen?\n- **Standortanalyse**: Wo ist die meiste Frequenz?\n- **Budgetplanung**: Wie viel können Sie investieren?\n- **Einnahmenprognose**: Realistische Umsatzerwartungen",
    "### Schritt 2: Genehmigungen und Rechtliches",
    "In Deutschland gelten für Unterhaltungsautomaten **andere Regeln als für Glücksspielautomaten**:\n- Geschicklichkeitsautomaten (Greifer, Box, Basketball) benötigen i.d.R. keine Spielhallenkonzession\n- Gewerbeanmeldung ist erforderlich\n- Jugendschutzbestimmungen beachten\n- Standort-Genehmigung des Vermieters einholen",
    "### Schritt 3: Die richtigen Automaten wählen",
    "Für den Start empfehlen wir einen **Mix aus verschiedenen Automatentypen**:\n- 2–3 Greifautomaten (Brot-und-Butter-Geschäft)\n- 1 Boxautomat (Publikumsmagnet)\n- 1 Basketball-Automat (Familienfreundlich)\n- 1–2 Classic Arcade Machines (Nostalgie-Faktor)",
    "### Schritt 4: Standorte sichern",
    "Die häufigsten Modelle der Zusammenarbeit:\n1. **Feste Miete**: Sie zahlen monatliche Standortgebühr\n2. **Umsatzbeteiligung**: 15–30% der Einnahmen gehen an den Standortgeber\n3. **Hybrid-Modell**: Kleine Grundmiete + Umsatzbeteiligung",
    "### Schritt 5: Skalieren",
    "Nach den ersten erfolgreichen Monaten können Sie schrittweise expandieren:\n- Neue Standorte erschließen\n- Automatenmix optimieren\n- Wartungsroutinen etablieren\n- Ggf. Mitarbeiter einstellen",
    "### Investitionsbeispiel: 5 Automaten",
    "| Position | Kosten |\n|---|---|\n| 2x Greifautomat | 4.980€ |\n| 1x Boxautomat | 3.990€ |\n| 1x Basketball | 2.990€ |\n| 1x Arcade Machine | 1.990€ |\n| **Gesamt** | **13.950€** |\n\nBei durchschnittlich 1.200€ Umsatz pro Automat/Monat = **6.000€ Gesamtumsatz/Monat**.",
    "### Fazit",
    "Ein Arcade-Business in Deutschland ist eine realistische und profitable Geschäftsidee. Mit der richtigen Strategie und guten Standorten können Sie innerhalb eines Jahres sechsstellige Umsätze erzielen.",
  ],
  "welche-automaten-bringen-am-meisten-geld": [
    "## Welche Automaten bringen am meisten Geld?",
    "Die Frage aller Fragen für jeden Automaten-Unternehmer. Wir haben die Daten ausgewertet und präsentieren das Ranking der profitabelsten Arcade-Automaten.",
    "### Das Profitabilitäts-Ranking",
    "**Platz 1: Boxautomat** 🥇\n- Ø Einnahmen: 1.000–3.000€/Monat\n- Anschaffung: ab 3.990€\n- ROI: 2–4 Monate\n- Warum: Niedriger Verschleiß, hoher Spielanreiz, keine Warenkosten",
    "**Platz 2: Greifautomat** 🥈\n- Ø Einnahmen: 800–2.500€/Monat\n- Anschaffung: ab 1.290€\n- ROI: 1–3 Monate\n- Warum: Günstige Anschaffung, universell einsetzbar",
    "**Platz 3: Basketball-Automat** 🥉\n- Ø Einnahmen: 600–1.800€/Monat\n- Anschaffung: ab 2.990€\n- ROI: 2–5 Monate\n- Warum: Hohe Wiederspielrate, familienfreundlich",
    "**Platz 4: Ticket Redemption** \n- Ø Einnahmen: 700–2.000€/Monat\n- Anschaffung: ab 3.490€\n- ROI: 2–5 Monate",
    "**Platz 5: Classic Arcade** \n- Ø Einnahmen: 400–1.200€/Monat\n- Anschaffung: ab 1.990€\n- ROI: 2–5 Monate",
    "### Faktoren, die den Umsatz beeinflussen",
    "1. **Standort** (50% des Erfolgs)\n2. **Sichtbarkeit** des Automaten\n3. **Zustand und Optik** (LED-Beleuchtung!)\n4. **Preisgestaltung** (1€ vs. 2€ pro Spiel)\n5. **Wartung und Zuverlässigkeit**",
    "### Fazit",
    "Der Boxautomat ist der absolute ROI-König, aber der Greifautomat bietet das beste Preis-Leistungs-Verhältnis für Einsteiger. Am profitabelsten ist ein **Mix aus verschiedenen Automatentypen**.",
  ],
  "arcade-automaten-im-einkaufszentrum": [
    "## Arcade Automaten im Einkaufszentrum aufstellen",
    "Einkaufszentren sind Premium-Standorte für Arcade-Automaten. Die hohe Kundenfrequenz, lange Verweildauer und die familienfreundliche Atmosphäre schaffen ideale Bedingungen.",
    "### Warum Einkaufszentren perfekt sind",
    "- **Hohe Frequenz**: Tausende Besucher täglich\n- **Lange Verweildauer**: Begleiter warten → spielen\n- **Familien**: Kinder sind die beste Zielgruppe für Greifautomaten\n- **Impulskäufe**: Spielen als Spontanentscheidung",
    "### Die besten Zonen im Einkaufszentrum",
    "1. **Food Court** – Wartende Besucher haben Zeit und Lust\n2. **Eingangsbereich** – Maximale Sichtbarkeit\n3. **Kinobereiche** – Vor und nach dem Film\n4. **Kinderbereiche** – Zielgruppengenau",
    "### Verhandlung mit dem Centermanagement",
    "Die meisten Einkaufszentren arbeiten mit einem **Umsatzbeteiligungsmodell**:\n- 15–25% Umsatzbeteiligung ist üblich\n- Oft zzgl. Nebenkostenpauschale für Strom\n- Verträge laufen meist 6–12 Monate\n- Tipp: Starten Sie mit 1–2 Automaten als Test",
    "### Erfolgsbeispiel",
    "Ein AutomatPlanet-Kunde betreibt **4 Automaten im Rhein-Center Köln**:\n- 2 Greifautomaten: 3.200€/Monat\n- 1 Boxautomat: 2.100€/Monat\n- 1 Basketball: 1.400€/Monat\n- **Gesamt: 6.700€/Monat** bei ca. 1.500€ Kosten",
    "### Fazit",
    "Einkaufszentren sind der Goldstandard für Arcade-Automaten. Mit der richtigen Platzierung und einer guten Vereinbarung mit dem Management sind hervorragende Renditen möglich.",
  ],
  "claw-machine-business-guide": [
    "## Claw Machine Business Guide for Europe",
    "The claw machine business is one of the most accessible and profitable ventures in the entertainment sector. This guide covers everything you need to know about starting in Europe.",
    "### Why Claw Machines?",
    "Claw machines are **universally appealing** – they attract children, teenagers, and adults alike. The combination of skill, chance, and instant reward creates an addictive gameplay loop that keeps customers coming back.",
    "### Revenue Expectations",
    "- **High-traffic locations**: €800–2,500/month per machine\n- **Medium-traffic locations**: €400–800/month\n- **Low-traffic locations**: €150–400/month",
    "### Startup Costs",
    "| Item | Cost Range |\n|---|---|\n| Mini Claw Machine | €1,290–1,990 |\n| Standard Claw Machine | €2,490–3,990 |\n| Premium LED Model | €3,990–4,990 |\n| Initial Prize Stock | €100–300 |\n| Transport & Setup | €100–200 |",
    "### Key Success Factors",
    "1. **Location, location, location** – Foot traffic is everything\n2. **Attractive prizes** – Branded plush toys and trending items\n3. **Fair grip strength** – Players need to win sometimes\n4. **Eye-catching design** – LED lighting is a must\n5. **Regular maintenance** – Keep machines clean and stocked",
    "### Legal Requirements in Germany",
    "Claw machines are classified as **skill games (Geschicklichkeitsspiele)**, not gambling. This means:\n- No gambling license required\n- Business registration (Gewerbeanmeldung) needed\n- Youth protection laws apply\n- Location owner's permission required",
    "### Scaling Your Business",
    "Start with 2–3 machines, prove the concept, then reinvest profits into more machines. Many successful operators reach **20+ machines within 2 years**.",
    "### Conclusion",
    "The claw machine business offers an excellent risk-reward ratio. Low startup costs, minimal ongoing expenses, and strong revenue potential make it ideal for first-time entrepreneurs.",
  ],
  "arcade-automaten-events-messen": [
    "## Arcade Automaten für Events und Messen",
    "Arcade-Automaten sind das perfekte Highlight für Events, Messen und Firmenfeiern. Sie schaffen unvergessliche Erlebnisse und können dabei auch noch Umsatz generieren.",
    "### Einsatzmöglichkeiten",
    "- **Firmenfeiern**: Team-Building mit Boxautomat-Challenges\n- **Messen**: Stand-Attraktion, die Besucher anzieht\n- **Festivals**: Entertainment-Ecken mit Arcade-Games\n- **Hochzeiten**: Originelle Unterhaltung für Gäste\n- **Produktlaunches**: Interaktives Marketing-Tool",
    "### Mietmodelle",
    "AutomatPlanet bietet flexible Mietoptionen:\n- **Tagespauschale**: ab 150€/Tag je Automat\n- **Wochenpauschale**: ab 500€/Woche\n- **Monatsmietung**: ab 800€/Monat\n- Inklusive Aufstellung, Einweisung und Abholung",
    "### Die beliebtesten Event-Automaten",
    "1. **Boxautomat** – Der absolute Event-Hit (Challenge-Charakter)\n2. **Basketball-Automat** – Wettbewerbe und Turniere\n3. **Greifautomat** – Gebrandete Preise als Giveaways\n4. **Photo Booth Automat** – Erinnerungsfotos",
    "### Branding-Möglichkeiten",
    "Unsere Event-Automaten können **individuell gebrandet** werden:\n- Folierung mit Firmenlogo\n- Individuelle Preise (gebrandete Merchandising-Artikel)\n- Customized Displays und Sounds\n- LED-Beleuchtung in Firmenfarben",
    "### Fazit",
    "Arcade-Automaten auf Events schaffen einzigartige Erlebnisse und bieten gleichzeitig hervorragende Marketing-Möglichkeiten. Ob Mietmodell oder Kauf – für jedes Event gibt es die passende Lösung.",
  ],
  "wie-viel-umsatz-bringt-ein-greifautomat": [
    "## Wie viel Umsatz bringt ein Greifautomat? Konkrete Zahlen",
    "Eine der häufigsten Fragen von Automaten-Interessenten. Wir liefern Ihnen echte Zahlen aus der Praxis – keine Theorie, sondern reale Erfahrungswerte.",
    "### Durchschnittliche Einnahmen nach Standorttyp",
    "| Standort | Umsatz/Monat | Gewinn/Monat |\n|---|---|---|\n| Einkaufszentrum | 1.500–2.500€ | 1.100–2.000€ |\n| Kiosk/Späti (belebt) | 600–1.200€ | 400–900€ |\n| Flughafen | 2.000–3.500€ | 1.500–2.800€ |\n| Restaurant/Bar | 400–800€ | 300–600€ |\n| Freizeitpark | 1.200–2.200€ | 900–1.700€ |",
    "### Kostenstruktur eines Greifautomaten",
    "**Fixkosten pro Monat:**\n- Strom: 15–25€\n- Standortmiete/Beteiligung: 0–500€\n- Versicherung: 10–20€\n\n**Variable Kosten:**\n- Warenkosten (Preise): 50–200€/Monat\n- Wartung: ca. 20€/Monat im Durchschnitt",
    "### Fallstudie: 3 Greifautomaten in Berlin",
    "Ein AutomatPlanet-Kunde betreibt seit 8 Monaten 3 Greifautomaten:\n- **Standort 1** (Späti Friedrichshain): 950€/Monat\n- **Standort 2** (Einkaufszentrum Steglitz): 1.800€/Monat\n- **Standort 3** (Restaurant Mitte): 650€/Monat\n- **Gesamtumsatz**: 3.400€/Monat\n- **Gesamtkosten**: ca. 800€/Monat\n- **Nettogewinn**: ca. 2.600€/Monat",
    "### Saisonale Schwankungen",
    "- **Hochsaison**: November–Februar (Weihnachten, Wintermonate)\n- **Nebensaison**: Juni–August (Urlaubs- und Sommermonate)\n- Schwankung: ca. ±20% vom Durchschnitt",
    "### Wie Sie den Umsatz maximieren",
    "1. **Premium-Standort wählen** – Frequenz ist alles\n2. **Attraktive, trendige Preise** – Pokémon, Disney, etc.\n3. **1€ + 2€ Münzoptionen** anbieten\n4. **Regelmäßig auffüllen** – Leere Automaten = kein Umsatz\n5. **LED-Beleuchtung** – Zieht 40% mehr Spieler an",
    "### Fazit",
    "Ein einzelner Greifautomat kann bei guter Platzierung **800–2.500€ brutto pro Monat** erwirtschaften. Nach Abzug aller Kosten bleibt eine **Marge von 60–80%** – das macht Greifautomaten zu einer der rentabelsten Investitionen im Automatenbereich.",
  ],
};

function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n- (.+)/g, '<li>$1</li>')
    .replace(/\n\d+\. (.+)/g, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
    .replace(/<\/ul>\s*<ul>/g, '')
    .replace(/\|(.+)\|/g, (match) => {
      if (match.includes('---')) return '';
      const cells = match.split('|').filter(Boolean).map(c => c.trim());
      const isHeader = cells.some(c => c.startsWith('**') || ['Position', 'Item', 'Standort'].includes(c));
      const tag = isHeader ? 'th' : 'td';
      return `<tr>${cells.map(c => `<${tag}>${c}</${tag}>`).join('')}</tr>`;
    })
    .replace(/(<tr>[\s\S]*?<\/tr>)/g, '<table>$1</table>')
    .replace(/<\/table>\s*<table>/g, '')
    .replace(/\n/g, '<br/>');
}

const BlogArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = blogArticles.find((a) => a.slug === slug);

  if (!article) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 text-center">
          <h1 className="text-4xl font-bold mb-4">Artikel nicht gefunden</h1>
          <Button asChild>
            <Link to="/blog">Zurück zum Blog</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const content = articleContent[slug!] || [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>{article.title} | AutomatPlanet Blog</title>
        <meta name="description" content={article.excerpt} />
        <link rel="canonical" href={`https://automatplanet.de/blog/${article.slug}`} />
      </Helmet>
      <Navbar />
      <article className="pt-28 pb-16">
        {/* Hero */}
        <div className="relative h-[40vh] min-h-[300px] mb-12">
          <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto max-w-3xl">
              <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-4">
                <ArrowLeft className="w-4 h-4" /> Zurück zum Blog
              </Link>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-5xl font-bold mb-4"
              >
                {article.title}
              </motion.h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {article.category}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(article.date).toLocaleDateString("de-DE")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto max-w-3xl px-4">
          <div className="prose prose-invert prose-lg max-w-none
            [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4
            [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-8 [&_h3]:mb-3
            [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:mb-4
            [&_li]:text-muted-foreground [&_strong]:text-foreground
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-1
            [&_table]:w-full [&_table]:my-6 [&_table]:border-collapse
            [&_th]:text-left [&_th]:p-3 [&_th]:border-b [&_th]:border-border [&_th]:font-bold
            [&_td]:p-3 [&_td]:border-b [&_td]:border-border/50 [&_td]:text-muted-foreground">
            {content.map((block, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(block) }}
              />
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 p-8 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 text-center">
            <h3 className="text-2xl font-bold mb-4">Interesse an Arcade-Automaten?</h3>
            <p className="text-muted-foreground mb-6">Lassen Sie sich unverbindlich beraten – wir finden den perfekten Automaten für Ihr Business.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-primary hover:bg-primary/80 text-primary-foreground shadow-neon">
                <Link to="/#kontakt">Jetzt anfragen</Link>
              </Button>
              <Button asChild variant="outline" className="border-primary text-primary border-2">
                <Link to="/#produkte">Automaten ansehen</Link>
              </Button>
            </div>
          </div>
        </div>
      </article>

      {/* Related articles */}
      <BlogPreview limit={3} showHeading={false} />
      <Footer />
    </div>
  );
};

export default BlogArticlePage;
