import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Impressum = () => {
  return (
    <>
      <Helmet>
        <title>Impressum | AutomatPlanet.de</title>
        <meta name="description" content="Impressum von AutomatPlanet.de – Angaben gemäß § 5 TMG." />
        <link rel="canonical" href="https://automatplanet.de/impressum" />
      </Helmet>
      <Navbar />
      <main className="min-h-screen pt-28 pb-16 bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Impressum</h1>

          <section className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <h2 className="text-xl font-semibold text-foreground">Angaben gemäß § 5 TMG</h2>
            <p>
              AutomatPlanet GmbH<br />
              Musterstraße 1<br />
              10115 Berlin<br />
              Deutschland
            </p>

            <h2 className="text-xl font-semibold text-foreground">Vertreten durch</h2>
            <p>Geschäftsführer: Max Mustermann</p>

            <h2 className="text-xl font-semibold text-foreground">Kontakt</h2>
            <p>
              Telefon: +49 (0) 151 23456789<br />
              E-Mail: info@automatplanet.de
            </p>

            <h2 className="text-xl font-semibold text-foreground">Registereintrag</h2>
            <p>
              Eintragung im Handelsregister<br />
              Registergericht: Amtsgericht Berlin-Charlottenburg<br />
              Registernummer: HRB 123456
            </p>

            <h2 className="text-xl font-semibold text-foreground">Umsatzsteuer-ID</h2>
            <p>
              Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:<br />
              DE 123456789
            </p>

            <h2 className="text-xl font-semibold text-foreground">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <p>
              Max Mustermann<br />
              Musterstraße 1<br />
              10115 Berlin
            </p>

            <h2 className="text-xl font-semibold text-foreground">Streitschlichtung</h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
              <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                https://ec.europa.eu/consumers/odr/
              </a>
              <br />
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>

            <h2 className="text-xl font-semibold text-foreground">Haftung für Inhalte</h2>
            <p>
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>

            <h2 className="text-xl font-semibold text-foreground">Haftung für Links</h2>
            <p>
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
            </p>

            <h2 className="text-xl font-semibold text-foreground">Urheberrecht</h2>
            <p>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Impressum;
