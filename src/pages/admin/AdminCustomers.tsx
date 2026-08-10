import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { euro } from "@/lib/adminApi";
import { RefreshCw, Users, Download, Mail, Search } from "lucide-react";

type OrderRow = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company: string;
  phone: string;
  street: string;
  postal_code: string;
  city: string;
  country: string;
  status: string;
  total_gross_cents: number;
  created_at: string;
};

type Customer = {
  email: string;
  name: string;
  company: string;
  phone: string;
  address: string;
  country: string;
  orders: number;
  paidOrders: number;
  revenueGrossCents: number;
  firstSeen: string;
  lastSeen: string;
};

type Filter = "all" | "customers" | "leads";

const PAID = new Set(["paid", "shipped"]);

const dateFmt = (iso: string) =>
  new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

/** Fasst alle Bestellungen/Checkouts pro E-Mail zu einem Kundendatensatz zusammen. */
const buildCustomers = (rows: OrderRow[]): Customer[] => {
  const map = new Map<string, Customer>();
  for (const row of rows) {
    const email = (row.email ?? "").trim().toLowerCase();
    if (!email) continue;
    const existing = map.get(email);
    const name = [row.first_name, row.last_name].filter(Boolean).join(" ").trim();
    const address = [row.street, [row.postal_code, row.city].filter(Boolean).join(" ")]
      .filter(Boolean)
      .join(", ");
    const isPaid = PAID.has(row.status);
    if (!existing) {
      map.set(email, {
        email,
        name,
        company: row.company ?? "",
        phone: row.phone ?? "",
        address,
        country: row.country ?? "",
        orders: 1,
        paidOrders: isPaid ? 1 : 0,
        revenueGrossCents: isPaid ? row.total_gross_cents : 0,
        firstSeen: row.created_at,
        lastSeen: row.created_at,
      });
      continue;
    }
    existing.orders += 1;
    if (isPaid) {
      existing.paidOrders += 1;
      existing.revenueGrossCents += row.total_gross_cents;
    }
    // Neueste vorhandene Kontaktdaten gewinnen.
    if (row.created_at > existing.lastSeen) {
      existing.lastSeen = row.created_at;
      existing.name = name || existing.name;
      existing.company = row.company || existing.company;
      existing.phone = row.phone || existing.phone;
      existing.address = address || existing.address;
      existing.country = row.country || existing.country;
    }
    if (row.created_at < existing.firstSeen) existing.firstSeen = row.created_at;
  }
  return [...map.values()].sort((a, b) => (a.lastSeen < b.lastSeen ? 1 : -1));
};

const csvEscape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, email, first_name, last_name, company, phone, street, postal_code, city, country, status, total_gross_cents, created_at",
      )
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setCustomers(buildCustomers((data ?? []) as OrderRow[]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers.filter((c) => {
      if (filter === "customers" && c.paidOrders === 0) return false;
      if (filter === "leads" && c.paidOrders > 0) return false;
      if (!q) return true;
      return [c.email, c.name, c.company, c.address, c.phone]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [customers, filter, query]);

  const kpis = useMemo(() => {
    const buyers = customers.filter((c) => c.paidOrders > 0);
    const revenue = buyers.reduce((sum, c) => sum + c.revenueGrossCents, 0);
    return {
      total: customers.length,
      buyers: buyers.length,
      leads: customers.length - buyers.length,
      revenue,
      avg: buyers.length ? Math.round(revenue / buyers.length) : 0,
    };
  }, [customers]);

  const exportCsv = (rows: Customer[], filename: string, newsletterOnly = false) => {
    if (rows.length === 0) {
      toast.error("Keine Datensätze zum Export.");
      return;
    }
    const header = newsletterOnly
      ? ["email", "vorname_nachname", "firma", "quelle", "angemeldet_am"]
      : [
          "email",
          "name",
          "firma",
          "telefon",
          "adresse",
          "land",
          "bestellungen",
          "bezahlt",
          "umsatz_brutto_eur",
          "erster_kontakt",
          "letzter_kontakt",
        ];
    const lines = rows.map((c) =>
      (newsletterOnly
        ? [c.email, c.name, c.company, c.paidOrders > 0 ? "Kauf" : "Checkout", dateFmt(c.firstSeen)]
        : [
            c.email,
            c.name,
            c.company,
            c.phone,
            c.address,
            c.country,
            c.orders,
            c.paidOrders,
            (c.revenueGrossCents / 100).toFixed(2).replace(".", ","),
            dateFmt(c.firstSeen),
            dateFmt(c.lastSeen),
          ]
      )
        .map(csvEscape)
        .join(";"),
    );
    const csv = `\uFEFF${header.join(";")}\n${lines.join("\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${rows.length} Datensätze exportiert.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Kunden & Newsletter</h1>
          <p className="text-sm text-muted-foreground">
            Jeder Kauf und jeder ausgefüllte Checkout landet automatisch im Newsletter-Verteiler.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Neu laden
          </Button>
          <Button size="sm" variant="outline" onClick={() => exportCsv(visible, "kunden.csv")}>
            <Download className="w-4 h-4 mr-2" /> Kunden-CSV
          </Button>
          <Button
            size="sm"
            onClick={() => exportCsv(customers, "newsletter-verteiler.csv", true)}
          >
            <Mail className="w-4 h-4 mr-2" /> Newsletter-CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Kontakte gesamt", value: String(kpis.total) },
          { label: "Käufer", value: String(kpis.buyers) },
          { label: "Leads (ohne Kauf)", value: String(kpis.leads) },
          { label: "Umsatz brutto", value: euro(kpis.revenue) },
          { label: "Ø pro Käufer", value: euro(kpis.avg) },
        ].map((kpi) => (
          <Card key={kpi.label} className="p-4">
            <div className="text-xs text-muted-foreground">{kpi.label}</div>
            <div className="text-xl font-semibold">{kpi.value}</div>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {([
          ["all", `Alle (${kpis.total})`],
          ["customers", `Käufer (${kpis.buyers})`],
          ["leads", `Leads (${kpis.leads})`],
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
          <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="E-Mail, Name, Firma…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kontakt</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead className="text-center w-28">Bestellungen</TableHead>
              <TableHead className="text-right w-32">Umsatz</TableHead>
              <TableHead className="w-28">Newsletter</TableHead>
              <TableHead className="w-28">Letzter Kontakt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-10">
                  {loading ? "Lade…" : "Keine Kontakte gefunden."}
                </TableCell>
              </TableRow>
            )}
            {visible.map((c) => (
              <TableRow key={c.email}>
                <TableCell>
                  <div className="font-medium">{c.name || "—"}</div>
                  <a href={`mailto:${c.email}`} className="text-xs text-primary hover:underline break-all">
                    {c.email}
                  </a>
                  {c.company && <div className="text-xs text-muted-foreground">{c.company}</div>}
                  {c.phone && <div className="text-xs text-muted-foreground">{c.phone}</div>}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {c.address || "—"}
                  {c.country && <div>{c.country}</div>}
                </TableCell>
                <TableCell className="text-center">
                  <div className="text-sm font-medium">{c.paidOrders}</div>
                  {c.orders > c.paidOrders && (
                    <div className="text-xs text-muted-foreground">{c.orders - c.paidOrders} offen</div>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium">{euro(c.revenueGrossCents)}</TableCell>
                <TableCell>
                  <Badge variant={c.paidOrders > 0 ? "default" : "secondary"}>
                    {c.paidOrders > 0 ? "Kauf" : "Checkout"}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{dateFmt(c.lastSeen)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <p className="text-xs text-muted-foreground flex items-center gap-2">
        <Users className="w-3.5 h-3.5" /> Verteiler-Grundlage: alle Bestell- und Checkout-Daten. Für den
        Versand die Newsletter-CSV exportieren oder Empfänger direkt im Postfach anschreiben.
      </p>
    </div>
  );
};

export default AdminCustomers;
