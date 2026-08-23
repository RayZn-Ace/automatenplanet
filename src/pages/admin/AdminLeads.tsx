import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RefreshCw, FileText, Mail, Phone, Trash2 } from "lucide-react";

type Lead = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  product_slug: string;
  product_name: string;
  quantity: number;
  page_path: string;
  referrer: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  gclid: string;
  fbclid: string;
  status: string;
  admin_note: string;
  created_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  new: "Neu",
  contacted: "Kontaktiert",
  quoted: "Angebot raus",
  won: "Gewonnen",
  lost: "Verloren",
};

const STATUS_ORDER = ["new", "contacted", "quoted", "won", "lost"];
const FILTERS = ["alle", ...STATUS_ORDER];

const badgeClass = (status: string) => {
  if (status === "won") return "bg-emerald-500/15 text-emerald-500 border-emerald-500/30";
  if (status === "lost") return "bg-muted text-muted-foreground";
  if (status === "new") return "bg-primary/15 text-primary border-primary/30";
  return "bg-amber-500/15 text-amber-500 border-amber-500/30";
};

const AdminLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("alle");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    setLoading(false);
    if (error) {
      toast.error("Keine Berechtigung oder Fehler beim Laden.");
      return;
    }
    setLeads((data ?? []) as Lead[]);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) {
      toast.error("Status konnte nicht geändert werden.");
      return;
    }
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) {
      toast.error("Anfrage konnte nicht gelöscht werden.");
      return;
    }
    setLeads((prev) => prev.filter((l) => l.id !== id));
    toast.success("Anfrage gelöscht.");
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (filter !== "alle" && l.status !== filter) return false;
      if (!q) return true;
      return [l.name, l.company, l.email, l.phone, l.product_name, l.utm_campaign]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [leads, filter, search]);

  const kpis = useMemo(
    () => ({
      total: leads.length,
      neu: leads.filter((l) => l.status === "new").length,
      offen: leads.filter((l) => l.status === "contacted" || l.status === "quoted").length,
      gewonnen: leads.filter((l) => l.status === "won").length,
    }),
    [leads]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Anfragen
          </h1>
          <p className="text-sm text-muted-foreground">Angebotsanfragen aus Produktseiten und Landingpage</p>
        </div>
        <Button variant="outline" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Aktualisieren
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ["Gesamt", kpis.total],
          ["Neu", kpis.neu],
          ["In Bearbeitung", kpis.offen],
          ["Gewonnen", kpis.gewonnen],
        ].map(([label, value]) => (
          <Card key={String(label)} className="p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
          >
            {f === "alle" ? "Alle" : STATUS_LABEL[f]}
          </Button>
        ))}
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Suche: Name, Firma, E-Mail, Produkt..."
          className="w-full sm:w-72 ml-auto"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          {loading ? "Lade Anfragen..." : "Keine Anfragen gefunden."}
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((l) => (
            <Card key={l.id} className="p-4 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{l.company || l.name}</span>
                    <Badge variant="outline" className={badgeClass(l.status)}>
                      {STATUS_LABEL[l.status] ?? l.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {l.company ? `${l.name} · ` : ""}
                    {new Date(l.created_at).toLocaleString("de-DE")}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium">{l.product_name || l.product_slug || "-"}</p>
                  {l.utm_campaign || l.utm_source ? (
                    <p className="text-xs text-muted-foreground">
                      {[l.utm_source, l.utm_medium, l.utm_campaign].filter(Boolean).join(" / ")}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <a href={`mailto:${l.email}`} className="inline-flex items-center gap-1.5 text-primary hover:underline">
                  <Mail className="w-4 h-4" /> {l.email}
                </a>
                <a
                  href={`tel:${l.phone.replace(/[^+\d]/g, "")}`}
                  className="inline-flex items-center gap-1.5 text-primary hover:underline"
                >
                  <Phone className="w-4 h-4" /> {l.phone}
                </a>
                {l.page_path ? <span className="text-muted-foreground">{l.page_path}</span> : null}
              </div>

              {l.message ? (
                <p className="text-sm bg-muted/40 rounded-md p-3 whitespace-pre-wrap">{l.message}</p>
              ) : null}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {STATUS_ORDER.map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={l.status === s ? "default" : "outline"}
                    onClick={() => void setStatus(l.id, s)}
                  >
                    {STATUS_LABEL[s]}
                  </Button>
                ))}
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-auto text-destructive"
                  onClick={() => void remove(l.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminLeads;
