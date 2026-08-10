import { useQuery } from "@tanstack/react-query";
import { fetchCatalog } from "@/lib/catalog";
import { products as STATIC_PRODUCTS, type ProductData } from "@/data/products";

/** Products from the database (admin-editable) with static fallback. */
export function useCatalog(): { products: ProductData[]; isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: ["catalog"],
    queryFn: fetchCatalog,
    staleTime: 5 * 60 * 1000,
  });
  return { products: data ?? STATIC_PRODUCTS, isLoading };
}
