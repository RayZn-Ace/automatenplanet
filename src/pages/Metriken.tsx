import { useEffect, useMemo, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
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
import { RefreshCw, LogOut } from "lucide-react";

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

const nf = new Intl.NumberFormat("de-DE");

function formatDuration(ms: number | null) {
  if (ms == null) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

const RANGE_PRESETS = [
  { id: "1d", label: "Heute", days: 1 },
  { id: "7d", label: "7 Tage", days: 7 },
  { id: "30d", label: "30 Tage", days: 30 },
  { id: "90d", label: "90 Tage", days: 90 },
];

function AuthForm({ onSession }: { onSession: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
        if (error) throw error;
        onSession();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password: pw,
          options: { emailRedirectTo: `${window.location.origin}/metriken` },
        });
        if (error) throw error;
        toast.success("Account erstellt. Bitte E-Mail bestätigen, dann einloggen.");
        setMode("login");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Fehler";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Metriken</h1>
          <p className="text-sm text-muted-foreground">Admin-Bereich · {mode === "login" ? "Login" : "Registrieren"}</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="email">E-Mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="pw">Passwort</Label>
            <Input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} required minLength={8} />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "..." : mode === "login" ? "Einloggen" : "Account erstellen"}
          </Button>
        </form>
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground underline"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? "Noch kein Account? Registrieren" : "Schon Account? Einloggen"}
        </button>
      </Card>
    </div>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [rangeId, setRangeId] = useState("7d");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { from, to } = useMemo(() => {
    const preset = RANGE_PRESETS.find((r) => r.id === rangeId) ?? RANGE_PRESETS[1];
    const now = new Date();
    const start = new Date(now);
    if (rangeId === "1d") {
      start.setHours(0, 0, 0, 0);
    } else {
      start.setDate(start.getDate() - preset.days);
    }
    return { from: start.toISOString(), to: now.toISOString() };
  }, [rangeId]);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      setError(null);
      try {
        const { data: res, error: err } = await supabase.functions.invoke("analytics-dashboard", {
          method: "GET" as never,
          body: undefined,
          // pass via querystring through fetch fallback
        });
        // supabase-js doesn't support GET query params well — fall back to manual fetch:
        let final: DashboardData | null = res as DashboardData | null;
        if (!final || err) {
          const sess = (await supabase.auth.getSession()).data.session;
          const r = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analytics-dashboard?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
            { headers: { Authorization: `Bearer ${sess?.access_token}` } },
          );
          if (!r.ok) {
            const txt = await r.text();
            throw new Error(txt || `HTTP ${r.status}`);
          }
          final = await r.json();
        }
        setData(final);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Fehler");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [from, to],
  );

  useEffect(() => {
    load(false);
  }, [load]);

  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") load(true);
    }, 30000);
    return () => window.clearInterval(id);
  }, [live, load]);

  const deviceData = data
    ? [
        { name: "Desktop", value: data.deviceBreakdown.desktop },
        { name: "Mobile", value: data.deviceBreakdown.mobile },
        { name: "Tablet", value: data.deviceBreakdown.tablet },
        { name: "Andere", value: data.deviceBreakdown.other },
      ]
    : [];

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <Helmet>
        <title>Metriken · AutomatPlanet</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Metriken</h1>
          <p className="text-sm text-muted-foreground">
            {data ? `${new Date(data.range.from).toLocaleDateString("de-DE")} – ${new Date(data.range.to).toLocaleDateString("de-DE")}` : "Lade…"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {RANGE_PRESETS.map((r) => (
            <Button
              key={r.id}
              size="sm"
              variant={r.id === rangeId ? "default" : "outline"}
              onClick={() => setRangeId(r.id)}
            >
              {r.label}
            </Button>
          ))}
          <Button size="sm" variant="outline" onClick={() => load(true)}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
          <label className="text-xs flex items-center gap-1 ml-2">
            <input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} />
            Live
          </label>
          <Button size="sm" variant="ghost" onClick={onLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {error && (
        <Card className="p-4 border-destructive text-destructive mb-4">
          {error}
          {error.toLowerCase().includes("forbidden") && (
            <p className="text-sm mt-2">
              Dein Account hat noch keine Admin-Rolle. Sag dem Entwickler Bescheid mit deiner User-ID, damit sie zugewiesen wird.
            </p>
          )}
        </Card>
      )}

      {loading && !data && (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 h-32 animate-pulse" />
          ))}
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* KPI */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-6">
              <div className="text-sm text-muted-foreground">Besucher</div>
              <div className="text-3xl font-semibold mt-1">{nf.format(data.totals.visits)}</div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-muted-foreground">Käufe</div>
              <div className="text-3xl font-semibold mt-1">{nf.format(data.totals.conversions)}</div>
            </Card>
            <Card className="p-6">
              <div className="text-sm text-muted-foreground">Conversion Rate</div>
              <div className="text-3xl font-semibold mt-1">{data.totals.conversionRate}%</div>
            </Card>
          </div>

          {/* Daily series */}
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

          {/* Funnel */}
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

          <div className="grid gap-4 md:grid-cols-2">
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

            <Card className="p-4">
              <div className="mb-2 font-medium">Top Seiten</div>
              <div className="overflow-auto max-h-64">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-1">Seite</th>
                      <th className="py-1 text-right">Besuche</th>
                      <th className="py-1 text-right">Ø Verweildauer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pageStats.map((p) => (
                      <tr key={p.pageId} className="border-t">
                        <td className="py-1 truncate max-w-[260px]">{p.pageId}</td>
                        <td className="py-1 text-right">{nf.format(p.visits)}</td>
                        <td className="py-1 text-right">{formatDuration(p.avgDurationMs)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4">
              <div className="mb-2 font-medium">Meistgesehene Produkte</div>
              <ul className="text-sm space-y-1">
                {data.topProducts.length === 0 && <li className="text-muted-foreground">Noch keine Daten.</li>}
                {data.topProducts.map((p) => (
                  <li key={p.id} className="flex justify-between border-t py-1">
                    <span className="truncate max-w-[260px]">{p.title}</span>
                    <span className="font-mono">{nf.format(p.count)}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-4">
              <div className="mb-2 font-medium">Top in den Warenkorb</div>
              <ul className="text-sm space-y-1">
                {data.topAddToCart.length === 0 && <li className="text-muted-foreground">Noch keine Daten.</li>}
                {data.topAddToCart.map((p) => (
                  <li key={p.id} className="flex justify-between border-t py-1">
                    <span className="truncate max-w-[260px]">{p.title}</span>
                    <span className="font-mono">{nf.format(p.count)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

const Metriken = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUserId(s?.user.id ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUserId(data.session?.user.id ?? null);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) return null;

  if (!session) {
    return <AuthForm onSession={() => { /* state updates via listener */ }} />;
  }

  return (
    <>
      <div className="bg-muted text-muted-foreground text-xs px-4 py-1 text-center">
        Eingeloggt als {session.user.email} · User-ID: <code className="font-mono">{userId}</code>
      </div>
      <Dashboard
        onLogout={async () => {
          await supabase.auth.signOut();
        }}
      />
    </>
  );
};

export default Metriken;
