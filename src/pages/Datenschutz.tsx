import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Datenschutz = () => {
  return (
    <>
      <Helmet>
        <title>Datenschutzerklärung | AutomatPlanet.de</title>
        <meta name="description" content="Datenschutzerklärung von AutomatPlanet.de – Informationen zum Schutz Ihrer personenbezogenen Daten." />
        <link rel="canonical" href="https://automatplanet.de/datenschutz" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://automatplanet.de/datenschutz" />
        <meta property="og:title" content="Datenschutzerklärung | AutomatPlanet.de" />
        <meta property="og:image" content="https://automatplanet.de/images/og/og-default.jpg" />
        <meta property="og:site_name" content="AutomatPlanet" />
        <meta name="twitter:card" content="summary" />
      </Helmet>
      <Navbar />
      <main className="min-h-screen pt-28 pb-16 bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Datenschutzerklärung</h1>
          <p className="text-sm text-muted-foreground mb-8">Stand: 07.11.2025</p>

          <section className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <h2 className="text-xl font-semibold text-foreground">1. Verantwortlicher</h2>
            <p>
              Verantwortlich im Sinne der Datenschutz-Gesetzgebung (insb. EU-DSGVO) ist:
            </p>
            <p>
              SMEA GmbH<br />
              Kothöferdamm 7<br />
              30177 Hannover<br /><br />
              Telefon: +49 511 12282957<br />
              E-Mail: dennis@smea.info<br /><br />
              Geschäftsführer: Dennis Pokorny
            </p>

            <h2 className="text-xl font-semibold text-foreground">2. Allgemeines zur Datenverarbeitung</h2>
            <p>
              Wir freuen uns über Ihren Besuch auf unserer Website (
              <a href="https://automatplanet.de" className="text-primary hover:underline">https://automatplanet.de</a>
              ) und Ihr Interesse an unseren digitalen Produkten und Leistungen.
            </p>
            <p>
              Im Folgenden informieren wir Sie über Art, Umfang, Zweck, Rechtsgrundlagen und Kategorien der personenbezogenen Daten, die wir verarbeiten – sowie über Ihre Rechte als betroffene Person.
            </p>

            <h2 className="text-xl font-semibold text-foreground">3. Rechtsgrundlagen</h2>
            <p>Von uns verarbeitete personenbezogene Daten stützen sich insbesondere auf folgende Rechtsgrundlagen:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)</li>
              <li>Art. 6 Abs. 1 lit. b DSGVO (Verarbeitung zur Vertragserfüllung)</li>
              <li>Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)</li>
              <li>ggf. Art. 9 DSGVO (besondere Kategorien personenbezogener Daten) – nicht zutreffend, sofern keine solchen Daten verarbeitet werden.</li>
              <li>Zudem gilt das nationale Datenschutz-Recht (z. B. BDSG) sowie das Telekommunikation-Telemedien-Datenschutz-Gesetz (TTDSG) für Cookies/Tracking.</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground">4. Automatisierte Datenspeicherung beim Besuch unserer Website</h2>
            <p>Beim Aufrufen unserer Website werden durch den Web-Browser automatisch Informationen an den Server unserer Website übermittelt und temporär gespeichert, z. B.:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>IP-Adresse des zugreifenden Geräts</li>
              <li>Datum und Uhrzeit des Zugriffs</li>
              <li>Name und URL der abgerufenen Datei</li>
              <li>Website, von der Sie uns besucht haben (Referrer)</li>
              <li>verwendeter Browser und ggf. Betriebssystem sowie dessen Oberfläche</li>
            </ul>
            <p>
              Diese Daten werden von uns protokolliert (Logfiles) und nach spätestens zwei Wochen gelöscht, sofern keine längere Aufbewahrung aus Sicherheitsgründen erforderlich ist. Die Rechtsgrundlage hierfür ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse: Sicherung des Betriebs unserer Website).
            </p>

            <h2 className="text-xl font-semibold text-foreground">5. Cookies und Cookie-Consent mittels Complianz</h2>
            <p>
              Unsere Website verwendet Cookies und vergleichbare Technologien – teils technisch notwendig, teils zur Analyse oder Marketingzwecken.
            </p>
            <p>
              Einige Cookies werden erst nach Ihrer aktiven Einwilligung gesetzt; diese Einwilligung wird über das Cookie-Consent-Tool Complianz eingeholt und protokolliert.
            </p>
            <p>
              Sie haben jederzeit die Möglichkeit, Ihre Cookie-Einwilligung zu widerrufen oder anzupassen (z. B. über die Banner- oder Einstellungen von Complianz).
            </p>
            <p>Die einzelnen Kategorien:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong className="text-foreground">Unbedingt notwendige Cookies</strong>: erforderlich, damit grundlegende Funktionen der Website gewährleistet sind. Keine Einwilligung erforderlich.</li>
              <li><strong className="text-foreground">Funktionelle Cookies</strong>: dienen der Verbesserung der Funktion der Website, z. B. Speicherung von Nutzereinstellungen. Einwilligung erforderlich.</li>
              <li><strong className="text-foreground">Performance/Analyse-Cookies</strong>: erfassen anonymisierte Nutzungsdaten zur Optimierung unseres Angebots. Einwilligung erforderlich.</li>
              <li><strong className="text-foreground">Marketing/Targeting-Cookies</strong>: werden eingesetzt, um auf Basis Ihres Nutzungsverhaltens Werbung auszuliefern oder auszuwerten. Einwilligung erforderlich.</li>
            </ul>
            <p>
              Sie können Ihre Einstellungen jederzeit über das Cookie-Banner oder über die Einstellungen in Complianz ändern oder Cookies über Ihren Browser löschen.
            </p>

            <h2 className="text-xl font-semibold text-foreground">6. Tracking- und Analyse-Dienste</h2>
            <p>
              Nachfolgend informieren wir über einzelne Tracking- oder Analyse-Tools, die wir ggf. einsetzen (sofern aktiv). Jede Nutzung erfolgt nur mit Ihrer Einwilligung via Complianz.
            </p>
            <h3 className="text-lg font-semibold text-foreground">6.1 Google Analytics</h3>
            <p>
              Wir setzen Google Analytics ein. Hierdurch wird Ihre Nutzung der Website ausgewertet (z. B. Seitenaufrufe, Verweildauer, Absprungrate).
            </p>
            <p>
              Wir haben IP-Anonymisierung aktiviert, d. h. Ihre IP wird gekürzt, bevor sie an Google übermittelt wird. Ihre Daten werden mit Google unter einem Datenverarbeitungsvertrag verarbeitet (Datenverarbeitungsvertrag gem. Art. 28 DSGVO).
            </p>
            <p>
              Sie können die Erfassung Ihrer Daten durch Google Analytics dauerhaft deaktivieren via Browser-Add-on oder über die Einstellungen im Cookie-Banner.
            </p>
            <h3 className="text-lg font-semibold text-foreground">6.2 Weitere Dienste</h3>
            <p>
              Sollten weitere Dienste (z. B. Facebook-Pixel, Vimeo, SoundCloud) aktiv sein, informieren wir gesondert über Zweck, Daten, Rechtsgrundlage, Speicherort/-dauer sowie Widerrufsmöglichkeiten.
            </p>

            <h2 className="text-xl font-semibold text-foreground">7. Einbindung von Diensten Dritter</h2>
            <p>
              Wir binden auf unserer Website u. a. Kartendienste, Social-Media-Plugins oder Videos ein, bei denen Daten an Dritte übertragen werden:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong className="text-foreground">Kartendienst: Google Maps</strong> (bei Nutzung): Verarbeitung von IP-Adresse, Standortdaten etc.</li>
              <li><strong className="text-foreground">Social-Media-Plugins</strong>: z. B. Instagram, Facebook Messenger – je nach eingebundenem Dienst erfolgt Übertragung von Daten an den Anbieter.</li>
            </ul>
            <p>
              Bitte beachten Sie: Wir haben keinen Einfluss auf die Datenverarbeitung dieser Drittanbieter; es gelten deren Datenschutz- und Cookie-Richtlinien.
            </p>

            <h2 className="text-xl font-semibold text-foreground">8. Ihre Betroffenenrechte</h2>
            <p>Sie haben grundsätzlich folgende Rechte gegenüber uns:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Auskunft über die Verarbeitung Ihrer personenbezogenen Daten (Art. 15 DSGVO)</li>
              <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
              <li>Löschung („Recht auf Vergessenwerden") (Art. 17 DSGVO)</li>
              <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruch gegen Verarbeitung (insb. bei Profiling oder Direktwerbung) (Art. 21 DSGVO)</li>
              <li>Recht, nicht einer ausschließlich automatisierten Entscheidung (inkl. Profiling) unterworfen zu werden (Art. 22 DSGVO)</li>
            </ul>
            <p>
              Sie können Ihre Einwilligung jederzeit widerrufen (Art. 7 Abs. 3 DSGVO). Ein Widerruf wirkt jedoch nicht rückwirkend für die Rechtmäßigkeit der Verarbeitung vor dem Widerruf.
            </p>
            <p>
              Wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer Daten gegen geltendes Datenschutzrecht verstößt, haben Sie das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren (z. B. in Ihrem Bundesland).
            </p>

            <h2 className="text-xl font-semibold text-foreground">9. Datensicherheit</h2>
            <p>
              Wir treffen technische und organisatorische Maßnahmen, um Ihre bei uns gespeicherten Daten gegen zufällige oder vorsätzliche Manipulationen, Verlust, Zerstörung oder gegen unberechtigten Zugriff zu schützen (Art. 32 DSGVO). Bei Datenübertragung verwenden wir TLS (SSL) – Sie erkennen dies an „https://" in der Adresszeile Ihres Browsers.
            </p>

            <h2 className="text-xl font-semibold text-foreground">10. Änderungen dieser Datenschutzerklärung</h2>
            <p>
              Durch Weiterentwicklung unserer Website oder aufgrund geänderter gesetzlicher bzw. behördlicher Vorgaben kann es notwendig werden, diese Datenschutzerklärung zu ändern. Die jeweils aktuelle Fassung finden Sie jederzeit auf unserer Website unter{" "}
              <a href="https://automatplanet.de/datenschutz" className="text-primary hover:underline">
                https://automatplanet.de/datenschutz
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Datenschutz;
