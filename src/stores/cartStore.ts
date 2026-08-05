import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";
import { products as ALL_PRODUCTS, type ProductData } from "@/data/products";
import { defaultVariantId } from "@/lib/variants";
import { trackEvent } from "@/lib/tracking";
import { track } from "@/lib/analytics";

export interface CartItem {
  slug: string;
  variantId: string;
  variantLabel: string;
  name: string;
  image: string;
  price: number; // EUR netto
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  addBySlug: (
    slug: string,
    quantity?: number,
    overrides?: { variantId?: string; price?: number; nameSuffix?: string }
  ) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  subtotalNet: () => number;
}

function findProductBySlug(slug: string): ProductData | undefined {
  return ALL_PRODUCTS.find((p) => p.slug === slug);
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoading: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addBySlug: (slug, quantity = 1, overrides) => {
        const product = findProductBySlug(slug);
        if (!product) {
          toast.error("Produkt aktuell nicht verfügbar.");
          return;
        }
        const variantId = overrides?.variantId ?? defaultVariantId(slug);
        const itemPrice = overrides?.price ?? product.price;
        const variantLabel = overrides?.nameSuffix ?? "";
        const itemName = variantLabel ? `${product.name} – ${variantLabel}` : product.name;

        const existing = get().items.find((i) => i.variantId === variantId);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.variantId === variantId ? { ...i, quantity: i.quantity + quantity } : i
            ),
          });
        } else {
          set({
            items: [
              ...get().items,
              {
                slug,
                variantId,
                variantLabel,
                name: itemName,
                image: product.image,
                price: itemPrice,
                quantity,
              },
            ],
          });
        }

        toast.success(`${itemName} wurde zum Warenkorb hinzugefügt.`, {
          position: "top-center",
          action: { label: "Anzeigen", onClick: () => set({ isOpen: true }) },
        });
        trackEvent("add_to_cart", {
          value: itemPrice * quantity,
          currency: "EUR",
          contentName: itemName,
          contentType: "product",
          items: [{ id: slug, name: itemName, quantity, price: itemPrice }],
        });
        track("add_to_cart", {
          question_id: slug,
          question_title: itemName,
          answer_option: String(quantity),
          value_cents: Math.round(itemPrice * quantity * 100),
          currency: "EUR",
        });
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) return get().removeItem(variantId);
        set({
          items: get().items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
        });
      },

      removeItem: (variantId) => {
        set({ items: get().items.filter((i) => i.variantId !== variantId) });
      },

      clearCart: () => set({ items: [] }),

      subtotalNet: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "ap-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
