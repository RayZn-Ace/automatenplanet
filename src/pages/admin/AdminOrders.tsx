import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { euro } from "@/lib/adminApi";
import { RefreshCw, Package } from "lucide-react";

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

const STATUS_LABEL: Record<string, string> = {
  pending: "Offen",
  open: "Offen",
  paid: "Bezahlt",
  failed: "Fehlgeschlagen",
  canceled: "Storniert",
  expired: "Abgelaufen",
  shipped: "Versendet",
};

const STATUS_FILTERS = ["alle", "pending", "paid", "shipped", "canceled"];

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatusFilter] = useState("alle");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })
      .limit(300);
    setLoading(false);
    if (error) {
      toast.error("Keine Berechtigung oder Fehler beim Laden.");
      return;
    }
    setOrders((data ?? []) as unknown as Order[]);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (id: string, next: string) => {
    const { error } = await supabase.from("orders").update({ status: next }).eq("id", id);
    if (error) {
      toast.error("Update fehlgeschlagen.");
      return;
    }
    toast.success("Status aktualisiert.");
    load();
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (status !== "alle" && o.status !== status) return false;
      if (!q) return true;
      return (
        o.order_number.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        `${o.first_name} ${o.last_name}`.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q)
      );
    });
  }, [orders, status, search]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Bestellungen</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} von {orders.length}</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Aktualisieren
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {STATUS_FILTERS.map((s) => (
          <Button key={s} size="sm" variant={s === status ? "default" : "outline"} onClick={() => setStatusFilter(s)}>
            {s === "alle" ? "Alle" : STATUS_LABEL[s] ?? s}
          </Button>
        ))}
        <Input
          className="w-full sm:w-64"
          placeholder="Suche Nr., Name, E-Mail…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          <Package className="w-10 h-10 mx-auto mb-3" /> Keine Bestellungen.
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((o) => (
            <Card key={o.id} className="p-5 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{o.order_number}</span>
                    <Badge variant={o.status === "paid" || o.status === "shipped" ? "default" : "secondary"}>
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
                  <p className="text-muted-foreground">
                    {o.postal_code} {o.city}, {o.country}
                  </p>
                  <p className="text-muted-foreground break-words">
                    {o.email} · {o.phone}
                  </p>
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
                {o.status === "paid" && (
                  <Button size="sm" variant="outline" onClick={() => setStatus(o.id, "shipped")}>
                    Als versendet markieren
                  </Button>
                )}
                {o.status !== "paid" && o.status !== "shipped" && (
                  <Button size="sm" variant="outline" onClick={() => setStatus(o.id, "paid")}>
                    Als bezahlt markieren
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
  );
};

export default AdminOrders;
