import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminApi, euro, nf } from "@/lib/adminApi";
import { RefreshCw, Radio } from "lucide-react";

type LiveSession = {
  sessionId: string;
  lastSeen: string;
  firstSeen: string;
  currentPage: string;
  device: string;
  browser: string;
  referrer: string;
  utmSource: string;
  events: number;
  pageviews: number;
  addedToCart: number;
  purchased: boolean;
  revenueCents: number;
};

type LiveData = {
  now: string;
  windowMinutes: number;
  activeNow: number;
  sessions: LiveSession[];
  feed: {
    sessionId: string;
    eventType: string;
    pageId: string;
    title: string | null;
    device: string;
    valueCents: number | null;
    createdAt: string;
  }[];
};

const ago = (iso: string, nowIso: string) => {
  const s = Math.max(0, Math.round((new Date(nowIso).getTime() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `vor ${s}s`;
  if (s < 3600) return `vor ${Math.floor(s / 60)}m`;
  return `vor ${Math.floor(s / 3600)}h`;
};

const AdminLive = () => {
  const [data, setData] = useState<LiveData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      setData(await adminApi<LiveData>({ view: "live", minutes: "30" }));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 10000);
    return () => window.clearInterval(id);
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Radio className="h-5 w-5 text-primary animate-pulse" /> Live
          </h1>
          <p className="text-sm text-muted-foreground">Aktualisiert automatisch alle 10 Sekunden</p>
        </div>
        <Button size="sm" variant="outline" onClick={load}>
          <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {error && <Card className="p-4 border-destructive text-destructive">{error}</Card>}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <div className="text-sm text-muted-foreground">Aktiv jetzt (5 Min)</div>
              <div className="text-4xl font-semibold mt-1 text-primary">{nf.format(data.activeNow)}</div>
            </Card>
            <Card className="p-5">
              <div className="text-sm text-muted-foreground">Sessions ({data.windowMinutes} Min)</div>
              <div className="text-4xl font-semibold mt-1">{nf.format(data.sessions.length)}</div>
            </Card>
            <Card className="p-5">
              <div className="text-sm text-muted-foreground">Warenkorb-Aktionen</div>
              <div className="text-4xl font-semibold mt-1">
                {nf.format(data.sessions.reduce((s, x) => s + x.addedToCart, 0))}
              </div>
            </Card>
          </div>

          <Card className="p-4">
            <div className="mb-3 font-medium">Aktive Besucher</div>
            <div className="overflow-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-1">Session</th>
                    <th className="py-1">Aktuelle Seite</th>
                    <th className="py-1">Gerät</th>
                    <th className="py-1">Quelle</th>
                    <th className="py-1 text-right">Views</th>
                    <th className="py-1 text-right">Cart</th>
                    <th className="py-1 text-right">Zuletzt</th>
                  </tr>
                </thead>
                <tbody>
                  {data.sessions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-4 text-muted-foreground">
                        Gerade niemand online.
                      </td>
                    </tr>
                  )}
                  {data.sessions.map((s) => (
                    <tr key={s.sessionId} className="border-t border-border">
                      <td className="py-1">
                        <Link className="font-mono text-xs text-primary hover:underline" to={`/admin/journeys?session=${s.sessionId}`}>
                          {s.sessionId.slice(0, 8)}
                        </Link>
                        {s.purchased && (
                          <Badge className="ml-2">{s.revenueCents ? euro(s.revenueCents) : "Kauf"}</Badge>
                        )}
                      </td>
                      <td className="py-1 truncate max-w-[220px]">{s.currentPage}</td>
                      <td className="py-1">{s.device}</td>
                      <td className="py-1 truncate max-w-[160px]">{s.utmSource || s.referrer || "direkt"}</td>
                      <td className="py-1 text-right">{s.pageviews}</td>
                      <td className="py-1 text-right">{s.addedToCart}</td>
                      <td className="py-1 text-right whitespace-nowrap">{ago(s.lastSeen, data.now)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-4">
            <div className="mb-3 font-medium">Event-Stream</div>
            <ul className="text-sm space-y-1 max-h-96 overflow-auto">
              {data.feed.map((e, i) => (
                <li key={`${e.sessionId}-${e.createdAt}-${i}`} className="flex flex-wrap items-center gap-2 border-t border-border py-1">
                  <span className="font-mono text-xs text-muted-foreground">{ago(e.createdAt, data.now)}</span>
                  <Badge variant="secondary">{e.eventType}</Badge>
                  <span className="truncate max-w-[280px]">{e.title || e.pageId}</span>
                  {e.valueCents ? <span className="text-primary">{euro(e.valueCents)}</span> : null}
                  <Link className="font-mono text-xs text-primary hover:underline ml-auto" to={`/admin/journeys?session=${e.sessionId}`}>
                    {e.sessionId.slice(0, 8)}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminLive;
