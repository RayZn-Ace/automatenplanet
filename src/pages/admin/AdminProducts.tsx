import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { euro } from "@/lib/adminApi";
import type { DbProductRow, DbVariantRow } from "@/lib/catalog";
import { grossPrice } from "@/lib/pricing";
import { RefreshCw, Plus, Trash2, Save, ChevronDown, ChevronRight } from "lucide-react";

type ProductWithVariants = DbProductRow & { product_variants: DbVariantRow[] };

const emptyProduct = (): Partial<DbProductRow> => ({
  slug: "",
  name: "",
  description: "",
  price_net_cents: 0,
  image: "",
  dimensions: "",
  power: "",
  category: "",
  keywords: [],
  meta_title: "",
  meta_description: "",
  is_active: true,
  sort_order: 999,
});

const AdminProducts = () => {
  const [rows, setRows] = useState<ProductWithVariants[]>([]);
  const [loading, setLoading] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, Partial<DbProductRow>>>({});
  const [newProduct, setNewProduct] = useState<Partial<DbProductRow> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*, product_variants(*)")
      .order("sort_order", { ascending: true });
    setLoading(false);
    if (error) {
      toast.error("Keine Berechtigung oder Fehler beim Laden.");
      return;
    }
    setRows((data ?? []) as unknown as ProductWithVariants[]);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const patch = (id: string, field: keyof DbProductRow, value: unknown) =>
    setDraft((d) => ({ ...d, [id]: { ...d[id], [field]: value } }));

  const save = async (row: ProductWithVariants) => {
    const changes = draft[row.id];
    if (!changes || Object.keys(changes).length === 0) {
      toast.info("Keine Änderungen.");
      return;
    }
    const { error } = await supabase.from("products").update(changes).eq("id", row.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Produkt gespeichert.");
    setDraft((d) => ({ ...d, [row.id]: {} }));
    load();
  };

  const toggleActive = async (row: ProductWithVariants, value: boolean) => {
    const { error } = await supabase.from("products").update({ is_active: value }).eq("id", row.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    load();
  };

  const remove = async (row: ProductWithVariants) => {
    if (!window.confirm(`„${row.name}“ wirklich löschen?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", row.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Produkt gelöscht.");
    load();
  };

  const createProduct = async () => {
    if (!newProduct?.slug || !newProduct?.name) {
      toast.error("Slug und Name sind Pflicht.");
      return;
    }
    const { error } = await supabase.from("products").insert(newProduct as DbProductRow);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Produkt angelegt.");
    setNewProduct(null);
    load();
  };

  const saveVariant = async (v: DbVariantRow, changes: Partial<DbVariantRow>) => {
    const { error } = await supabase.from("product_variants").update(changes).eq("id", v.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Variante gespeichert.");
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Produkte</h1>
          <p className="text-sm text-muted-foreground">{rows.length} Produkte · Preise netto</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Aktualisieren
          </Button>
          <Button size="sm" onClick={() => setNewProduct(emptyProduct())}>
            <Plus className="w-4 h-4 mr-2" /> Neu
          </Button>
        </div>
      </div>

      {newProduct && (
        <Card className="p-5 space-y-3">
          <div className="font-medium">Neues Produkt</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input
                value={newProduct.slug ?? ""}
                onChange={(e) => setNewProduct({ ...newProduct, slug: e.target.value })}
                placeholder="mein-automat"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={newProduct.name ?? ""} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Preis netto (€)</Label>
              <Input
                type="number"
                value={(newProduct.price_net_cents ?? 0) / 100}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price_net_cents: Math.round(Number(e.target.value) * 100) })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Bild-Pfad</Label>
              <Input
                value={newProduct.image ?? ""}
                onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                placeholder="/images/products/foo.png"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Kategorie</Label>
              <Input
                value={newProduct.category ?? ""}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Sortierung</Label>
              <Input
                type="number"
                value={newProduct.sort_order ?? 999}
                onChange={(e) => setNewProduct({ ...newProduct, sort_order: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Beschreibung</Label>
            <Textarea
              value={newProduct.description ?? ""}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={createProduct}>
              <Save className="w-4 h-4 mr-2" /> Anlegen
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setNewProduct(null)}>
              Abbrechen
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {rows.map((row) => {
          const d = { ...row, ...draft[row.id] } as DbProductRow;
          const open = openId === row.id;
          return (
            <Card key={row.id} className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  className="flex items-center gap-2 min-w-0 text-left"
                  onClick={() => setOpenId(open ? null : row.id)}
                >
                  {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  {row.image ? (
                    <img src={row.image} alt="" className="w-10 h-10 object-contain rounded bg-muted" />
                  ) : null}
                  <span className="min-w-0">
                    <span className="font-medium block truncate">{row.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{row.slug}</span>
                  </span>
                </button>
                <div className="ml-auto flex items-center gap-3 flex-wrap">
                  {row.product_variants?.length > 0 && (
                    <Badge variant="outline">{row.product_variants.length} Varianten</Badge>
                  )}
                  <span className="text-sm">
                    {euro(row.price_net_cents)} netto ·{" "}
                    <span className="text-primary font-medium">
                      {euro(Math.round(grossPrice(row.price_net_cents / 100) * 100))} brutto
                    </span>
                  </span>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Switch checked={row.is_active} onCheckedChange={(v) => toggleActive(row, v)} />
                    {row.is_active ? "Aktiv" : "Inaktiv"}
                  </label>
                </div>
              </div>

              {open && (
                <div className="mt-4 space-y-4 border-t border-border pt-4">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label>Name</Label>
                      <Input value={d.name} onChange={(e) => patch(row.id, "name", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Preis netto (€)</Label>
                      <Input
                        type="number"
                        value={d.price_net_cents / 100}
                        onChange={(e) => patch(row.id, "price_net_cents", Math.round(Number(e.target.value) * 100))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Kategorie</Label>
                      <Input value={d.category} onChange={(e) => patch(row.id, "category", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Bild-Pfad</Label>
                      <Input value={d.image} onChange={(e) => patch(row.id, "image", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Maße</Label>
                      <Input value={d.dimensions} onChange={(e) => patch(row.id, "dimensions", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Strom</Label>
                      <Input value={d.power} onChange={(e) => patch(row.id, "power", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Sortierung</Label>
                      <Input
                        type="number"
                        value={d.sort_order}
                        onChange={(e) => patch(row.id, "sort_order", Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>GTIN / EAN (Google Feed)</Label>
                      <Input
                        value={d.gtin ?? ""}
                        onChange={(e) => patch(row.id, "gtin", e.target.value)}
                        placeholder="z. B. 4012345678901"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>MPN / Artikelnummer</Label>
                      <Input
                        value={d.mpn ?? ""}
                        onChange={(e) => patch(row.id, "mpn", e.target.value)}
                        placeholder="Hersteller-Artikelnummer"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label>Keywords (Komma-getrennt)</Label>
                      <Input
                        value={(d.keywords ?? []).join(", ")}
                        onChange={(e) =>
                          patch(
                            row.id,
                            "keywords",
                            e.target.value.split(",").map((k) => k.trim()).filter(Boolean),
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Beschreibung</Label>
                    <Textarea
                      rows={3}
                      value={d.description}
                      onChange={(e) => patch(row.id, "description", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Meta-Titel</Label>
                      <Input value={d.meta_title} onChange={(e) => patch(row.id, "meta_title", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Meta-Beschreibung</Label>
                      <Textarea
                        rows={2}
                        value={d.meta_description}
                        onChange={(e) => patch(row.id, "meta_description", e.target.value)}
                      />
                    </div>
                  </div>

                  {row.product_variants?.length > 0 && (
                    <div className="space-y-2">
                      <div className="font-medium text-sm">Varianten</div>
                      {row.product_variants
                        .slice()
                        .sort((a, b) => a.sort_order - b.sort_order)
                        .map((v) => (
                          <VariantRow key={v.id} variant={v} onSave={saveVariant} />
                        ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button size="sm" onClick={() => save(row)}>
                      <Save className="w-4 h-4 mr-2" /> Speichern
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(row)}>
                      <Trash2 className="w-4 h-4 mr-2" /> Löschen
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

function VariantRow({
  variant,
  onSave,
}: {
  variant: DbVariantRow;
  onSave: (v: DbVariantRow, changes: Partial<DbVariantRow>) => void;
}) {
  const [label, setLabel] = useState(variant.label);
  const [price, setPrice] = useState(variant.price_net_cents / 100);
  const [active, setActive] = useState(variant.is_active);

  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_140px_auto_auto] items-end border border-border rounded-md p-3">
      <div className="space-y-1.5">
        <Label className="text-xs font-mono text-muted-foreground">{variant.variant_id}</Label>
        <Input value={label} onChange={(e) => setLabel(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Netto (€)</Label>
        <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
      </div>
      <label className="flex items-center gap-2 text-xs text-muted-foreground pb-2">
        <Switch checked={active} onCheckedChange={setActive} />
        {active ? "Aktiv" : "Inaktiv"}
      </label>
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          onSave(variant, { label, price_net_cents: Math.round(price * 100), is_active: active })
        }
      >
        <Save className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default AdminProducts;
