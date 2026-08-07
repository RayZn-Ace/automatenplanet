import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { hasDecided, setConsent } from "@/lib/consent";

export const OPEN_CONSENT_EVENT = "ap-open-consent";

/** Öffnet den Banner erneut (z.B. Footer-Link "Cookie-Einstellungen"). */
export function openConsentSettings() {
  window.dispatchEvent(new Event(OPEN_CONSENT_EVENT));
}

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);
  const [details, setDetails] = useState(false);

  useEffect(() => {
    if (!hasDecided()) setVisible(true);
    const open = () => {
      setDetails(false);
      setVisible(true);
    };
    window.addEventListener(OPEN_CONSENT_EVENT, open);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, open);
  }, []);

  const decide = (marketing: boolean) => {
    setConsent(marketing);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie-Einstellungen"
      className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-4"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-border/60 bg-card/95 p-4 shadow-2xl backdrop-blur-xl sm:p-6">
        <h2 className="text-base font-semibold text-foreground sm:text-lg">
          Datenschutz &amp; Cookies
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Wir nutzen technisch notwendige Cookies für den Betrieb des Shops. Mit Ihrer Einwilligung
          setzen wir zusätzlich Marketing- und Analyse-Dienste (Meta, TikTok, Google) ein, um unsere
          Angebote zu messen und zu verbessern. Sie können Ihre Auswahl jederzeit ändern.
        </p>

        {details && (
          <ul className="mt-4 space-y-3 text-sm">
            <li className="rounded-lg border border-border/50 bg-background/40 p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-foreground">Notwendig</span>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Immer aktiv
                </span>
              </div>
              <p className="mt-1 text-muted-foreground">
                Warenkorb, Zahlungsabwicklung, Sicherheit und Spracheinstellung.
              </p>
            </li>
            <li className="rounded-lg border border-border/50 bg-background/40 p-3">
              <div className="font-medium text-foreground">Marketing &amp; Analyse</div>
              <p className="mt-1 text-muted-foreground">
                Meta Pixel, TikTok Pixel, Google Analytics 4 / Google Ads – Reichweitenmessung und
                Conversion-Tracking, ggf. Datenübermittlung in die USA.
              </p>
            </li>
          </ul>
        )}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button className="w-full sm:w-auto" onClick={() => decide(true)}>
            Alle akzeptieren
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => decide(false)}>
            Nur notwendige
          </Button>
          <button
            type="button"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline sm:ml-auto"
            onClick={() => setDetails((v) => !v)}
          >
            {details ? "Details ausblenden" : "Details anzeigen"}
          </button>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Mehr Infos in der{" "}
          <Link to="/datenschutz" className="underline underline-offset-2 hover:text-foreground">
            Datenschutzerklärung
          </Link>{" "}
          ·{" "}
          <Link to="/impressum" className="underline underline-offset-2 hover:text-foreground">
            Impressum
          </Link>
        </p>
      </div>
    </div>
  );
};

export default CookieBanner;
