import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Rueckgabe = () => {
  return (
    <>
      <Helmet>
        <title>Rueckgabe und Gewaehrleistung | AutomatPlanet.de</title>
        <meta
          name="description"
          content="Rueckgabe und Gewaehrleistung bei AutomatPlanet.de - Verkauf ausschliesslich an Unternehmer, Gewaehrleistungsfrist, Maengelanzeige und Ablauf."
        />
        <link rel="canonical" href="https://automatplanet.de/rueckgabe" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://automatplanet.de/rueckgabe" />
        <meta property="og:title" content="Rueckgabe und Gewaehrleistung | AutomatPlanet.de" />
        <meta property="og:image" content="https://automatplanet.de/images/og/og-default.jpg" />
        <meta property="og:site_name" content="AutomatPlanet" />
        <meta name="twitter:card" content="summary" />
      </Helmet>
      <Navbar />
      <main className="min-h-screen pt-28 pb-16 bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Rückgabe und Gewährleistung</h1>
          <p className="text-sm text-muted-foreground mb-8">Gilt für alle Bestellungen bei der SMEA GmbH</p>

          <section className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <h2 className="text-xl font-semibold text-foreground">Verkauf ausschließlich an Unternehmer</h2>
            <p>
              Unsere Angebote richten sich ausschließlich an Unternehmer im Sinne des § 14 BGB, an juristische Personen
              des öffentlichen Rechts und an öffentlich-rechtliche Sondervermögen. Ein Vertragsschluss mit Verbrauchern
              nach § 13 BGB ist ausgeschlossen.
            </p>
            <p>
              Da wir keine Verträge mit Verbrauchern schließen, besteht kein gesetzliches Widerrufsrecht. Dieses Recht
              steht ausschließlich Verbrauchern zu.
            </p>

            <h2 className="text-xl font-semibold text-foreground">Rücknahme</h2>
            <p>
              Eine Rücknahme einwandfreier Ware ist nicht vorgesehen. Rücksendungen sind ausschließlich bei berechtigten
              Mängeln möglich. Freiwillige Rücknahmen oder Stornierungen erfolgen nur nach ausdrücklicher schriftlicher
              Zustimmung des Verkäufers.
            </p>

            <h2 className="text-xl font-semibold text-foreground">Gewährleistung</h2>
            <p>
              Die Gewährleistungsfrist beträgt für neue Waren 12 Monate ab Gefahrübergang. Bei berechtigten Mängeln
              erfolgt nach Wahl des Verkäufers Nachbesserung oder Ersatzlieferung.
            </p>
            <p>
              Erst wenn die Nacherfüllung endgültig fehlgeschlagen ist oder unzumutbar verweigert wird, stehen dem
              Kunden die gesetzlichen Rechte zu.
            </p>

            <h2 className="text-xl font-semibold text-foreground">Untersuchungs- und Rügepflicht</h2>
            <p>
              Der Kunde ist verpflichtet, die Ware unverzüglich nach Erhalt gemäß § 377 HGB zu untersuchen und
              erkennbare Mängel unverzüglich schriftlich anzuzeigen. Versteckte Mängel sind unverzüglich nach Entdeckung
              schriftlich anzuzeigen.
            </p>
            <p>
              Transportschäden sind bereits bei Anlieferung gegenüber dem Frachtführer zu dokumentieren.
            </p>

            <h2 className="text-xl font-semibold text-foreground">Ausgeschlossene Mängel</h2>
            <p>Von der Gewährleistung ausgeschlossen sind insbesondere:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Verschleißteile</li>
              <li>Bedienknöpfe</li>
              <li>Sensoren</li>
              <li>Münzprüfer</li>
              <li>Banknotenleser</li>
              <li>Beleuchtungselemente</li>
              <li>Sicherungen</li>
              <li>Kabelverbindungen</li>
              <li>Lüfter</li>
              <li>Schlösser</li>
              <li>Displays</li>
              <li>Schäden durch intensive oder unsachgemäße Nutzung</li>
              <li>Vandalismus</li>
              <li>Feuchtigkeit</li>
              <li>äußere Gewalteinwirkung</li>
              <li>unsachgemäße Aufstellung</li>
              <li>eigenmächtige Umbauten</li>
              <li>fehlende Wartung</li>
              <li>Betrieb im Außenbereich ohne geeigneten Schutz</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">Transportbedingte optische Bagatellschäden</h2>
            <p>
              Der Versand erfolgt als Speditionsware auf Palette. Trotz transportsicherer Verpackung können geringfügige
              optische Beeinträchtigungen entstehen: leichte Lackkratzer, minimale Lackabplatzungen und oberflächliche
              Schleifspuren.
            </p>
            <p>
              Solche rein optischen und unerheblichen Beeinträchtigungen stellen keinen Sachmangel dar, sofern Funktion,
              Sicherheit und Stabilität des Geräts nicht beeinträchtigt sind. Bei erheblichen Beschädigungen oder
              Funktionsstörungen gilt das nicht - hier bleiben die Ansprüche des Kunden unberührt.
            </p>

            <h2 className="text-xl font-semibold text-foreground">Ablauf einer Mängelanzeige</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Mängel per E-Mail an{" "}
                <a href="mailto:kontakt@automatplanet.com" className="text-primary hover:underline">
                  kontakt@automatplanet.com
                </a>{" "}
                melden.
              </li>
              <li>Bitte immer die Bestellnummer sowie aussagekräftige Fotos oder Videos beilegen.</li>
              <li>
                Der Verkäufer ist berechtigt, zur Fehlerdiagnose Foto- oder Videomaterial anzufordern und Ersatzteile
                zur Selbstmontage bereitzustellen.
              </li>
              <li>
                Eigenmächtige Reparaturen oder Veränderungen ohne Zustimmung des Verkäufers führen zum Ausschluss von
                Gewährleistungsansprüchen, soweit der Mangel dadurch verursacht wurde.
              </li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Rueckgabe;
