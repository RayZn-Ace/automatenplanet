import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { grossPrice, grossPriceValue } from "@/lib/pricing";
import {
  summarize,
  validateFeed,
  SITE,
  type FeedEntry,
  type ValidationInputProduct,
  type ValidationInputVariant,
} from "@/lib/feedValidation";
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Barcode,
  ExternalLink,
  Search,
  Eye,
} from "lucide-react";

const FEED_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/product-feed`;

type Filter = "all" | "errors" | "warnings" | "gtin";

interface LiveFeedState {
  status: "idle" | "loading" | "ok" | "error";
  items: number;
  message: string;
  fetchedAt: string;
}

const euroFmt = (value: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);

const imageSrc = (image: string) => (/^https?:\/\//i.test(image) ? image : `${SITE}${image}`);

/** So sieht der XML-Block aus, den Google für dieses Angebot einliest. */
const itemXml = (entry: FeedEntry) =>
  [
    "<item>",
    `  <g:id>${entry.id}</g:id>`,
    `  <g:item_group_id>${entry.groupId}</g:item_group_id>`,
    `  <title>${entry.title}</title>`,
    `  <link>${entry.link}</link>`,
    `  <g:image_link>${imageSrc(entry.image)}</g:image_link>`,
    `  <g:price>${grossPriceValue(entry.priceNet)} EUR</g:price>`,
    `  <g:availability>${entry.isActive ? "in_stock" : "out_of_stock"}</g:availability>`,
    `  <g:condition>new</g:condition>`,
    `  <g:brand>AutomatPlanet</g:brand>`,
    entry.gtinStatus === "valid" ? `  <g:gtin>${entry.gtin}</g:gtin>` : null,
    entry.mpn ? `  <g:mpn>${entry.mpn}</g:mpn>` : null,
    !entry.identifierExists ? "  <g:identifier_exists>no</g:identifier_exists>" : null,
    "</item>",
  ]
    .filter(Boolean)
    .join("\n");


const AdminFeed = () => {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [live, setLive] = useState<LiveFeedState>({ status: "idle", items: 0, message: "", fetchedAt: "" });

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: products, error: pErr }, { data: variants, error: vErr }] = await Promise.all([
      supabase
        .from("products")
        .select(
          "id, slug, name, description, price_net_cents, image, dimensions, power, category, gtin, mpn, is_active",
        )
        .order("sort_order", { ascending: true }),
      supabase
        .from("product_variants")
        .select("id, product_id, variant_id, label, description, price_net_cents, gtin, mpn, is_active, sort_order"),
    ]);
    setLoading(false);
    if (pErr || vErr) {
      toast.error(pErr?.message ?? vErr?.message ?? "Fehler beim Laden.");
      return;
    }
    setEntries(
      validateFeed(
        (products ?? []) as ValidationInputProduct[],
        (variants ?? []) as ValidationInputVariant[],
      ),
    );
  }, []);

  const checkLiveFeed = useCallback(async () => {
    setLive({ status: "loading", items: 0, message: "", fetchedAt: "" });
    try {
      // Ohne Zusatz-Header: so bleibt es ein einfacher GET ohne CORS-Preflight.
      const res = await fetch(FEED_URL);
      const xml = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (!xml.includes("<rss")) throw new Error("Antwort ist kein RSS-Feed.");
      setLive({
        status: "ok",
        items: (xml.match(/<item>/g) ?? []).length,
        message: "",
        fetchedAt: new Date().toLocaleTimeString("de-DE"),
      });
    } catch (error) {
      setLive({
        status: "error",
        items: 0,
        message: error instanceof Error ? error.message : "Abruf fehlgeschlagen",
        fetchedAt: new Date().toLocaleTimeString("de-DE"),
      });
    }
  }, []);

  useEffect(() => {
    load();
    checkLiveFeed();
  }, [load, checkLiveFeed]);

  const summary = useMemo(() => summarize(entries), [entries]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (filter === "errors" && !e.issues.some((i) => i.level === "error")) return false;
      if (filter === "warnings" && !e.issues.some((i) => i.level === "warning")) return false;
      if (filter === "gtin" && e.gtinStatus === "valid") return false;
      if (!q) return true;
      return `${e.title} ${e.id} ${e.gtin} ${e.mpn}`.toLowerCase().includes(q);
    });
  }, [entries, filter, query]);

  const mismatch = live.status === "ok" && live.items !== summary.inFeed;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Feed-Validierung</h1>
          <p className="text-sm text-muted-foreground">
            Google Merchant Center · {summary.total} Angebote geprüft
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => { load(); checkLiveFeed(); }} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Neu prüfen
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href={FEED_URL} target="_blank" rel="noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" /> Feed öffnen
            </a>
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Im Feed enthalten</div>
          <div className="text-2xl font-semibold">{summary.inFeed}</div>
          <div className="text-xs text-muted-foreground">von {summary.total} Angeboten</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Fehler</div>
          <div className={`text-2xl font-semibold ${summary.withErrors ? "text-destructive" : ""}`}>
            {summary.withErrors}
          </div>
          <div className="text-xs text-muted-foreground">{summary.withWarnings} nur mit Warnungen</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">GTIN/EAN gültig</div>
          <div className="text-2xl font-semibold">{summary.gtinValid}</div>
          <div className="text-xs text-muted-foreground">
            {summary.gtinMissing} fehlen · {summary.gtinInvalid} ungültig
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Live-Feed</div>
          <div className="text-2xl font-semibold">
            {live.status === "loading" ? "…" : live.status === "ok" ? live.items : "Fehler"}
          </div>
          <div className="text-xs text-muted-foreground">
            {live.status === "ok"
              ? `Angebote · ${live.fetchedAt}`
              : live.status === "error"
                ? live.message
                : "wird geprüft"}
          </div>
        </Card>
      </div>

      {mismatch && (
        <Card className="p-4 border-amber-500/40 bg-amber-500/5 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-500 shrink-0" />
          <p className="text-sm">
            Der Live-Feed enthält {live.items} Angebote, erwartet werden {summary.inFeed}. Meist liegt das an
            Angeboten ohne Bild – die filtert der Feed heraus.
          </p>
        </Card>
      )}

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2">
        {([
          ["all", `Alle (${summary.total})`],
          ["errors", `Fehler (${summary.withErrors})`],
          ["warnings", "Warnungen"],
          ["gtin", `Ohne gültige GTIN (${summary.gtinMissing + summary.gtinInvalid})`],
        ] as [Filter, string][]).map(([key, label]) => (
          <Button
            key={key}
            size="sm"
            variant={filter === key ? "default" : "outline"}
            onClick={() => setFilter(key)}
          >
            {label}
          </Button>
        ))}
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Suchen (Titel, ID, GTIN)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {visible.length === 0 && (
          <Card className="p-6 text-sm text-muted-foreground text-center">
            {loading ? "Lade…" : "Keine Angebote in dieser Auswahl."}
          </Card>
        )}
        {visible.map((entry) => {
          const errors = entry.issues.filter((i) => i.level === "error");
          const warnings = entry.issues.filter((i) => i.level === "warning");
          return (
            <Card key={entry.id} className="p-4 space-y-3">
              <div className="flex flex-wrap items-start gap-3">
                {errors.length > 0 ? (
                  <XCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                ) : warnings.length > 0 ? (
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="font-medium truncate">{entry.title}</div>
                  <div className="text-xs text-muted-foreground font-mono break-all">
                    {entry.id}
                    {entry.isVariant ? ` · Gruppe: ${entry.groupId}` : ""}
                  </div>
                </div>
                <div className="ml-auto flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{euroFmt(entry.priceNet)} netto</span>
                  <span className="text-primary font-medium">{euroFmt(grossPrice(entry.priceNet))} brutto</span>
                  <Badge
                    variant="outline"
                    className={
                      entry.gtinStatus === "valid"
                        ? "border-emerald-500/50 text-emerald-500"
                        : entry.gtinStatus === "invalid"
                          ? "border-destructive/50 text-destructive"
                          : "text-muted-foreground"
                    }
                  >
                    <Barcode className="w-3 h-3 mr-1" />
                    {entry.gtinStatus === "valid"
                      ? entry.gtin
                      : entry.gtinStatus === "invalid"
                        ? `ungültig: ${entry.gtin}`
                        : "keine GTIN"}
                  </Badge>
                  {entry.mpn && <Badge variant="outline">MPN {entry.mpn}</Badge>}
                  {!entry.isActive && <Badge variant="outline">inaktiv</Badge>}
                </div>
              </div>

              {entry.issues.length > 0 && (
                <ul className="space-y-1.5 text-sm border-t border-border pt-3">
                  {[...errors, ...warnings].map((issue, i) => (
                    <li key={`${issue.field}-${i}`} className="flex items-start gap-2">
                      <Badge
                        variant="outline"
                        className={`shrink-0 font-mono text-[10px] ${
                          issue.level === "error" ? "border-destructive/50 text-destructive" : "text-amber-500 border-amber-500/50"
                        }`}
                      >
                        {issue.field}
                      </Badge>
                      <span className={issue.level === "error" ? "" : "text-muted-foreground"}>{issue.message}</span>
                    </li>
                  ))}
                </ul>
              )}

              <a
                href={entry.link}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1 break-all"
              >
                <ExternalLink className="w-3 h-3 shrink-0" /> {entry.link}
              </a>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminFeed;
