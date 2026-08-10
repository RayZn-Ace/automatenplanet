import { supabase } from "@/integrations/supabase/client";
import { products as STATIC_PRODUCTS, type ProductData } from "@/data/products";

export type DbProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_net_cents: number;
  image: string;
  dimensions: string;
  power: string;
  category: string;
  keywords: string[];
  meta_title: string;
  meta_description: string;
  gtin: string;
  mpn: string;
  is_active: boolean;
  sort_order: number;
};

export type DbVariantRow = {
  id: string;
  product_id: string;
  variant_id: string;
  label: string;
  description: string;
  price_net_cents: number;
  is_active: boolean;
  sort_order: number;
  gtin: string;
  mpn: string;
};

export function mapDbProduct(row: DbProductRow): ProductData {
  return {
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: Math.round(row.price_net_cents / 100),
    image: row.image,
    dimensions: row.dimensions || undefined,
    power: row.power || undefined,
    category: row.category,
    keywords: row.keywords ?? [],
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
  };
}

/**
 * Catalog source of truth: database products, with the static file as fallback
 * (offline/first-load safety, prerendering).
 */
export async function fetchCatalog(): Promise<ProductData[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, name, description, price_net_cents, image, dimensions, power, category, keywords, meta_title, meta_description, is_active, sort_order",
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) return STATIC_PRODUCTS;
  return (data as DbProductRow[]).map(mapDbProduct);
}
