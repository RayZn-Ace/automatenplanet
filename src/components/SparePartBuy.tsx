import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { useI18n } from "@/lib/i18n";
import type { ProductData } from "@/data/products";

/** Mengenwahl + "In den Warenkorb" fuer ein Ersatzteil (bestehender CartStore). */
const SparePartBuy = ({ part, compact = false }: { part: ProductData; compact?: boolean }) => {
  const [qty, setQty] = useState(1);
  const addBySlug = useCartStore((s) => s.addBySlug);
  const { lang } = useI18n();
  const unavailable = part.availability === "out_of_stock";

  return (
    <div className={`flex ${compact ? "flex-col" : "flex-col sm:flex-row"} gap-3`}>
      <div
        className="flex items-center justify-between rounded-md border border-border bg-card/40 h-11 sm:w-32 shrink-0"
        role="group"
        aria-label={lang === "de" ? `Menge für ${part.name}` : `Quantity for ${part.name}`}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-11 w-10"
          aria-label={lang === "de" ? "Menge verringern" : "Decrease quantity"}
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          disabled={qty <= 1}
        >
          <Minus className="w-4 h-4" />
        </Button>
        <span className="text-sm font-bold tabular-nums" aria-live="polite">{qty}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-11 w-10"
          aria-label={lang === "de" ? "Menge erhöhen" : "Increase quantity"}
          onClick={() => setQty((q) => Math.min(20, q + 1))}
          disabled={qty >= 20}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <Button
        className="flex-1 h-11 bg-primary hover:bg-primary/80 text-primary-foreground"
        disabled={unavailable}
        onClick={() => addBySlug(part.slug, qty, { price: part.price })}
      >
        <ShoppingCart className="mr-2 w-4 h-4" />
        {unavailable
          ? lang === "de" ? "Derzeit nicht verfügbar" : "Currently unavailable"
          : lang === "de" ? "In den Warenkorb" : "Add to cart"}
      </Button>
    </div>
  );
};

export default SparePartBuy;
