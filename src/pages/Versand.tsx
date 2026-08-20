import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SHIPPING_COUNTRIES, SHIPPING_NET_BY_COUNTRY } from "@/lib/shipping";
import { formatGross, formatNet } from "@/lib/pricing";

const countryName = (code: string) =>
  SHIPPING_COUNTRIES.find((c) => c.code === code)?.name ?? code;

const Versand = () => {
  const rows = Object.entries(SHIPPING_NET_BY_COUNTRY).sort((a, b) =>
    countryName(a[0]).localeCompare(countryName(b[0]), "de"),
  );

  return (
    <>
      <Helmet>
        <title>Versand und Lieferung | AutomatPlanet.de</title>
        <meta
          name="description"
          content="Versandkosten und Lieferzeiten bei AutomatPlanet.de - Speditionsversand ab Lager Hannover, frei Bordsteinkante, Versand in der Regel innerhalb von 24 Stunden."
        />
        <link rel="canonical" href="https://automatplanet.de/versand" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://automatplanet.de/versand" />
        <meta property="og:title" content="Versand und Lieferung | AutomatPlanet.de" />
        <meta property="og:image" content="https://automatplanet.de/images/og/og-default.jpg" />
        <meta property="og:site_name" content="AutomatPlanet" />
        <meta name="twitter:card" content="summary" />
      </Helmet>
      <Navbar />
      <main className="min-h-screen pt-28 pb-16 bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Versand und Lieferung</h1>
          <p className="text-sm text-muted-foreground mb-8">Speditionsversand ab Lager Hannover</p>

          <section className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p>
              Die Lieferung erfolgt ab Lager Hannover per Spedition, frei Bordsteinkante. Der Versand erfolgt in der
              Regel innerhalb von 24 Stunden nach Zahlungseingang.
            </p>

            <h2 className="text-xl font-semibold text-foreground">Versandkosten je Land</h2>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-3 font-semibold text-foreground">Land</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Versandkosten netto</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Versandkosten brutto</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(([code, net]) => (
                    <tr key={code} className="border-b border-border/60 last:border-0">
                      <td className="px-4 py-3">{countryName(code)}</td>
                      <td className="px-4 py-3">{formatNet(net)}</td>
                      <td className="px-4 py-3 text-foreground font-medium">{formatGross(net)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm">Alle weiteren Laender auf Anfrage, Standardsatz 350 Euro netto.</p>

            <h2 className="text-xl font-semibold text-foreground">Lieferzeit</h2>
            <p>
              Der Versand erfolgt in der Regel innerhalb von 24 Stunden nach Zahlungseingang. Die Zustellung dauert je
              nach Zielland 2 bis 8 Werktage.
            </p>
            <p>
              Lieferzeiten gelten als annähernd, sofern sie nicht ausdrücklich schriftlich als verbindlich vereinbart
              wurden.
            </p>

            <h2 className="text-xl font-semibold text-foreground">Gefahrenübergang</h2>
            <p>
              Die Gefahr des zufälligen Untergangs oder der zufälligen Verschlechterung geht mit Übergabe der Ware an
              das Transportunternehmen auf den Kunden über (§ 447 BGB).
            </p>
            <p>
              Der Kunde prüft die Ware bei Anlieferung auf offensichtliche Transportschäden und dokumentiert diese
              gegenüber dem Frachtführer.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Versand;
