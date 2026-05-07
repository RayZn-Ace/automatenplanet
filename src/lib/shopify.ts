// Shopify Storefront API + slug→variant mapping
export const SHOPIFY_API_VERSION = "2025-07";
export const SHOPIFY_STORE_PERMANENT_DOMAIN = "3c3782-2.myshopify.com";
export const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
export const SHOPIFY_STOREFRONT_TOKEN = "37302f0e61572056b0637dba2393b994";

// Map of local product slug → Shopify ProductVariant GID.
// For products with multiple variants (e.g. boxautomat-premium), use the slug for the default variant
// and provide additional variant GIDs via SHOPIFY_VARIANTS_BY_SLUG below.
export const SHOPIFY_VARIANT_BY_SLUG: Record<string, string> = {
  "greifautomat": "gid://shopify/ProductVariant/53845312045397",
  "boxautomat-premium": "gid://shopify/ProductVariant/53846024454485", // Nur Münzfach (default)
  "basketball-machine": "gid://shopify/ProductVariant/53845522219349",
  "air-hockey-table": "gid://shopify/ProductVariant/53845554528597",
  "arcade-machine": "gid://shopify/ProductVariant/53845650669909",
  "pink-date-machine": "gid://shopify/ProductVariant/53845755560277",
  "lucky-7-machine": "gid://shopify/ProductVariant/53845756477781",
  "elektronischer-hau-den-lukas": "gid://shopify/ProductVariant/53845757591893",
  "air-hockey": "gid://shopify/ProductVariant/53845758378325",
  "air-hockey-premium": "gid://shopify/ProductVariant/53845775745365",
  "basketball-arcade": "gid://shopify/ProductVariant/53845951906133",
  "champions-league-tischkicker": "gid://shopify/ProductVariant/53845952954709",
  "kinderkarussell": "gid://shopify/ProductVariant/53845954232661",
  "parfuem-automat": "gid://shopify/ProductVariant/53845955707221",
  "snack-automat": "gid://shopify/ProductVariant/53845957640533",
  "furby-car": "gid://shopify/ProductVariant/53845958361429",
  "helicopter-ride": "gid://shopify/ProductVariant/53845959770453",
  "electric-dino-ride": "gid://shopify/ProductVariant/53845966553429",
};

// Multi-variant products (slug → list of variants with label and price)
export interface ShopifyVariantOption {
  variantId: string;
  label: string;
  price: number; // EUR netto
  description?: string;
}

export const SHOPIFY_VARIANTS_BY_SLUG: Record<string, ShopifyVariantOption[]> = {
  "boxautomat-premium": [
    {
      variantId: "gid://shopify/ProductVariant/53846024454485",
      label: "Nur Münzfach",
      price: 1799,
      description: "Münzbetrieb",
    },
    {
      variantId: "gid://shopify/ProductVariant/53846024487253",
      label: "Münz- & Geldscheinfach",
      price: 1949,
      description: "Münzen + Scheine (5/10/20€)",
    },
  ],
};

export async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}) {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!response.ok) {
    if (response.status === 402) return null;
    throw new Error(`Shopify HTTP ${response.status}`);
  }
  const data = await response.json();
  if (data.errors) throw new Error(`Shopify: ${data.errors.map((e: { message: string }) => e.message).join(", ")}`);
  return data;
}

export function formatCheckoutUrl(checkoutUrl: string): string {
  try {
    const url = new URL(checkoutUrl);
    url.searchParams.set("channel", "online_store");
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}

const CART_QUERY = `
  query cart($id: ID!) {
    cart(id: $id) { id totalQuantity checkoutUrl lines(first: 100) { edges { node { id quantity merchandise { ... on ProductVariant { id } } } } } }
  }
`;

const CART_CREATE = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart { id checkoutUrl lines(first: 100) { edges { node { id quantity merchandise { ... on ProductVariant { id } } } } } }
      userErrors { message }
    }
  }
`;

const CART_LINES_ADD = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { id checkoutUrl lines(first: 100) { edges { node { id quantity merchandise { ... on ProductVariant { id } } } } } }
      userErrors { message }
    }
  }
`;

const CART_LINES_UPDATE = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { id checkoutUrl lines(first: 100) { edges { node { id quantity merchandise { ... on ProductVariant { id } } } } } }
      userErrors { message }
    }
  }
`;

const CART_LINES_REMOVE = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { id checkoutUrl lines(first: 100) { edges { node { id quantity merchandise { ... on ProductVariant { id } } } } } }
      userErrors { message }
    }
  }
`;

type CartLineEdge = { node: { id: string; quantity: number; merchandise: { id: string } } };
export type ShopifyCartResult = {
  cartId: string;
  checkoutUrl: string;
  lines: Array<{ lineId: string; variantId: string; quantity: number }>;
};

function mapCart(cart: { id: string; checkoutUrl: string; lines: { edges: CartLineEdge[] } }): ShopifyCartResult {
  return {
    cartId: cart.id,
    checkoutUrl: formatCheckoutUrl(cart.checkoutUrl),
    lines: cart.lines.edges.map((e) => ({
      lineId: e.node.id,
      variantId: e.node.merchandise.id,
      quantity: e.node.quantity,
    })),
  };
}

function isCartNotFound(errs?: Array<{ message: string }>) {
  return !!errs?.some((e) => /cart not found|does not exist/i.test(e.message));
}

export async function shopifyCreateCart(variantId: string, quantity = 1): Promise<ShopifyCartResult> {
  const data = await storefrontApiRequest(CART_CREATE, {
    input: { lines: [{ merchandiseId: variantId, quantity }] },
  });
  const cart = data?.data?.cartCreate?.cart;
  if (!cart?.checkoutUrl) throw new Error("Cart create failed");
  return mapCart(cart);
}

export async function shopifyAddToCart(cartId: string, variantId: string, quantity = 1): Promise<ShopifyCartResult | null> {
  const data = await storefrontApiRequest(CART_LINES_ADD, {
    cartId,
    lines: [{ merchandiseId: variantId, quantity }],
  });
  const cart = data?.data?.cartLinesAdd?.cart;
  const errs = data?.data?.cartLinesAdd?.userErrors;
  if (!cart?.checkoutUrl) {
    if (isCartNotFound(errs)) return null;
    throw new Error("Cart add failed");
  }
  return mapCart(cart);
}

export async function shopifyUpdateLine(cartId: string, lineId: string, quantity: number): Promise<ShopifyCartResult | null> {
  const data = await storefrontApiRequest(CART_LINES_UPDATE, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });
  const cart = data?.data?.cartLinesUpdate?.cart;
  const errs = data?.data?.cartLinesUpdate?.userErrors;
  if (!cart) {
    if (isCartNotFound(errs)) return null;
    throw new Error("Cart update failed");
  }
  return mapCart(cart);
}

export async function shopifyRemoveLine(cartId: string, lineId: string): Promise<ShopifyCartResult | null> {
  const data = await storefrontApiRequest(CART_LINES_REMOVE, {
    cartId,
    lineIds: [lineId],
  });
  const cart = data?.data?.cartLinesRemove?.cart;
  const errs = data?.data?.cartLinesRemove?.userErrors;
  if (!cart) {
    if (isCartNotFound(errs)) return null;
    throw new Error("Cart remove failed");
  }
  return mapCart(cart);
}

export async function shopifyFetchCart(cartId: string): Promise<ShopifyCartResult | null> {
  const data = await storefrontApiRequest(CART_QUERY, { id: cartId });
  if (!data) return null;
  const cart = data?.data?.cart;
  if (!cart) return null;
  return mapCart(cart);
}

const PRODUCT_BY_HANDLE_IMAGES = `
  query productImages($handle: String!) {
    product(handle: $handle) {
      id
      title
      images(first: 20) { edges { node { url altText width height } } }
    }
  }
`;

export interface ShopifyImage {
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
}

export async function shopifyFetchProductImages(handle: string): Promise<ShopifyImage[]> {
  try {
    const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_IMAGES, { handle });
    const edges = data?.data?.product?.images?.edges ?? [];
    return edges.map((e: { node: ShopifyImage }) => e.node);
  } catch {
    return [];
  }
}

