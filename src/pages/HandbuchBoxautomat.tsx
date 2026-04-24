import { Helmet } from "react-helmet-async";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const PAGE_URL = "https://automatplanet.de/handbuch/boxautomat";
const PAGE_TITLE = "Boxautomat Handbuch – Box & Kick Maschine | Anleitung, Wartung & Fehlerbehebung";
const PAGE_DESCRIPTION =
  "Offizielles Boxautomat Handbuch: Anleitung zur Box & Kick Maschine inkl. Aufbau, Inbetriebnahme, Münzprüfer, Wartung, Schlagball-Wechsel, Menüführung und Fehlerbehebung.";

const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "Wofür wird der Boxautomat verwendet?",
    answer:
      "Der Boxautomat ist ein Unterhaltungsgerät zur Messung der Schlag- und Trittkraft. Er wird in Nachtclubs, Bars, Fitnessstudios und Freizeitbereichen eingesetzt und bietet einen Boxmodus (Schlagkraft) sowie einen Kickmodus (Trittkraft). Es handelt sich nicht um ein medizinisches Messgerät.",
  },
  {
    question: "Welcher Luftdruck ist für den Schlagball des Boxautomaten optimal?",
    answer:
      "Der empfohlene Luftdruck für den Schlagball liegt zwischen 1,5 und 2,0 Bar. Beim Aufpumpen darf ein maximaler Druck von 2 Bar nicht überschritten werden. Eine Kontrolle des Luftdrucks sollte alle zwei Wochen erfolgen.",
  },
  {
    question: "Was tun, wenn der Boxautomat nicht startet?",
    answer:
      "Wenn der Boxautomat nicht startet, sollten zuerst die 5A-Sicherungen sowie die Stromverbindung geprüft werden. Funktioniert das Gerät weiterhin nicht, ist die Hauptplatine zu kontrollieren. Reparaturen dürfen ausschließlich durch qualifiziertes Fachpersonal durchgeführt werden.",
  },
  {
    question: "Wie wird der Schlagball der Box & Kick Maschine ausgetauscht?",
    answer:
      "Zum Wechseln des Schlagballs wird zunächst das Seil gelöst und der Ball geöffnet. Anschließend wird die alte Innenblase entnommen, eine neue Blase eingesetzt und das Ventil korrekt positioniert. Zum Schluss wird der Ball auf maximal 2 Bar aufgepumpt.",
  },
  {
    question: "Wie öffne ich das erweiterte Menü des Boxautomaten?",
    answer:
      "Das Hauptmenü wird mit der OK-Taste aufgerufen. Die erweiterten Einstellungen (Werkseinstellungen, LED-Konfiguration, Maschinentyp BOX/COMBO) sind durch das Passwort 1111 geschützt.",
  },
  {
    question: "Welche technischen Daten hat der Boxautomat?",
    answer:
      "Der Boxautomat (Artikelnummer 2025101) wiegt ca. 127–146 kg, hat die Maße ca. 112 × 76 × 210 cm und einen Stromverbrauch von ca. 40–60 Watt bei Anschluss an das normale 220V-Stromnetz.",
  },
];

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "Boxautomat Handbuch – Box & Kick Maschine",
  description: PAGE_DESCRIPTION,
  inLanguage: "de-DE",
  url: PAGE_URL,
  mainEntityOfPage: PAGE_URL,
  image: "https://automatplanet.de/images/og/og-default.jpg",
  datePublished: "2026-04-24",
  dateModified: "2026-04-24",
  about: {
    "@type": "Product",
    name: "Boxautomat – Box & Kick Maschine",
    sku: "2025101",
    brand: { "@type": "Brand", name: "AutomatPlanet" },
    category: "Unterhaltungsautomat / Boxautomat",
  },
  author: {
    "@type": "Organization",
    name: "SMEA GmbH",
    url: "https://automatplanet.de",
  },
  publisher: {
    "@type": "Organization",
    name: "AutomatPlanet",
    url: "https://automatplanet.de",
  },
  keywords:
    "Boxautomat Handbuch, Box Maschine Anleitung, Kick Maschine, Schlagkraft Messgerät, Boxautomat Wartung, Boxautomat Fehlerbehebung, Münzprüfer, Schlagball wechseln, Boxautomat kaufen",
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Startseite", item: "https://automatplanet.de/" },
    { "@type": "ListItem", position: 2, name: "Handbücher", item: "https://automatplanet.de/handbuch" },
    { "@type": "ListItem", position: 3, name: "Boxautomat", item: PAGE_URL },
  ],
};

const HandbuchBoxautomat = () => {
  return (
    <>
      <Helmet>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <meta
          name="keywords"
          content="Boxautomat Handbuch, Box Maschine Anleitung, Kick Maschine, Schlagkraft messen, Boxautomat Wartung, Boxautomat Fehlerbehebung, Münzprüfer reinigen, Schlagball wechseln, Boxautomat Bedienungsanleitung, Box & Kick Maschine"
        />
        <meta name="robots" content="index,follow,max-image-preview:large" />
        <meta name="author" content="SMEA GmbH" />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:type" content="article" />
        <meta property="og:locale" content="de_DE" />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESCRIPTION} />
        <meta property="og:image" content="https://automatplanet.de/images/og/og-default.jpg" />
        <meta property="og:site_name" content="AutomatPlanet" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={PAGE_DESCRIPTION} />
        <meta name="twitter:image" content="https://automatplanet.de/images/og/og-default.jpg" />
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>
      <Navbar />
      <main className="min-h-screen pt-28 pb-16 bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <header className="mb-10">
            <p className="text-sm uppercase tracking-widest text-primary mb-2">Benutzerhandbuch</p>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Boxautomat – Box &amp; Kick Maschine</h1>
            <div className="text-muted-foreground text-sm leading-relaxed">
              <p className="font-semibold text-foreground">SMEA GmbH</p>
              <p>Kothöferdamm 7, 30177 Hannover</p>
              <p>
                📧{" "}
                <a href="mailto:kontakt@smea.info" className="text-primary hover:underline">
                  kontakt@smea.info
                </a>
                {" "}· 🌐{" "}
                <a href="https://automatplanet.de" className="text-primary hover:underline">
                  automatplanet.de
                </a>
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2">
                <a
                  href="/downloads/handbuch-boxautomat.pdf"
                  download
                  aria-label="Handbuch Boxautomat als PDF herunterladen"
                >
                  <Download className="h-5 w-5" />
                  Handbuch als PDF herunterladen
                </a>
              </Button>
            </div>
          </header>

          <section className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">1. Verwendungszweck</h2>
              <p>
                Der <strong className="text-foreground">Boxautomat</strong> – auch als{" "}
                <strong className="text-foreground">Box &amp; Kick Maschine</strong> bekannt – ist
                ein professionelles Unterhaltungsgerät zur präzisen Messung der Schlag- und
                Trittkraft. Die robuste Box-Maschine wird in der Gastronomie, in Nachtclubs, in
                Bars und in Fitnessstudios eingesetzt und verbindet sportliche Herausforderung mit
                attraktivem Münzumsatz für den Betreiber.
              </p>
              <p className="mt-3">
                Diese Bedienungsanleitung beschreibt alle wichtigen Themen rund um den
                Boxautomaten: Aufbau und Inbetriebnahme, Wartung und Pflege, Reinigung des
                Münzprüfers, Wechsel des Schlagballs sowie typische Fehlerbehebung. So bleibt Ihre
                Box &amp; Kick Maschine dauerhaft betriebsbereit.
              </p>
              <p className="mt-3 font-semibold text-foreground">Das Gerät bietet zwei Spielmodi:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong className="text-foreground">Boxmodus</strong> → Messung der Schlagkraft</li>
                <li><strong className="text-foreground">Kickmodus</strong> → Messung der Trittkraft</li>
              </ul>
              <p className="mt-3 font-semibold text-foreground">Einsatzbereiche:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Nachtclubs</li>
                <li>Fitnessstudios</li>
                <li>Bars</li>
                <li>Freizeitbereiche</li>
              </ul>
              <div className="mt-4 p-4 border-l-4 border-primary bg-primary/5 rounded">
                <p>Das Gerät dient ausschließlich der Unterhaltung und ist <strong className="text-foreground">kein medizinisches Messgerät</strong>.</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">⚠️ 2. Sicherheitshinweise</h2>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Allgemeine Sicherheit</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Vorsicht beim Öffnen der Verpackung – Inhalt kann beschädigt sein</li>
                <li>Aufbau nur durch mindestens 2 Personen</li>
                <li>Weiche Unterlage beim Aufbau verwenden</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Nutzung</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Kein Spielzeug – nicht für Kinder unter 36 Monaten geeignet</li>
                <li>Kinder nur unter Aufsicht spielen lassen</li>
                <li>Gerät nicht als Ablagefläche nutzen</li>
                <li>Nicht auf das Gerät klettern</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Aufstellung</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Auf festen, ebenen Untergrund stellen</li>
                <li>Unebenheiten mit verstellbaren Füßen ausgleichen</li>
                <li>Vor direkter Sonneneinstrahlung schützen</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Betrieb</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Vor jeder Nutzung Funktionsprüfung durchführen</li>
                <li>Bei Defekten sofort außer Betrieb nehmen</li>
                <li>Keine eigenständigen Veränderungen vornehmen</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Transport</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Gerät niemals schieben</li>
                <li>Immer mit mindestens 2 Personen anheben</li>
                <li>Unterlage zum Schutz des Bodens verwenden</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">📊 3. Technische Spezifikationen</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border border-white/10 rounded">
                  <tbody className="divide-y divide-white/10">
                    <tr>
                      <th className="py-2 px-3 font-semibold text-foreground w-1/2">Artikel</th>
                      <td className="py-2 px-3">Box Maschine EU</td>
                    </tr>
                    <tr>
                      <th className="py-2 px-3 font-semibold text-foreground">Artikelnummer</th>
                      <td className="py-2 px-3">2025101</td>
                    </tr>
                    <tr>
                      <th className="py-2 px-3 font-semibold text-foreground">Gewicht</th>
                      <td className="py-2 px-3">ca. 127–146 kg</td>
                    </tr>
                    <tr>
                      <th className="py-2 px-3 font-semibold text-foreground">Maße</th>
                      <td className="py-2 px-3">ca. 112 x 76 x 210 cm</td>
                    </tr>
                    <tr>
                      <th className="py-2 px-3 font-semibold text-foreground">Stromverbrauch</th>
                      <td className="py-2 px-3">ca. 40–60 Watt</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">🔧 4. Wartung &amp; Pflege</h2>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Alle 2 Wochen (empfohlen)</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Luftdruck prüfen: 1,5 – 2,0 Bar</li>
                <li>Ball darf sich nicht drehen</li>
                <li>Armprotektoren kontrollieren</li>
                <li>Kabel &amp; Verbindungen prüfen</li>
                <li>Standfestigkeit kontrollieren</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Monatlich</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Schrauben und Muttern prüfen</li>
                <li>Mechanik schmieren</li>
                <li>Münzprüfer reinigen</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Alle 2 Monate / nach 1000 Schlägen</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Abstand der Mechanik prüfen</li>
                <li>Stoßfänger kontrollieren</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">⚙️ 5. Wartung der Mechanik</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Bewegliche Teile regelmäßig mit WD-40 oder Schmierfett behandeln</li>
                <li>Federmechanismus prüfen</li>
                <li>Geschwindigkeit des Balls kontrollieren</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">🥊 6. Austausch des Schlagballs</h2>
              <ol className="list-decimal pl-6 space-y-1">
                <li>Seil lösen</li>
                <li>Ball öffnen</li>
                <li>Innenblase entnehmen</li>
                <li>Neue Blase einsetzen</li>
                <li>Ventil korrekt positionieren</li>
                <li>Ball aufblasen (max. 2 Bar)</li>
              </ol>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">🛠️ 7. Fehlerbehebung</h2>
              <div className="p-4 border-l-4 border-destructive bg-destructive/5 rounded">
                <p className="font-semibold text-foreground">⚠️ Reparaturen nur durch Fachpersonal!</p>
              </div>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Gerät startet nicht</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Sicherungen prüfen (5A)</li>
                <li>Stromverbindung prüfen</li>
                <li>Hauptplatine prüfen</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Münzprüfer funktioniert nicht</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Auf Verstopfung prüfen</li>
                <li>Reinigen</li>
                <li>Kabel prüfen (+ / GND / Pulse)</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Scheinleser funktioniert nicht</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Reinigen</li>
                <li>Kabel prüfen</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Buttons funktionieren nicht</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Kabelverbindung prüfen</li>
                <li>Schalter prüfen</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">🔌 8. Montage &amp; Inbetriebnahme</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Gerät wird betriebsbereit geliefert</li>
                <li>Stromkabel anschließen</li>
                <li>Gerät einschalten</li>
              </ul>
              <p className="mt-3">👉 Schrauben &amp; Kabel befinden sich im Inneren der Maschine.</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">📋 9. Menüführung</h2>
              <p>
                <strong className="text-foreground">Zugriff:</strong> 👉 OK-Taste drücken
              </p>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Einstellungen</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Sprache</li>
                <li>Kredit 1</li>
                <li>Kredit 2</li>
                <li>Lautstärke</li>
                <li>Schwierigkeitsgrad</li>
                <li>Demo-Musik AN/AUS</li>
                <li>Freispiele</li>
                <li>Schnellstart</li>
                <li>Anzeige (999 / 3000)</li>
                <li>Ballauswurf (Manuell / Auto)</li>
                <li>Testmenü</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">
                Erweiterte Einstellungen <span className="text-muted-foreground font-normal">(Passwort: 1111)</span>
              </h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Werkseinstellungen</li>
                <li>LED Einstellungen</li>
                <li>Maschinentyp (BOX / COMBO)</li>
              </ul>
            </div>

            <div className="p-4 border-l-4 border-primary bg-primary/5 rounded">
              <p className="font-semibold text-foreground">💡 10. Wichtige Hinweise</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Gerät nur bestimmungsgemäß verwenden</li>
                <li>Wartung regelmäßig durchführen</li>
                <li>Bei Problemen sofort abschalten</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">❓ Häufig gestellte Fragen zum Boxautomat</h2>
              <p>
                Antworten auf die wichtigsten Fragen rund um die Box &amp; Kick Maschine – von der
                Wartung über die Fehlerbehebung bis zur Menüführung.
              </p>
              <div className="mt-4 space-y-4">
                {FAQ_ITEMS.map((item) => (
                  <article
                    key={item.question}
                    className="rounded-lg border border-white/10 bg-white/5 p-4"
                    itemScope
                    itemType="https://schema.org/Question"
                  >
                    <h3
                      className="text-lg font-semibold text-foreground mb-2"
                      itemProp="name"
                    >
                      {item.question}
                    </h3>
                    <div
                      itemScope
                      itemProp="acceptedAnswer"
                      itemType="https://schema.org/Answer"
                    >
                      <p itemProp="text">{item.answer}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">📞 Support</h2>
              <p>Bei Fragen oder Problemen:</p>
              <p className="mt-2">
                <span className="font-semibold text-foreground">SMEA GmbH</span>
                <br />
                📧{" "}
                <a href="mailto:kontakt@smea.info" className="text-primary hover:underline">
                  kontakt@smea.info
                </a>
                <br />
                🌐{" "}
                <a href="https://automatplanet.de" className="text-primary hover:underline">
                  automatplanet.de
                </a>
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default HandbuchBoxautomat;
