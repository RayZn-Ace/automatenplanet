import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adminApi, euro, nf, RANGE_PRESETS, rangeToIso } from "@/lib/adminApi";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { RefreshCw } from "lucide-react";

type RevenueData = {
  range: { from: string; to: string };
  totals: {
    orders: number;
    paidOrders: number;
    grossCents: number;
    netCents: number;
    vatCents: number;
    shippingNetCents: number;
    avgOrderGrossCents: number;
  };
  byStatus: Record<string, number>;
  daily: { date: string; grossCents: number; orders: number }[];
  topProducts: { name: string; qty: number; netCents: number }[];
  byCountry: { country: string; orders: number; grossCents: number }[];
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

const AdminRevenue = () => {
  const [rangeId, setRangeId] = useState("30d");
  const [data, setData] = useState<RevenueData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    const { from, to } = rangeToIso(rangeId);
    try {
      setData(await adminApi<RevenueData>({ view: "revenue", from, to }));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
    } finally {
      setBusy(false);
    }
  }, [rangeId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Umsätze</h1>
        <div className="flex flex-wrap items-center gap-2">
          {RANGE_PRESETS.map((r) => (
            <Button key={r.id} size="sm" variant={r.id === rangeId ? "default" : "outline"} onClick={() => setRangeId(r.id)}>
              {r.label}
            </Button>
          ))}
          <Button size="sm" variant="outline" onClick={load}>
            <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {error && <Card className="p-4 border-destructive text-destructive">{error}</Card>}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-5">
              <div className="text-sm text-muted-foreground">Umsatz brutto</div>
              <div className="text-3xl font-semibold mt-1 text-primary">{euro(data.totals.grossCents)}</div>
            </Card>
            <Card className="p-5">
              <div className="text-sm text-muted-foreground">Netto (Waren)</div>
              <div className="text-3xl font-semibold mt-1">{euro(data.totals.netCents)}</div>
              <div className="text-xs text-muted-foreground mt-1">USt. {euro(data.totals.vatCents)}</div>
            </Card>
            <Card className="p-5">
              <div className="text-sm text-muted-foreground">Bestellungen</div>
              <div className="text-3xl font-semibold mt-1">{nf.format(data.totals.paidOrders)}</div>
              <div className="text-xs text-muted-foreground mt-1">von {nf.format(data.totals.orders)} gesamt</div>
            </Card>
            <Card className="p-5">
              <div className="text-sm text-muted-foreground">Ø Bestellwert</div>
              <div className="text-3xl font-semibold mt-1">{euro(data.totals.avgOrderGrossCents)}</div>
              <div className="text-xs text-muted-foreground mt-1">Versand {euro(data.totals.shippingNetCents)}</div>
            </Card>
          </div>

          <Card className="p-4">
            <div className="mb-2 font-medium">Umsatz pro Tag (brutto)</div>
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={data.daily.map((d) => ({ ...d, gross: d.grossCents / 100 }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(v: number) => `${v.toLocaleString("de-DE")} €`} />
                  <Bar dataKey="gross" fill="hsl(var(--primary))" name="Umsatz" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="p-4">
              <div className="mb-2 font-medium">Top Produkte</div>
              <ul className="text-sm space-y-1 max-h-72 overflow-auto">
                {data.topProducts.length === 0 && <li className="text-muted-foreground">Keine Verkäufe.</li>}
                {data.topProducts.map((p) => (
                  <li key={p.name} className="flex justify-between gap-2 border-t border-border py-1">
                    <span className="truncate">
                      {p.qty}× {p.name}
                    </span>
                    <span className="font-mono whitespace-nowrap">{euro(p.netCents)}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-4">
              <div className="mb-2 font-medium">Länder</div>
              <ul className="text-sm space-y-1 max-h-72 overflow-auto">
                {data.byCountry.length === 0 && <li className="text-muted-foreground">Keine Daten.</li>}
                {data.byCountry.map((c) => (
                  <li key={c.country} className="flex justify-between gap-2 border-t border-border py-1">
                    <span>
                      {c.country} · {c.orders}
                    </span>
                    <span className="font-mono">{euro(c.grossCents)}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-4">
              <div className="mb-2 font-medium">Status</div>
              <ul className="text-sm space-y-1 max-h-72 overflow-auto">
                {Object.entries(data.byStatus).length === 0 && (
                  <li className="text-muted-foreground">Keine Bestellungen.</li>
                )}
                {Object.entries(data.byStatus).map(([s, n]) => (
                  <li key={s} className="flex justify-between gap-2 border-t border-border py-1">
                    <span>{STATUS_LABEL[s] ?? s}</span>
                    <span className="font-mono">{nf.format(n)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminRevenue;
