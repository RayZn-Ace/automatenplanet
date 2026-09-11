import { Phone, MessageCircle } from "lucide-react";
import { trackContactClick } from "@/lib/contactTracking";
import { PHONE_DISPLAY, PHONE_HREF, whatsappHref } from "@/lib/supportContacts";

/**
 * Grüner Kontakt-/Beratungsbanner mit echtem tel-Link.
 * Kein Live-Status: es liegen keine belegten Geschäftszeiten vor.
 */
const PhoneBanner = () => {
  return (
    <div className="border-y border-contact/25 bg-contact/10">
      <div className="container mx-auto px-4 md:px-6 py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-contact text-contact-foreground">
              <Phone className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-wider text-contact">
                Persönliche Beratung
              </p>
              <a
                href={PHONE_HREF}
                onClick={() =>
                  trackContactClick("phone", { label: PHONE_DISPLAY, placement: "phone_banner" })
                }
                className="block text-xl md:text-2xl font-bold text-foreground hover:text-contact transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-contact focus-visible:ring-offset-2 rounded"
              >
                {PHONE_DISPLAY}
              </a>
              <p className="text-sm text-muted-foreground">
                Direkt anrufen - wir klären Auswahl, Standort und Lieferung mit dir.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:shrink-0">
            <a
              href={PHONE_HREF}
              onClick={() =>
                trackContactClick("phone", { label: "Direkt anrufen", placement: "phone_banner_cta" })
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-contact px-5 py-3 text-sm font-bold text-contact-foreground transition-colors hover:bg-contact/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-contact focus-visible:ring-offset-2"
            >
              <Phone className="h-4 w-4" /> Direkt anrufen
            </a>
            <a
              href={whatsappHref("Ich komme von der Automatplanet Website")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackContactClick("whatsapp", { label: "WhatsApp Beratung", placement: "phone_banner_cta" })
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-contact/40 px-5 py-3 text-sm font-bold text-foreground transition-colors hover:bg-contact/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-contact focus-visible:ring-offset-2"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp Beratung
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneBanner;
