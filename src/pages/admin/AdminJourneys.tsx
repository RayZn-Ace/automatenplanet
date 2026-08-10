import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { adminApi, euro, nf, RANGE_PRESETS, rangeToIso, formatDuration } from "@/lib/adminApi";
import { RefreshCw, ArrowLeft, ArrowRight, Search } from "lucide-react";

function cleanPath(raw: string) {
  if (!raw) return "—";
  const path = raw.split("?")[0].split("#")[0];
  return path === "" ? "/" : path;
}

function sourceLabel(s: { utmSource: string; referrer: string }) {
  if (s.utmSource) return s.utmSource;
  if (!s.referrer) return "direkt";
  try {
    return new URL(s.referrer).hostname.replace(/^www\./, "");
  } catch {
    return s.referrer;
  }
}

type SessionRow = {
  sessionId: string;
  start: string;
  end: string;
  entryPage: string;
  exitPage: string;
  device: string;
  browser: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  pageviews: number;
  events: number;
  durationMs: number;
  addedToCart: boolean;
  checkout: boolean;
  purchased: boolean;
  revenueCents: number;
};

type JourneyEvent = {
  id: number;
  event_type: string;
  page_id: string;
  question_title: string | null;
  answer_option: string | null;
  duration_ms: number | null;
  value_cents: number | null;
  device_type: string;
  browser: string;
  referrer: string;
  utm_source: string;
  created_at: string;
};

const FILTERS = [
  { id: "all", label: "Alle" },
  { id: "cart", label: "Warenkorb, kein Kauf" },
  { id: "converted", label: "Käufer" },
];

const AdminJourneys = () => {
  const [params, setParams] = useSearchParams();
  const selected = params.get("session");
  const [rangeId, setRangeId] = useState("7d");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [events, setEvents] = useState<JourneyEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    const { from, to } = rangeToIso(rangeId);
    try {
      const res = await adminApi<{ sessions: SessionRow[] }>({ view: "journeys", from, to, filter });
      setSessions(res.sessions);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
    } finally {
      setBusy(false);
    }
  }, [rangeId, filter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!selected) {
      setEvents(null);
      return;
    }
    setBusy(true);
    adminApi<{ events: JourneyEvent[] }>({ view: "journey", session_id: selected })
      .then((r) => setEvents(r.events))
      .catch((e) => setError(e instanceof Error ? e.message : "Fehler"))
      .finally(() => setBusy(false));
  }, [selected]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(
      (s) =>
        s.sessionId.includes(q) ||
        s.entryPage.toLowerCase().includes(q) ||
        s.exitPage.toLowerCase().includes(q) ||
        (s.utmSource || "").toLowerCase().includes(q) ||
        (s.referrer || "").toLowerCase().includes(q),
    );
  }, [sessions, search]);

  if (selected) {
    const first = events?.[0];
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" onClick={() => setParams({})}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Zurück
          </Button>
          <h1 className="text-xl font-semibold">Journey</h1>
          <span className="font-mono text-xs text-muted-foreground break-all">{selected}</span>
        </div>

        {first && (
          <Card className="p-4 grid gap-2 sm:grid-cols-4 text-sm">
            <div>
              <div className="text-muted-foreground">Gerät</div>
              <div>{first.device_type} · {first.browser || "—"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Quelle</div>
              <div className="truncate">{first.utm_source || first.referrer || "direkt"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Start</div>
              <div>{new Date(first.created_at).toLocaleString("de-DE")}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Events</div>
              <div>{nf.format(events?.length ?? 0)}</div>
            </div>
          </Card>
        )}

        <Card className="p-4">
          <ol className="relative border-l border-border ml-2 space-y-3">
            {(events ?? []).map((e) => (
              <li key={e.id} className="ml-4">
                <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-primary" />
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-mono text-xs text-muted-foreground">
                    {new Date(e.created_at).toLocaleTimeString("de-DE")}
                  </span>
                  <Badge variant="secondary">{e.event_type}</Badge>
                  <span className="break-words">{e.question_title || e.page_id}</span>
                  {e.answer_option && <span className="text-muted-foreground">· {e.answer_option}</span>}
                  {e.duration_ms != null && (
                    <span className="text-muted-foreground">· {formatDuration(e.duration_ms)}</span>
                  )}
                  {e.value_cents ? <span className="text-primary font-medium">{euro(e.value_cents)}</span> : null}
                </div>
              </li>
            ))}
            {events && events.length === 0 && <li className="ml-4 text-muted-foreground">Keine Events.</li>}
          </ol>
        </Card>
      </div>
    );
  }

  const stats = useMemo(() => {
    const buyers = filtered.filter((s) => s.purchased);
    const carts = filtered.filter((s) => s.addedToCart && !s.purchased);
    const engaged = filtered.filter((s) => s.pageviews > 1);
    const revenue = buyers.reduce((sum, s) => sum + (s.revenueCents || 0), 0);
    return { total: filtered.length, buyers: buyers.length, carts: carts.length, engaged: engaged.length, revenue };
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customer Journeys</h1>
          <p className="text-sm text-muted-foreground">
            {nf.format(stats.total)} Sessions im gewählten Zeitraum
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-border bg-card p-1">
            {RANGE_PRESETS.map((r) => (
              <button
                key={r.id}
                onClick={() => setRangeId(r.id)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  r.id === rangeId
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <Button size="icon" variant="outline" onClick={load} aria-label="Aktualisieren">
            <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Sessions", value: nf.format(stats.total) },
          { label: "Mit Interaktion", value: nf.format(stats.engaged) },
          { label: "Warenkorb offen", value: nf.format(stats.carts) },
          { label: "Käufe", value: `${nf.format(stats.buyers)}${stats.revenue ? ` · ${euro(stats.revenue)}` : ""}` },
        ].map((k) => (
          <Card key={k.label} className="p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{k.label}</div>
            <div className="mt-1 text-xl font-semibold">{k.value}</div>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="inline-flex rounded-lg border border-border bg-card p-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                f.id === filter
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Suche Seite, Quelle, Session…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <Card className="p-4 border-destructive text-destructive">{error}</Card>}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead className="bg-muted/50">
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">Session</th>
                <th className="px-4 py-3 font-medium">Pfad</th>
                <th className="px-4 py-3 font-medium">Quelle</th>
                <th className="px-4 py-3 font-medium text-right">Views</th>
                <th className="px-4 py-3 font-medium text-right">Dauer</th>
                <th className="px-4 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    Keine Sessions im Zeitraum.
                  </td>
                </tr>
              )}
              {filtered.map((s) => (
                <tr
                  key={s.sessionId}
                  className="border-t border-border hover:bg-muted/40 cursor-pointer align-middle"
                  onClick={() => setParams({ session: s.sessionId })}
                >
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs text-primary">{s.sessionId.slice(0, 8)}</div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(s.start).toLocaleString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-[280px]">
                    <div className="truncate font-medium">{cleanPath(s.entryPage)}</div>
                    {cleanPath(s.exitPage) !== cleanPath(s.entryPage) && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                        <ArrowRight className="h-3 w-3 shrink-0" />
                        {cleanPath(s.exitPage)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-[160px]">
                    <div className="truncate">{sourceLabel(s)}</div>
                    <div className="text-xs text-muted-foreground capitalize">{s.device || "—"}</div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{s.pageviews}</td>
                  <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">
                    {formatDuration(s.durationMs || null)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {s.purchased ? (
                      <Badge>Kauf {s.revenueCents ? euro(s.revenueCents) : ""}</Badge>
                    ) : s.checkout ? (
                      <Badge variant="secondary">Checkout</Badge>
                    ) : s.addedToCart ? (
                      <Badge variant="outline">Warenkorb</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminJourneys;
