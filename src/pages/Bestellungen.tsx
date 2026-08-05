import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RefreshCw, LogOut, Package } from "lucide-react";

type OrderItem = {
  id: string;
  name: string;
  variant_label: string;
  quantity: number;
  unit_price_net_cents: number;
};

type Order = {
  id: string;
  order_number: string;
  status: string;
  email: string;
  first_name: string;
  last_name: string;
  company: string;
  phone: string;
  street: string;
  postal_code: string;
  city: string;
  country: string;
  note: string;
  subtotal_net_cents: number;
  shipping_net_cents: number;
  vat_cents: number;
  total_gross_cents: number;
  payment_method: string;
  paid_at: string | null;
  created_at: string;
  order_items: OrderItem[];
};

const euro = (cents: number) =>
  (cents / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "€";

const STATUS_LABEL: Record<string, string> = {
  pending: "Offen",
  open: "Offen",
  paid: "Bezahlt",
  failed: "Fehlgeschlagen",
  canceled: "Storniert",
  expired: "Abgelaufen",
  shipped: "Versendet",
};

function AuthForm({ onSession }: { onSession: () => void }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
      if (error) throw error;
      onSession();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fehler");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Bestellungen</h1>
          <p className="text-sm text-muted-foreground">Admin-Bereich · Login</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-Mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pw">Passwort</Label>
            <Input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "…" : "Einloggen"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

const Bestellungen = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })
      .limit(200);
    setLoading(false);
    if (error) {
      toast.error("Keine Berechtigung oder Fehler beim Laden.");
      return;
    }
    setOrders((data ?? []) as unknown as Order[]);
  }, []);

  useEffect(() => {
    if (session) load();
  }, [session, load]);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) {
      toast.error("Update fehlgeschlagen.");
      return;
    }
    toast.success("Status aktualisiert.");
    load();
  };

  if (!ready) return null;
  if (!session) return <AuthForm onSession={() => supabase.auth.getSession().then(({ data }) => setSession(data.session))} />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Bestellungen | Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">Bestellungen</h1>
            <p className="text-sm text-muted-foreground">{orders.length} Bestellungen</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Aktualisieren
            </Button>
            <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>

        {orders.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground">
            <Package className="w-10 h-10 mx-auto mb-3" /> Noch keine Bestellungen.
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <Card key={o.id} className="p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{o.order_number}</span>
                      <Badge variant={o.status === "paid" ? "default" : "secondary"}>
                        {STATUS_LABEL[o.status] ?? o.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(o.created_at).toLocaleString("de-DE")} · {o.payment_method}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">{euro(o.total_gross_cents)}</p>
                    <p className="text-xs text-muted-foreground">inkl. USt. {euro(o.vat_cents)}</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-0.5">
                    <p className="font-medium">
                      {o.first_name} {o.last_name} {o.company && `· ${o.company}`}
                    </p>
                    <p className="text-muted-foreground">{o.street}</p>
                    <p className="text-muted-foreground">{o.postal_code} {o.city}, {o.country}</p>
                    <p className="text-muted-foreground break-words">{o.email} · {o.phone}</p>
                    {o.note && <p className="text-muted-foreground italic">„{o.note}“</p>}
                  </div>
                  <div className="space-y-1">
                    {o.order_items?.map((it) => (
                      <div key={it.id} className="flex justify-between gap-2">
                        <span className="break-words">
                          {it.quantity}× {it.name}
                          {it.variant_label ? ` (${it.variant_label})` : ""}
                        </span>
                        <span className="shrink-0">{euro(it.unit_price_net_cents * it.quantity)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between gap-2 text-muted-foreground pt-1 border-t border-border">
                      <span>Versand netto</span>
                      <span>{euro(o.shipping_net_cents)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {o.status !== "shipped" && o.status === "paid" && (
                    <Button size="sm" variant="outline" onClick={() => setStatus(o.id, "shipped")}>
                      Als versendet markieren
                    </Button>
                  )}
                  {o.status !== "canceled" && (
                    <Button size="sm" variant="ghost" onClick={() => setStatus(o.id, "canceled")}>
                      Stornieren
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bestellungen;
