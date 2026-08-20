import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const AGB = () => {
  return (
    <>
      <Helmet>
        <title>AGB | AutomatPlanet.de</title>
        <meta
          name="description"
          content="Allgemeine Geschaeftsbedingungen der SMEA GmbH fuer den Verkauf von Boxautomaten und Zubehoer an Unternehmer (B2B)."
        />
        <link rel="canonical" href="https://automatplanet.de/agb" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://automatplanet.de/agb" />
        <meta property="og:title" content="AGB | AutomatPlanet.de" />
        <meta property="og:image" content="https://automatplanet.de/images/og/og-default.jpg" />
        <meta property="og:site_name" content="AutomatPlanet" />
        <meta name="twitter:card" content="summary" />
      </Helmet>
      <Navbar />
      <main className="min-h-screen pt-28 pb-16 bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Allgemeine Geschäftsbedingungen (AGB)</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Verkauf von Boxautomaten und Zubehör (B2B)
          </p>

          <section className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p>
              SMEA GmbH<br />
              Kothöferdamm 7<br />
              30177 Hannover
            </p>

            <h2 className="text-xl font-semibold text-foreground">§ 1 Geltungsbereich</h2>
            <p>
              (1) Diese Allgemeinen Geschäftsbedingungen gelten für sämtliche Verträge über den Verkauf von
              Boxautomaten, Zubehör, Ersatzteilen und sonstigen Waren zwischen der SMEA GmbH (nachfolgend "Verkäufer")
              und Unternehmern im Sinne des § 14 BGB (nachfolgend "Kunde").
            </p>
            <p>
              (2) Unsere Angebote richten sich ausschließlich an Unternehmer, juristische Personen des öffentlichen
              Rechts oder öffentlich-rechtliche Sondervermögen. Ein Vertragsschluss mit Verbrauchern (§ 13 BGB) ist
              ausgeschlossen.
            </p>
            <p>
              (3) Mit Auftragserteilung bestätigt der Kunde verbindlich, als Unternehmer zu handeln. Bestellungen unter
              Verwendung geschäftlicher Kontaktdaten, Firmenanschriften oder Umsatzsteuer-Identifikationsnummern gelten
              als gewerbliche Bestellungen.
            </p>
            <p>
              (4) Abweichende oder entgegenstehende Geschäftsbedingungen des Kunden werden nicht anerkannt, es sei denn,
              ihrer Geltung wurde ausdrücklich schriftlich zugestimmt.
            </p>

            <h2 className="text-xl font-semibold text-foreground">§ 2 Vertragsschluss</h2>
            <p>
              (1) Unsere Angebote, Preislisten, Produktdarstellungen und sonstigen Angaben sind freibleibend und
              unverbindlich.
            </p>
            <p>(2) Ein Vertrag kommt erst zustande durch:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>schriftliche Auftragsbestätigung,</li>
              <li>Rechnungsstellung,</li>
              <li>Lieferung der Ware,</li>
              <li>oder ausdrückliche Annahme der Bestellung durch den Verkäufer.</li>
            </ul>
            <p>
              (3) Bestellungen oder Zusagen per E-Mail, Telefon, WhatsApp oder sonstigen Kommunikationsmitteln gelten
              als verbindliche Angebote des Kunden.
            </p>
            <p>
              (4) Der Verkäufer ist berechtigt, Bestellungen ohne Angabe von Gründen abzulehnen oder nur gegen Vorkasse
              auszuführen.
            </p>

            <h2 className="text-xl font-semibold text-foreground">§ 3 Preise und Zahlungsbedingungen</h2>
            <p>
              (1) Sämtliche Preise verstehen sich netto zzgl. gesetzlicher Mehrwertsteuer sowie etwaiger Versand- und
              Transportkosten.
            </p>
            <p>(2) Sofern nicht anders vereinbart, ist der Rechnungsbetrag sofort ohne Abzug zur Zahlung fällig.</p>
            <p>(3) Der Verkäufer ist berechtigt, Lieferungen bis zur vollständigen Zahlung zurückzuhalten.</p>
            <p>(4) Der Verkäufer kann eine angemessene Anzahlung verlangen.</p>
            <p>
              (5) Eine Aufrechnung mit Gegenforderungen ist nur zulässig, soweit diese unbestritten oder rechtskräftig
              festgestellt sind.
            </p>

            <h2 className="text-xl font-semibold text-foreground">§ 4 Lieferung, Versand und Gefahrenübergang</h2>
            <p>(1) Die Lieferung erfolgt ab Lager Hannover per Spedition, Paketdienst oder Abholung.</p>
            <p>
              (2) Die Gefahr des zufälligen Untergangs oder der zufälligen Verschlechterung geht mit Übergabe der Ware
              an das Transportunternehmen auf den Kunden über (§ 447 BGB).
            </p>
            <p>
              (3) Lieferzeiten gelten nur als annähernd und unverbindlich, sofern sie nicht ausdrücklich schriftlich als
              verbindlich vereinbart wurden.
            </p>
            <p>
              (4) Lieferverzögerungen aufgrund höherer Gewalt, Streiks, behördlicher Maßnahmen, Materialengpässen,
              Transportproblemen oder sonstigen nicht vom Verkäufer zu vertretenden Umständen begründen keine
              Schadensersatzansprüche.
            </p>
            <p>(5) Teillieferungen sind zulässig, soweit diese für den Kunden zumutbar sind.</p>
            <p>
              (6) Der Kunde ist verpflichtet, die Ware bei Anlieferung unverzüglich auf offensichtliche Transportschäden
              zu prüfen und erkennbare Schäden gegenüber dem Frachtführer zu dokumentieren.
            </p>
            <p>
              (7) Bei Annahmeverweigerung oder schuldhaft verursachtem Rücktransport trägt der Kunde die hierdurch
              entstehenden Kosten.
            </p>

            <h2 className="text-xl font-semibold text-foreground">§ 5 Eigentumsvorbehalt</h2>
            <p>
              (1) Die gelieferte Ware bleibt bis zur vollständigen Bezahlung sämtlicher Forderungen aus der
              Geschäftsbeziehung Eigentum des Verkäufers.
            </p>
            <p>
              (2) Der Kunde ist verpflichtet, die Vorbehaltsware pfleglich zu behandeln und vor Zugriffen Dritter zu
              schützen.
            </p>

            <h2 className="text-xl font-semibold text-foreground">§ 6 Beschaffenheit und Nutzungshinweise</h2>
            <p>
              (1) Die Boxautomaten sind mechanisch-elektronische Unterhaltungsgeräte für den gewerblichen Einsatz und
              unterliegen nutzungsbedingtem Verschleiß.
            </p>
            <p>
              (2) Angaben zu Umsatzmöglichkeiten, Erträgen oder Wirtschaftlichkeit dienen ausschließlich allgemeinen
              Informationen und stellen keine garantierten Eigenschaften dar.
            </p>
            <p>
              (3) Der Kunde ist selbst dafür verantwortlich, ob und unter welchen Voraussetzungen der Betrieb am
              jeweiligen Aufstellort zulässig ist.
            </p>

            <h2 className="text-xl font-semibold text-foreground">§ 7 Gewährleistung und Mängelanzeige</h2>
            <p>
              (1) Der Kunde ist verpflichtet, die Ware unverzüglich nach Erhalt gemäß § 377 HGB zu untersuchen und
              erkennbare Mängel unverzüglich schriftlich anzuzeigen.
            </p>
            <p>(2) Versteckte Mängel sind unverzüglich nach Entdeckung schriftlich anzuzeigen.</p>
            <p>(3) Die Gewährleistungsfrist beträgt für neue Waren 12 Monate ab Gefahrübergang.</p>
            <p>(4) Bei berechtigten Mängeln erfolgt nach Wahl des Verkäufers Nachbesserung oder Ersatzlieferung.</p>
            <p>
              (5) Erst wenn die Nacherfüllung endgültig fehlgeschlagen ist oder unzumutbar verweigert wird, stehen dem
              Kunden die gesetzlichen Rechte zu.
            </p>
            <p>(6) Von der Gewährleistung ausgeschlossen sind insbesondere:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Verschleißteile,</li>
              <li>Bedienknöpfe,</li>
              <li>Sensoren,</li>
              <li>Münzprüfer,</li>
              <li>Banknotenleser,</li>
              <li>Beleuchtungselemente,</li>
              <li>Sicherungen,</li>
              <li>Kabelverbindungen,</li>
              <li>Lüfter,</li>
              <li>Schlösser,</li>
              <li>Displays,</li>
              <li>Schäden durch intensive oder unsachgemäße Nutzung,</li>
              <li>Vandalismus,</li>
              <li>Feuchtigkeit,</li>
              <li>äußere Gewalteinwirkung,</li>
              <li>unsachgemäße Aufstellung,</li>
              <li>eigenmächtige Umbauten,</li>
              <li>fehlende Wartung,</li>
              <li>Betrieb im Außenbereich ohne geeigneten Schutz.</li>
            </ul>
            <p>
              (7) Der Verkäufer ist berechtigt, zur Fehlerdiagnose Foto- oder Videomaterial anzufordern und Ersatzteile
              zur Selbstmontage bereitzustellen.
            </p>
            <p>
              (8) Eigenmächtige Reparaturen oder Veränderungen ohne Zustimmung des Verkäufers führen zum Ausschluss von
              Gewährleistungsansprüchen, soweit der Mangel hierdurch verursacht wurde.
            </p>

            <h2 className="text-xl font-semibold text-foreground">§ 8 Transportbedingte optische Bagatellschäden</h2>
            <p>(1) Der Versand der Boxautomaten erfolgt als Speditionsware auf Palette.</p>
            <p>
              (2) Trotz transportsicherer Verpackung können geringfügige optische Beeinträchtigungen entstehen,
              insbesondere:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>leichte Lackkratzer,</li>
              <li>minimale Lackabplatzungen,</li>
              <li>oberflächliche Schleifspuren.</li>
            </ul>
            <p>
              (3) Solche rein optischen und unerheblichen Beeinträchtigungen stellen keinen Sachmangel dar, sofern
              Funktion, Sicherheit oder Stabilität des Geräts nicht beeinträchtigt werden.
            </p>
            <p>(4) Unberührt bleiben Ansprüche bei erheblichen Beschädigungen oder Funktionsstörungen.</p>

            <h2 className="text-xl font-semibold text-foreground">§ 9 Haftung</h2>
            <p>(1) Der Verkäufer haftet unbeschränkt für Schäden aus Vorsatz oder grober Fahrlässigkeit.</p>
            <p>
              (2) Bei einfacher Fahrlässigkeit haftet der Verkäufer nur bei Verletzung wesentlicher Vertragspflichten
              (Kardinalpflichten). In diesem Fall ist die Haftung auf den typischerweise vorhersehbaren Schaden
              begrenzt.
            </p>
            <p>
              (3) Die Haftungsbeschränkungen gelten nicht bei Schäden aus der Verletzung von Leben, Körper oder
              Gesundheit sowie nach zwingenden gesetzlichen Vorschriften.
            </p>
            <p>
              (4) Eine Haftung für entgangenen Gewinn, mittelbare Schäden, Folgeschäden oder Betriebsunterbrechungen ist
              ausgeschlossen, soweit gesetzlich zulässig.
            </p>

            <h2 className="text-xl font-semibold text-foreground">§ 10 Ersatzteile und Reparaturen</h2>
            <p>(1) Der Verkäufer hält nach Möglichkeit Ersatzteile vor.</p>
            <p>
              (2) Der Automat ist modular aufgebaut. Reparaturen können durch Austausch einzelner Komponenten erfolgen.
            </p>
            <p>(3) Ein Anspruch auf Vor-Ort-Service besteht nicht.</p>

            <h2 className="text-xl font-semibold text-foreground">§ 11 Kein Widerrufsrecht</h2>
            <p>
              (1) Da Verträge ausschließlich mit Unternehmern geschlossen werden, besteht kein gesetzliches
              Widerrufsrecht.
            </p>
            <p>
              (2) Rücknahmen oder Stornierungen erfolgen ausschließlich nach freiwilliger schriftlicher Zustimmung des
              Verkäufers.
            </p>

            <h2 className="text-xl font-semibold text-foreground">§ 12 Gerichtsstand und anwendbares Recht</h2>
            <p>(1) Es gilt ausschließlich deutsches Recht unter Ausschluss des UN-Kaufrechts (CISG).</p>
            <p>
              (2) Gerichtsstand für sämtliche Streitigkeiten aus der Geschäftsbeziehung ist Hannover, soweit gesetzlich
              zulässig.
            </p>

            <h2 className="text-xl font-semibold text-foreground">§ 13 Salvatorische Klausel</h2>
            <p>
              Sollte eine Bestimmung dieser AGB ganz oder teilweise unwirksam sein oder werden, bleibt die Wirksamkeit
              der übrigen Bestimmungen unberührt. Anstelle der unwirksamen Regelung gilt die gesetzliche Regelung.
            </p>

            <p className="pt-4">
              <a
                href="/downloads/agb-boxautomaten.pdf"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline font-medium"
              >
                AGB als PDF herunterladen
              </a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AGB;
