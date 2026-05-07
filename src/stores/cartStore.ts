import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";
import {
  SHOPIFY_VARIANT_BY_SLUG,
  shopifyCreateCart,
  shopifyAddToCart,
  shopifyUpdateLine,
  shopifyRemoveLine,
  shopifyFetchCart,
} from "@/lib/shopify";
import { products as ALL_PRODUCTS, type Product } from "@/data/products";

export interface CartItem {
  lineId: string | null;
  slug: string;
  variantId: string;
  name: string;
  image: string;
  price: number; // EUR
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  cartId: string | null;
  checkoutUrl: string | null;
  isOpen: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  openCart: () => void;
  closeCart: () => void;
  addBySlug: (slug: string, quantity?: number) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
  clearCart: () => void;
  syncCart: () => Promise<void>;
}

function findProductBySlug(slug: string): Product | undefined {
  return ALL_PRODUCTS.find((p) => p.slug === slug);
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      checkoutUrl: null,
      isOpen: false,
      isLoading: false,
      isSyncing: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addBySlug: async (slug, quantity = 1) => {
        const variantId = SHOPIFY_VARIANT_BY_SLUG[slug];
        const product = findProductBySlug(slug);
        if (!variantId || !product) {
          toast.error("Produkt aktuell nicht im Shop verfügbar.");
          return;
        }
        set({ isLoading: true });
        try {
          const { items, cartId } = get();
          const existing = items.find((i) => i.variantId === variantId);

          if (cartId && existing?.lineId) {
            const newQty = existing.quantity + quantity;
            const result = await shopifyUpdateLine(cartId, existing.lineId, newQty);
            if (result) {
              set({
                cartId: result.cartId,
                checkoutUrl: result.checkoutUrl,
                items: get().items.map((i) =>
                  i.variantId === variantId ? { ...i, quantity: newQty } : i
                ),
              });
            } else {
              get().clearCart();
              return get().addBySlug(slug, quantity);
            }
          } else if (cartId) {
            const result = await shopifyAddToCart(cartId, variantId, quantity);
            if (result) {
              const newLine = result.lines.find((l) => l.variantId === variantId);
              set({
                cartId: result.cartId,
                checkoutUrl: result.checkoutUrl,
                items: [
                  ...get().items,
                  {
                    lineId: newLine?.lineId ?? null,
                    slug,
                    variantId,
                    name: product.name,
                    image: product.image,
                    price: product.price,
                    quantity,
                  },
                ],
              });
            } else {
              get().clearCart();
              return get().addBySlug(slug, quantity);
            }
          } else {
            const result = await shopifyCreateCart(variantId, quantity);
            const newLine = result.lines.find((l) => l.variantId === variantId);
            set({
              cartId: result.cartId,
              checkoutUrl: result.checkoutUrl,
              items: [
                {
                  lineId: newLine?.lineId ?? null,
                  slug,
                  variantId,
                  name: product.name,
                  image: product.image,
                  price: product.price,
                  quantity,
                },
              ],
            });
          }
          toast.success(`${product.name} wurde zum Warenkorb hinzugefügt.`, {
            position: "top-center",
            action: {
              label: "Anzeigen",
              onClick: () => set({ isOpen: true }),
            },
          });
        } catch (err) {
          console.error(err);
          toast.error("Konnte nicht zum Warenkorb hinzugefügt werden.");
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) return get().removeItem(variantId);
        const { items, cartId } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!item?.lineId || !cartId) return;
        set({ isLoading: true });
        try {
          const result = await shopifyUpdateLine(cartId, item.lineId, quantity);
          if (result) {
            set({
              cartId: result.cartId,
              checkoutUrl: result.checkoutUrl,
              items: get().items.map((i) =>
                i.variantId === variantId ? { ...i, quantity } : i
              ),
            });
          } else {
            get().clearCart();
          }
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (variantId) => {
        const { items, cartId } = get();
        const item = items.find((i) => i.variantId === variantId);
        if (!item?.lineId || !cartId) {
          set({ items: items.filter((i) => i.variantId !== variantId) });
          return;
        }
        set({ isLoading: true });
        try {
          const result = await shopifyRemoveLine(cartId, item.lineId);
          if (result) {
            const newItems = get().items.filter((i) => i.variantId !== variantId);
            if (newItems.length === 0) {
              set({ items: [], cartId: null, checkoutUrl: null });
            } else {
              set({
                cartId: result.cartId,
                checkoutUrl: result.checkoutUrl,
                items: newItems,
              });
            }
          } else {
            get().clearCart();
          }
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: () => set({ items: [], cartId: null, checkoutUrl: null }),

      syncCart: async () => {
        const { cartId, isSyncing } = get();
        if (!cartId || isSyncing) return;
        set({ isSyncing: true });
        try {
          const result = await shopifyFetchCart(cartId);
          if (!result) return;
          if (result.lines.length === 0) {
            get().clearCart();
            return;
          }
          // Reconcile quantities/lineIds
          set({
            checkoutUrl: result.checkoutUrl,
            items: get().items
              .map((i) => {
                const line = result.lines.find((l) => l.variantId === i.variantId);
                return line ? { ...i, lineId: line.lineId, quantity: line.quantity } : null;
              })
              .filter((i): i is CartItem => i !== null),
          });
        } catch (err) {
          console.error("syncCart failed", err);
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: "ap-shopify-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        cartId: state.cartId,
        checkoutUrl: state.checkoutUrl,
      }),
    }
  )
);
