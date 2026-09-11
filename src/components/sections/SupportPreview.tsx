import { Link } from "react-router-dom";
import { Phone, MessageCircle, Mail, ArrowRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { supportFaqs } from "@/data/supportFaq";
import { trackContactClick } from "@/lib/contactTracking";
import {
  CONTACT_EMAIL,
  PHONE_DISPLAY,
  PHONE_HREF,
  mailtoHref,
  whatsappHref,
} from "@/lib/supportContacts";

const preview = supportFaqs.slice(0, 5);

/** Kontaktanker fuer die Startseite und Footer-Link /#kontakt. */
const SupportPreview = () => {
  return (
    <section id="kontakt" className="py-20 md:py-24 bg-card/40 border-y border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Support & Kontakt</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold">Wir sind persönlich erreichbar</h2>
            <p className="mt-4 text-muted-foreground">
              Ob Auswahl, Lieferung oder Technik: Melde dich auf dem Kanal, der dir am besten passt.
            </p>

            <div className="mt-6 space-y-3">
              <a
                href={PHONE_HREF}
                onClick={() =>
                  trackContactClick("phone", { label: PHONE_DISPLAY, placement: "support_preview" })
                }
                className="flex items-center gap-3 rounded-2xl border border-contact/40 p-4 transition-colors hover:bg-contact/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-contact focus-visible:ring-offset-2"
              >
                <Phone className="h-5 w-5 text-contact" />
                <span>
                  <span className="block text-sm font-bold">Telefon</span>
                  <span className="block text-sm text-muted-foreground">{PHONE_DISPLAY}</span>
                </span>
              </a>
              <a
                href={whatsappHref("Ich komme von der Automatplanet Website")}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackContactClick("whatsapp", { label: "WhatsApp", placement: "support_preview" })
                }
                className="flex items-center gap-3 rounded-2xl border border-contact/40 p-4 transition-colors hover:bg-contact/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-contact focus-visible:ring-offset-2"
              >
                <MessageCircle className="h-5 w-5 text-contact" />
                <span>
                  <span className="block text-sm font-bold">WhatsApp</span>
                  <span className="block text-sm text-muted-foreground">Beratung im Chat</span>
                </span>
              </a>
              <a
                href={mailtoHref("Anfrage über automatplanet.com")}
                className="flex items-center gap-3 rounded-2xl border border-border p-4 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Mail className="h-5 w-5 text-primary" />
                <span className="min-w-0">
                  <span className="block text-sm font-bold">E-Mail</span>
                  <span className="block truncate text-sm text-muted-foreground">{CONTACT_EMAIL}</span>
                </span>
              </a>
            </div>

            <Link
              to="/support"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              Alle Hilfethemen im Support-Bereich <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div>
            <h3 className="text-xl font-bold">Häufige Fragen</h3>
            <Accordion type="single" collapsible className="mt-4">
              {preview.map((f) => (
                <AccordionItem key={f.id} value={f.id}>
                  <AccordionTrigger className="text-left text-sm font-semibold">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {f.a}
                    {f.links && (
                      <span className="mt-3 flex flex-wrap gap-3">
                        {f.links.map((l) => (
                          <Link key={l.to + l.label} to={l.to} className="text-primary underline">
                            {l.label}
                          </Link>
                        ))}
                      </span>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <Link
              to="/support"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              Weitere Fragen ansehen <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupportPreview;
