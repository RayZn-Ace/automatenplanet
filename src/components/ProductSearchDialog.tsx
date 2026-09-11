import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useCatalog } from "@/hooks/useCatalog";
import { formatNet } from "@/lib/pricing";

interface ProductSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductSearchDialog = ({ open, onOpenChange }: ProductSearchDialogProps) => {
  const navigate = useNavigate();
  const { products } = useCatalog();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof products>();
    products.forEach((p) => {
      const list = map.get(p.category) ?? [];
      list.push(p);
      map.set(p.category, list);
    });
    return Array.from(map.entries());
  }, [products]);

  const select = (slug: string) => {
    onOpenChange(false);
    navigate(`/produkte/${slug}`);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Automaten suchen, z. B. Boxautomat, Greifautomat, Billard ..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>Kein Automat gefunden. Versuche einen anderen Begriff.</CommandEmpty>
        {groups.map(([category, items]) => (
          <CommandGroup key={category} heading={category}>
            {items.map((p) => (
              <CommandItem
                key={p.slug}
                value={`${p.name} ${p.category} ${(p.keywords ?? []).join(" ")}`}
                onSelect={() => select(p.slug)}
                className="gap-3"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  className="h-10 w-10 rounded bg-white/5 object-contain"
                />
                <span className="flex-1 truncate">{p.name}</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  ab {formatNet(p.price)} netto
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
};

export const ProductSearchTrigger = ({
  className = "",
  onClick,
}: {
  className?: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    aria-label="Automaten suchen"
    onClick={onClick}
    className={`inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors ${className}`}
  >
    <Search className="w-5 h-5" />
  </button>
);

export default ProductSearchDialog;
