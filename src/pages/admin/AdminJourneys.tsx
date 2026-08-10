import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { adminApi, euro, nf, RANGE_PRESETS, rangeToIso, formatDuration } from "@/lib/adminApi";
import { RefreshCw, ArrowLeft } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Customer Journeys</h1>
          <p className="text-sm text-muted-foreground">{nf.format(filtered.length)} Sessions</p>
        </div>
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

      <div className="flex flex-wrap gap-2 items-center">
        {FILTERS.map((f) => (
          <Button key={f.id} size="sm" variant={f.id === filter ? "default" : "outline"} onClick={() => setFilter(f.id)}>
            {f.label}
          </Button>
        ))}
        <Input
          className="w-full sm:w-64"
          placeholder="Suche Seite, Quelle, Session…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <Card className="p-4 border-destructive text-destructive">{error}</Card>}

      <Card className="p-4 overflow-auto">
        <table className="w-full text-sm min-w-[840px]">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="py-1">Session</th>
              <th className="py-1">Start</th>
              <th className="py-1">Einstieg</th>
              <th className="py-1">Ausstieg</th>
              <th className="py-1">Gerät</th>
              <th className="py-1">Quelle</th>
              <th className="py-1 text-right">Views</th>
              <th className="py-1 text-right">Dauer</th>
              <th className="py-1">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="py-4 text-muted-foreground">
                  Keine Sessions im Zeitraum.
                </td>
              </tr>
            )}
            {filtered.map((s) => (
              <tr
                key={s.sessionId}
                className="border-t border-border hover:bg-muted/40 cursor-pointer"
                onClick={() => setParams({ session: s.sessionId })}
              >
                <td className="py-1 font-mono text-xs text-primary">{s.sessionId.slice(0, 8)}</td>
                <td className="py-1 whitespace-nowrap">{new Date(s.start).toLocaleString("de-DE")}</td>
                <td className="py-1 truncate max-w-[160px]">{s.entryPage}</td>
                <td className="py-1 truncate max-w-[160px]">{s.exitPage}</td>
                <td className="py-1">{s.device}</td>
                <td className="py-1 truncate max-w-[140px]">{s.utmSource || s.referrer || "direkt"}</td>
                <td className="py-1 text-right">{s.pageviews}</td>
                <td className="py-1 text-right whitespace-nowrap">{formatDuration(s.durationMs || null)}</td>
                <td className="py-1">
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
      </Card>
    </div>
  );
};

export default AdminJourneys;
