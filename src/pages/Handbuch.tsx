import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Handbuch = () => {
  return (
    <>
      <Helmet>
        <title>Handbuch Tischkicker Pro CL | AutomatPlanet.de</title>
        <meta
          name="description"
          content="Benutzer-Handbuch für den Tischkicker Pro CL: Montage, Inbetriebnahme, Spielanleitung, Wartung und technische Daten."
        />
        <link rel="canonical" href="https://automatplanet.de/handbuch" />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://automatplanet.de/handbuch" />
        <meta property="og:title" content="Handbuch Tischkicker Pro CL | AutomatPlanet.de" />
        <meta
          property="og:description"
          content="Benutzer-Handbuch für den Tischkicker Pro CL: Montage, Inbetriebnahme, Spielanleitung, Wartung und technische Daten."
        />
        <meta property="og:image" content="https://automatplanet.de/images/og/og-default.jpg" />
        <meta property="og:site_name" content="AutomatPlanet" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <Navbar />
      <main className="min-h-screen pt-28 pb-16 bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <header className="mb-10">
            <p className="text-sm uppercase tracking-widest text-primary mb-2">Benutzer-Handbuch</p>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Tischkicker Pro CL</h1>
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
          </header>

          <section className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">1. Einleitung</h2>
              <p>
                Der Tischkicker Pro CL ist ein professioneller Kickertisch mit elektronischer
                Steuerung, Münzeinwurf und automatischer Ballausgabe.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">🛠️ 2. Montage & Inbetriebnahme</h2>
              <p>
                Die Maschine wird betriebsbereit geliefert. Lediglich die Standfüße müssen
                montiert werden.
              </p>
              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Montage der Füße</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Pro Fuß: 4 Schrauben + Unterlegscheiben verwenden</li>
                <li>Schrauben befinden sich in der Kasse der Maschine</li>
                <li>Tisch auf eine weiche Unterlage legen (Schutz vor Kratzern)</li>
              </ul>
              <h3 className="text-lg font-semibold text-foreground mt-4 mb-2">Inbetriebnahme</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Gewünschte Anzahl Bälle in den Ballkanal legen</li>
                <li>Gerät an 220V Strom anschließen</li>
                <li>Spiel starten</li>
              </ul>
              <p className="mt-3">👉 Die Bälle befinden sich ebenfalls in der Kasse.</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">🎮 3. Spielanleitung</h2>
              <p><strong className="text-foreground">Standard:</strong> 11 Bälle → Sieg bei 6 Toren</p>
              <p className="mt-2 font-semibold text-foreground">Alternative Spielmodi:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>9 Bälle → Sieg bei 5 Toren</li>
                <li>7 Bälle → Sieg bei 4 Toren</li>
              </ul>
              <p className="mt-3">👉 Weitere Bälle dienen als Ersatz.</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">⚙️ 4. Elektronik & Anschlüsse</h2>
              <p>Die Steuerplatine verfügt über folgende Anschlüsse:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>220V Stromanschluss</li>
                <li>Lautsprecheranschluss</li>
                <li>Lautstärkeregler</li>
                <li>Münzeinwurf-Anschluss</li>
                <li>Torschalter A & B</li>
                <li>Display-Anschluss</li>
                <li>Ballwurfpumpe Anschluss</li>
                <li>Systemeinstellungen (DIP-Schalter)</li>
              </ul>
              <div className="mt-4 p-4 border-l-4 border-primary bg-primary/5 rounded">
                <p className="font-semibold text-foreground">⚠️ Wichtig:</p>
                <p>Alle DIP-Schalter müssen auf OFF stehen, sonst sperrt sich das System.</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">⚠️ 5. Sicherheitshinweise</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Aufbau mit mindestens 2 Personen</li>
                <li>Nicht für Kinder unter 3 Jahren geeignet</li>
                <li>Nutzung nur unter Aufsicht von Erwachsenen</li>
                <li>Nicht auf den Tisch setzen oder klettern</li>
                <li>Gerät nicht als Ablage verwenden</li>
                <li>Nur auf stabilem, ebenem Untergrund aufstellen</li>
                <li>Vor direkter Sonneneinstrahlung schützen</li>
              </ul>
              <p className="mt-3">👉 Tisch niemals schieben – immer tragen (2 Personen).</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">🔧 6. Wartung & Pflege</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Reinigung: nur mit trockenem oder leicht feuchtem Tuch</li>
                <li>Keine aggressiven Reinigungsmittel verwenden</li>
                <li>Metallstangen alle 6 Monate fetten (Vaseline)</li>
                <li>Regelmäßige Kontrolle auf Schäden</li>
              </ul>
              <div className="mt-4 p-4 border-l-4 border-destructive bg-destructive/5 rounded">
                <p className="font-semibold text-foreground">⚠️ Bei Defekten:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Gerät sofort außer Betrieb nehmen</li>
                  <li>Keine eigenständigen Reparaturen durchführen</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">📦 7. Lagerung</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Trocken und geschützt lagern</li>
                <li>Keine extreme Hitze oder Feuchtigkeit</li>
                <li>So lagern, dass keine Verletzungsgefahr entsteht</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">📊 8. Technische Daten</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border border-white/10 rounded">
                  <tbody className="divide-y divide-white/10">
                    <tr>
                      <th className="py-2 px-3 font-semibold text-foreground w-1/2">Modell</th>
                      <td className="py-2 px-3">Tischkicker Pro CL</td>
                    </tr>
                    <tr>
                      <th className="py-2 px-3 font-semibold text-foreground">Artikelnummer</th>
                      <td className="py-2 px-3">2025504</td>
                    </tr>
                    <tr>
                      <th className="py-2 px-3 font-semibold text-foreground">Gewicht</th>
                      <td className="py-2 px-3">ca. 70 kg</td>
                    </tr>
                    <tr>
                      <th className="py-2 px-3 font-semibold text-foreground">Spielfläche</th>
                      <td className="py-2 px-3">ca. 118 x 68 cm</td>
                    </tr>
                    <tr>
                      <th className="py-2 px-3 font-semibold text-foreground">Maße</th>
                      <td className="py-2 px-3">ca. 135 x 77 x 90 cm</td>
                    </tr>
                    <tr>
                      <th className="py-2 px-3 font-semibold text-foreground">Stromversorgung</th>
                      <td className="py-2 px-3">220V</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 border-l-4 border-primary bg-primary/5 rounded">
              <p className="font-semibold text-foreground">💣 Wichtiger Hinweis</p>
              <p>👉 Keine baulichen Veränderungen vornehmen</p>
              <p>👉 Nur Original-Ersatzteile verwenden</p>
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

export default Handbuch;
