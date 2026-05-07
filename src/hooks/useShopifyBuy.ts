import { useState } from "react";
import { toast } from "sonner";
import {
  SHOPIFY_VARIANT_BY_SLUG,
  shopifyCreateCart,
  shopifyAddToCart,
} from "@/lib/shopify";

const STORAGE_KEY = "shopify-cart-id";

export function useShopifyBuy() {
  const [loading, setLoading] = useState(false);

  const buyNow = async (slug: string) => {
    const variantId = SHOPIFY_VARIANT_BY_SLUG[slug];
    if (!variantId) {
      toast.error("Produkt aktuell nicht im Shop verfügbar.");
      return;
    }
    setLoading(true);
    try {
      const existingId = localStorage.getItem(STORAGE_KEY);
      let result: { cartId: string; checkoutUrl: string } | null = null;

      if (existingId) {
        result = await shopifyAddToCart(existingId, variantId, 1);
      }
      if (!result) {
        result = await shopifyCreateCart(variantId, 1);
      }
      localStorage.setItem(STORAGE_KEY, result.cartId);
      window.open(result.checkoutUrl, "_blank");
    } catch (err) {
      console.error(err);
      toast.error("Checkout konnte nicht geöffnet werden. Bitte später erneut versuchen.");
    } finally {
      setLoading(false);
    }
  };

  return { buyNow, loading };
}
