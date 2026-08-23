import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/tracking";
import { pushEvent } from "@/lib/dataLayer";
import { track } from "@/lib/analytics";

const Schema = z.object({
  name: z.string().trim().min(2, "Bitte Namen angeben").max(120),
  company: z.string().trim().max(150),
  email: z.string().trim().email("Bitte gültige E-Mail angeben").max(200),
  phone: z.string().trim().min(3, "Bitte Telefonnummer angeben").max(50),
  message: z.string().trim().max(2000),
});

interface Props {
  productSlug?: string;
  productName?: string;
  /** Netto-Warenwert für das Lead-Event (optional). */
  value?: number;
  className?: string;
  label?: string;
  variant?: "default" | "outline" | "secondary";
}

const param = (name: string) => {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get(name) ?? "";
};

const QuoteRequestDialog = ({
  productSlug,
  productName,
  value,
  className,
  label = "Angebot anfordern",
  variant = "outline",
}: Props) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    message: "",
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Bitte Eingaben prüfen");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-lead", {
        body: {
          ...parsed.data,
          productSlug: productSlug ?? "",
          productName: productName ?? "",
          quantity: 1,
          pagePath: typeof window !== "undefined" ? window.location.pathname : "",
          referrer: typeof document !== "undefined" ? document.referrer : "",
          utmSource: param("utm_source"),
          utmMedium: param("utm_medium"),
          utmCampaign: param("utm_campaign"),
          gclid: param("gclid"),
          fbclid: param("fbclid"),
        },
      });
      if (error) throw error;
      if (data && typeof data === "object" && "error" in data) throw new Error("Anfrage fehlgeschlagen");

      // Conversion-Tracking: Meta CAPI / TikTok / GA4 + GTM generate_lead
      trackEvent("lead", {
        value,
        currency: "EUR",
        contentName: productName,
        contentType: "product",
        email: parsed.data.email,
        phone: parsed.data.phone,
        ...(productSlug ? { items: [{ id: productSlug, name: productName, quantity: 1, price: value }] } : {}),
      });
      pushEvent("generate_lead", {
        lead_type: "quote_request",
        currency: "EUR",
        ...(value !== undefined ? { value } : {}),
        item_id: productSlug ?? "",
        item_name: productName ?? "",
        utm_source: param("utm_source"),
        utm_campaign: param("utm_campaign"),
      });
      track("lead_submit", {
        question_id: productSlug ?? "",
        question_title: productName ?? "",
        value_cents: value !== undefined ? Math.round(value * 100) : undefined,
        currency: "EUR",
      });

      toast.success("Danke! Wir melden uns schnellstmöglich mit Ihrem Angebot.");
      setForm({ name: "", company: "", email: "", phone: "", message: "" });
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Anfrage konnte nicht gesendet werden. Bitte per WhatsApp oder Telefon melden.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size="lg"
          className={`w-full h-14 text-base rounded-xl ${className ?? ""}`}
        >
          <FileText className="mr-2 w-5 h-5" /> {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Angebot anfordern</DialogTitle>
          <DialogDescription>
            {productName
              ? `Unverbindliches Angebot für ${productName} - inkl. Lieferzeit, Versand und Zahlung auf Rechnung.`
              : "Unverbindliches Angebot - inkl. Lieferzeit, Versand und Zahlung auf Rechnung."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="lead-name">Name *</Label>
              <Input id="lead-name" value={form.name} onChange={set("name")} required maxLength={120} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-company">Firma</Label>
              <Input id="lead-company" value={form.company} onChange={set("company")} maxLength={150} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-phone">Telefon *</Label>
              <Input id="lead-phone" type="tel" value={form.phone} onChange={set("phone")} required maxLength={50} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-email">E-Mail *</Label>
              <Input id="lead-email" type="email" value={form.email} onChange={set("email")} required maxLength={200} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lead-message">Ihre Nachricht (optional)</Label>
            <Textarea
              id="lead-message"
              value={form.message}
              onChange={set("message")}
              rows={3}
              maxLength={2000}
              placeholder="z. B. Wunschtermin, Standort, Stückzahl"
            />
          </div>
          <Button type="submit" size="lg" className="w-full h-12" disabled={loading}>
            {loading ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : null}
            Anfrage senden
          </Button>
          <p className="text-xs text-muted-foreground">
            Wir verwenden Ihre Daten ausschließlich zur Bearbeitung der Anfrage. Verkauf ausschließlich an
            Unternehmer im Sinne des § 14 BGB.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteRequestDialog;
