import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Lock, ShoppingCart, ArrowLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import PaymentMethods from "@/components/PaymentMethods";
import { useCartStore } from "@/stores/cartStore";
import { formatGross, formatNet, grossPrice, VAT_RATE } from "@/lib/pricing";
import { SHIPPING_COUNTRIES, shippingNet } from "@/lib/shipping";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/tracking";
import { track } from "@/lib/analytics";

interface AppliedCoupon {
  code: string;
  label: string;
  isTest: boolean;
  freeShipping: boolean;
  discountNetCents: number;
  shippingNetCents: number;
  totalGrossCents: number;
}

const Checkout = () => {
  const items = useCartStore((s) => s.items);
  const [loading, setLoading] = useState(false);
  const [agb, setAgb] = useState(false);
  const [isBusiness, setIsBusiness] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    company: "",
    vatId: "",
    phone: "",
    street: "",
    postalCode: "",
    city: "",
    country: "DE",
    note: "",
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const totals = useMemo(() => {
    const subtotalNet = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const discount = coupon ? coupon.discountNetCents / 100 : 0;
    const shipping = coupon ? coupon.shippingNetCents / 100 : shippingNet(form.country);
    const net = Math.max(subtotalNet - discount + shipping, 0);
    const gross = coupon?.isTest ? coupon.totalGrossCents / 100 : grossPrice(net);
    return { subtotalNet, discount, shipping, net, vat: gross - net, gross };
  }, [items, form.country, coupon]);

  const subtotalNetCents = useMemo(
    () => Math.round(items.reduce((sum, i) => sum + i.price * i.quantity, 0) * 100),
    [items]
  );

  const applyCouponCode = async () => {
    const code = couponInput.trim();
    if (!code) return;
    setCouponLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("validate-coupon", {
        body: { code, subtotalNetCents, country: form.country },
      });
      if (error) throw error;
      const res = data as (AppliedCoupon & { valid: boolean; error?: string }) | null;
      if (!res?.valid) {
        setCoupon(null);
        toast.error(res?.error ?? "Dieser Gutscheincode ist ungültig.");
        return;
      }
      setCoupon({
        code: res.code,
        label: res.label,
        isTest: res.isTest,
        freeShipping: res.freeShipping,
        discountNetCents: res.discountNetCents,
        shippingNetCents: res.shippingNetCents,
        totalGrossCents: res.totalGrossCents,
      });
      toast.success(res.isTest ? "Testmodus aktiv: Zahlbetrag 0,01 €." : `Gutschein aktiv: ${res.label}`);
    } catch (err) {
      console.error("validate-coupon failed", err);
      toast.error("Gutschein konnte nicht geprüft werden.");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponInput("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!form.company.trim()) {
      toast.error("Bitte Firma angeben - wir verkaufen ausschliesslich an Unternehmer.");
      return;
    }
    if (!isBusiness) {
      toast.error("Bitte bestaetigen, dass Sie als Unternehmer bestellen.");
      return;
    }
    if (!agb) {
      toast.error("Bitte AGB und Datenschutz akzeptieren.");
      return;
    }
    setLoading(true);
    try {
      // Testbestellungen werden nicht als Conversion getrackt.
      if (!coupon?.isTest) {
        trackEvent("begin_checkout", {
          value: totals.subtotalNet,
          currency: "EUR",
          contentType: "product",
          items: items.map((i) => ({ id: i.slug, name: i.name, quantity: i.quantity, price: i.price })),
        });
        track("checkout_started", {
          answer_option: String(Math.round(totals.gross * 100)),
          value_cents: Math.round(totals.gross * 100),
          currency: "EUR",
        });
      }

      const { data, error } = await supabase.functions.invoke("create-order", {
        body: {
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
          customer: { ...form, isBusiness },
          couponCode: coupon?.code ?? "",
          origin: window.location.origin,
        },
      });
      if (error) throw error;
      if (!data?.checkoutUrl) throw new Error("Zahlung konnte nicht gestartet werden.");
      window.location.href = data.checkoutUrl as string;
    } catch (err) {
      console.error("create-order failed", err);
      toast.error("Bestellung konnte nicht abgeschlossen werden. Bitte erneut versuchen oder per WhatsApp melden.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Kasse – Automaten sicher online bestellen | AutomatPlanet</title>
        <meta name="description" content="Bestellung abschließen: Lieferadresse angeben und sicher per Mollie (Klarna, PayPal, Kreditkarte, SEPA) bezahlen." />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <Navbar />

      <main className="container mx-auto px-4 md:px-6 pt-28 pb-20">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Kasse</h1>
        <p className="text-muted-foreground mb-8">Sichere Zahlung über Mollie – Klarna, PayPal, Kreditkarte, SEPA & mehr.</p>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <ShoppingCart className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-6">Ihr Warenkorb ist leer.</p>
            <Button asChild>
              <Link to="/"><ArrowLeft className="w-4 h-4 mr-2" /> Weiter einkaufen</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
            {/* Address */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-8 space-y-5 min-w-0">
              <h2 className="text-xl font-semibold">Lieferadresse</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">Vorname *</Label>
                  <Input id="firstName" value={form.firstName} onChange={set("firstName")} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Nachname *</Label>
                  <Input id="lastName" value={form.lastName} onChange={set("lastName")} required />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="company">Firma *</Label>
                  <Input id="company" value={form.company} onChange={set("company")} required />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="vatId">USt-IdNr. (optional)</Label>
                  <Input id="vatId" value={form.vatId} onChange={set("vatId")} placeholder="z. B. DE123456789" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">E-Mail *</Label>
                  <Input id="email" type="email" value={form.email} onChange={set("email")} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Telefon *</Label>
                  <Input id="phone" type="tel" value={form.phone} onChange={set("phone")} required />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="street">Straße & Hausnummer *</Label>
                  <Input id="street" value={form.street} onChange={set("street")} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="postalCode">PLZ *</Label>
                  <Input id="postalCode" value={form.postalCode} onChange={set("postalCode")} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city">Ort *</Label>
                  <Input id="city" value={form.city} onChange={set("city")} required />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="country">Land *</Label>
                  <select
                    id="country"
                    value={form.country}
                    onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {SHIPPING_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="note">Hinweis zur Lieferung (optional)</Label>
                  <Textarea id="note" value={form.note} onChange={set("note")} rows={3} />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4 min-w-0 lg:sticky lg:top-24">
              <h2 className="text-xl font-semibold">Bestellübersicht</h2>
              <div className="space-y-3">
                {items.map((i) => (
                  <div key={i.variantId} className="flex gap-3 items-start">
                    <div className="w-14 h-14 rounded-md bg-secondary/20 shrink-0 flex items-center justify-center overflow-hidden">
                      <img src={i.image} alt={i.name} className="w-full h-full object-contain" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium break-words">{i.name}</p>
                      <p className="text-xs text-muted-foreground">Menge: {i.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold shrink-0">{formatNet(i.price * i.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Gutschein */}
              <div className="border-t border-border pt-4 space-y-2">
                <Label htmlFor="coupon" className="text-sm">Gutschein- oder Testcode</Label>
                {coupon ? (
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold break-words">{coupon.code.toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">{coupon.label}</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={removeCoupon}>
                      Entfernen
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      id="coupon"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Code eingeben"
                      maxLength={60}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void applyCouponCode();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void applyCouponCode()}
                      disabled={couponLoading || !couponInput.trim()}
                    >
                      {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Einlösen"}
                    </Button>
                  </div>
                )}
                {coupon?.isTest && (
                  <p className="text-xs font-medium text-amber-500">
                    Testmodus: Diese Bestellung wird als Testbestellung markiert, kostet 0,01 € und wird nicht
                    als Conversion getrackt.
                  </p>
                )}
              </div>

              <div className="border-t border-border pt-4 space-y-1.5 text-sm">
                <div className="flex justify-between gap-2"><span className="text-muted-foreground">Zwischensumme netto</span><span>{formatNet(totals.subtotalNet)}</span></div>
                {totals.discount > 0 && (
                  <div className="flex justify-between gap-2 text-primary"><span>Rabatt ({coupon?.code.toUpperCase()})</span><span>-{formatNet(totals.discount)}</span></div>
                )}
                <div className="flex justify-between gap-2"><span className="text-muted-foreground">Versand netto</span><span>{formatNet(totals.shipping)}</span></div>
                <div className="flex justify-between gap-2"><span className="text-muted-foreground">USt. {Math.round(VAT_RATE * 100)}%</span><span>{totals.vat.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</span></div>
                <div className="flex justify-between gap-2 items-baseline border-t border-border pt-3 mt-2">
                  <span className="font-semibold">Gesamt</span>
                  <span className="text-2xl font-bold text-primary break-words">
                    {totals.gross.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">inkl. 19% MwSt. und Versand</p>
              </div>

              <label className="flex items-start gap-3 text-xs text-muted-foreground leading-relaxed">
                <Checkbox checked={isBusiness} onCheckedChange={(v) => setIsBusiness(v === true)} className="mt-0.5" />
                <span>
                  Ich bestaetige, dass ich als Unternehmer im Sinne des § 14 BGB bestelle. Ein Vertragsschluss mit
                  Verbrauchern ist ausgeschlossen.
                </span>
              </label>

              <label className="flex items-start gap-3 text-xs text-muted-foreground leading-relaxed">
                <Checkbox checked={agb} onCheckedChange={(v) => setAgb(v === true)} className="mt-0.5" />
                <span>
                  Ich akzeptiere die{" "}
                  <Link to="/agb" className="text-primary underline">AGB</Link>, die{" "}
                  <Link to="/rueckgabe" className="text-primary underline">Rückgabe- und Gewährleistungsregeln</Link>{" "}
                  und die{" "}
                  <Link to="/datenschutz" className="text-primary underline">Datenschutzerklärung</Link>.
                </span>
              </label>

              <Button type="submit" size="lg" className="w-full h-14 text-base" disabled={loading}>
                {loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Weiter zur Zahlung</> : <><Lock className="w-5 h-5 mr-2" /> Jetzt kaufen</>}
              </Button>
              <PaymentMethods />
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
