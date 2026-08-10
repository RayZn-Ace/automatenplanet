import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adminApi, euro, nf, RANGE_PRESETS, rangeToIso, formatDuration } from "@/lib/adminApi";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { RefreshCw } from "lucide-react";

type DashboardData = {
  range: { from: string; to: string };
  totals: { visits: number; conversions: number; conversionRate: number; revenueCents: number };
  deviceBreakdown: { desktop: number; mobile: number; tablet: number; other: number };
  pageStats: { pageId: string; visits: number; avgDurationMs: number | null }[];
  dailySeries: { date: string; visits: number; purchases: number }[];
  topProducts: { id: string; title: string; count: number }[];
  topAddToCart: { id: string; title: string; count: number }[];
  funnel: { pageviews: number; addedToCart: number; checkoutStarted: number; purchased: number };
};

type RevenueData = {
  totals: { paidOrders: number; grossCents: number; avgOrderGrossCents: number };
};

const AdminDashboard = () => {
  const [rangeId, setRangeId] = useState("7d");
  const [data, setData] = useState<DashboardData | null>(null);
  const [rev, setRev] = useState<RevenueData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    setError(null);
    const { from, to } = rangeToIso(rangeId);
    try {
      const [d, r] = await Promise.all([
        adminApi<DashboardData>({ from, to }),
        adminApi<RevenueData>({ from, to, view: "revenue" }),
      ]);
      setData(d);
      setRev(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
    } finally {
      setBusy(false);
    }
  }, [rangeId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 60000);
    return () => window.clearInterval(id);
  }, [load]);

  const deviceData = data
    ? [
        { name: "Desktop", value: data.deviceBreakdown.desktop },
        { name: "Mobile", value: data.deviceBreakdown.mobile },
        { name: "Tablet", value: data.deviceBreakdown.tablet },
        { name: "Andere", value: data.deviceBreakdown.other },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {data
              ? `${new Date(data.range.from).toLocaleDateString("de-DE")} – ${new Date(data.range.to).toLocaleDateString("de-DE")}`
              : "Lade…"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
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

      {error && (
        <Card className="p-4 border-destructive text-destructive">
          {error}
          {error.toLowerCase().includes("forbidden") && (
            <p className="text-sm mt-2">Dieser Account hat keine Admin-Rolle.</p>
          )}
        </Card>
      )}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-5">
              <div className="text-sm text-muted-foreground">Besucher</div>
              <div className="text-3xl font-semibold mt-1">{nf.format(data.totals.visits)}</div>
            </Card>
            <Card className="p-5">
              <div className="text-sm text-muted-foreground">Käufe</div>
              <div className="text-3xl font-semibold mt-1">{nf.format(data.totals.conversions)}</div>
            </Card>
            <Card className="p-5">
              <div className="text-sm text-muted-foreground">Conversion Rate</div>
              <div className="text-3xl font-semibold mt-1">{data.totals.conversionRate}%</div>
            </Card>
            <Card className="p-5">
              <div className="text-sm text-muted-foreground">Umsatz (brutto)</div>
              <div className="text-3xl font-semibold mt-1">{euro(rev?.totals.grossCents ?? 0)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {nf.format(rev?.totals.paidOrders ?? 0)} bezahlte Bestellungen · Ø{" "}
                {euro(rev?.totals.avgOrderGrossCents ?? 0)}
              </div>
            </Card>
          </div>

          <Card className="p-4">
            <div className="mb-2 font-medium">Besucher pro Tag</div>
            <div className="h-72">
              <ResponsiveContainer>
                <LineChart data={data.dailySeries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="visits" stroke="hsl(var(--primary))" name="Besucher" />
                  <Line type="monotone" dataKey="purchases" stroke="#10B981" name="Käufe" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-4">
              <div className="mb-2 font-medium">Funnel</div>
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart
                    data={[
                      { step: "Besucher", n: data.funnel.pageviews },
                      { step: "Warenkorb", n: data.funnel.addedToCart },
                      { step: "Checkout", n: data.funnel.checkoutStarted },
                      { step: "Kauf", n: data.funnel.purchased },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="step" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="n" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-4">
              <div className="mb-2 font-medium">Geräte-Verteilung (%)</div>
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={deviceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="p-4">
              <div className="mb-2 font-medium">Top Seiten</div>
              <div className="overflow-auto max-h-72">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-1">Seite</th>
                      <th className="py-1 text-right">Besuche</th>
                      <th className="py-1 text-right">Ø Dauer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pageStats.map((p) => (
                      <tr key={p.pageId} className="border-t border-border">
                        <td className="py-1 truncate max-w-[200px]">{p.pageId}</td>
                        <td className="py-1 text-right">{nf.format(p.visits)}</td>
                        <td className="py-1 text-right">{formatDuration(p.avgDurationMs)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            <Card className="p-4">
              <div className="mb-2 font-medium">Meistgesehene Produkte</div>
              <ul className="text-sm space-y-1 max-h-72 overflow-auto">
                {data.topProducts.length === 0 && <li className="text-muted-foreground">Noch keine Daten.</li>}
                {data.topProducts.map((p) => (
                  <li key={p.id} className="flex justify-between border-t border-border py-1 gap-2">
                    <span className="truncate">{p.title}</span>
                    <span className="font-mono">{nf.format(p.count)}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-4">
              <div className="mb-2 font-medium">Top in den Warenkorb</div>
              <ul className="text-sm space-y-1 max-h-72 overflow-auto">
                {data.topAddToCart.length === 0 && <li className="text-muted-foreground">Noch keine Daten.</li>}
                {data.topAddToCart.map((p) => (
                  <li key={p.id} className="flex justify-between border-t border-border py-1 gap-2">
                    <span className="truncate">{p.title}</span>
                    <span className="font-mono">{nf.format(p.count)}</span>
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

export default AdminDashboard;
