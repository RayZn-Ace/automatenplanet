import { useQuery } from "@tanstack/react-query";
import { fetchCatalog } from "@/lib/catalog";
import { products as STATIC_PRODUCTS, type ProductData } from "@/data/products";
import { spareParts as STATIC_SPARE_PARTS, isSparePart } from "@/data/spareParts";

const STATIC_ALL = [...STATIC_PRODUCTS, ...STATIC_SPARE_PARTS];

/**
 * Products from the database (admin-editable) with static fallback.
 * `products` = Automaten, `spareParts` = Ersatzteile, `all` = beides.
 */
export function useCatalog(): {
  products: ProductData[];
  spareParts: ProductData[];
  all: ProductData[];
  isLoading: boolean;
} {
  const { data, isLoading } = useQuery({
    queryKey: ["catalog"],
    queryFn: fetchCatalog,
    staleTime: 5 * 60 * 1000,
  });
  const all = data ?? STATIC_ALL;
  return {
    all,
    products: all.filter((p) => !isSparePart(p)),
    spareParts: all.filter((p) => isSparePart(p)),
    isLoading,
  };
}
