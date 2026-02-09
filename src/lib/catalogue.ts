/**
 * Product Catalogue
 * This is a static file-based catalogue for the MVP.
 * Can be migrated to database later if needed.
 */

export type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number; // TTC (tax included)
  shippingCents: number; // Per unit, based on La Poste rates
  image: string; // Path to image or placeholder
  active: boolean;
  weightGrams?: number; // Optional for future shipping calculations
  tags?: string[];
  stockQuantity?: number; // Optional stock tracking
};

/**
 * Main product catalogue
 */
export const catalogue: Product[] = [
  {
    id: 'mug-ville-2024',
    name: 'Mug Ville Edition 2024',
    description: 'Mug en céramique blanc avec le logo de la ville. Capacité 350ml, compatible lave-vaisselle.',
    priceCents: 1200, // 12.00€
    shippingCents: 450, // 4.50€ (Lettre Suivie La Poste)
    image: 'https://placehold.co/600x400/e2e8f0/1e293b?text=Mug+Ville',
    active: true,
    weightGrams: 350,
    tags: ['vaisselle', 'collection'],
    stockQuantity: 50,
  },
  {
    id: 'tote-bag-ville',
    name: 'Tote Bag Ville',
    description: 'Sac en coton bio avec sérigraphie du logo de la ville. Dimensions : 38x42cm.',
    priceCents: 1500, // 15.00€
    shippingCents: 450, // 4.50€ (Lettre Suivie La Poste)
    image: 'https://placehold.co/600x400/e2e8f0/1e293b?text=Tote+Bag',
    active: true,
    weightGrams: 120,
    tags: ['textile', 'eco-friendly'],
    stockQuantity: 30,
  },
  {
    id: 'stickers-pack',
    name: 'Pack de Stickers Ville',
    description: 'Set de 5 stickers repositionnables aux couleurs de la ville. Résistants à l\'eau.',
    priceCents: 500, // 5.00€
    shippingCents: 200, // 2.00€ (Lettre Verte)
    image: 'https://placehold.co/600x400/e2e8f0/1e293b?text=Stickers',
    active: true,
    weightGrams: 20,
    tags: ['papeterie', 'collection'],
    stockQuantity: 100,
  },
  {
    id: 'carnet-edition-1885',
    name: 'Carnet Édition 1885',
    description: 'Carnet de notes premium avec couverture gaufrée et papier 120g. Format A5, 192 pages.',
    priceCents: 1800, // 18.00€
    shippingCents: 450, // 4.50€ (Lettre Suivie La Poste)
    image: 'https://placehold.co/600x800/F3EFEA/6E3CA0?text=Carnet+1885',
    active: true,
    weightGrams: 280,
    tags: ['papeterie', 'collection', 'nouveau', 'best-seller'],
    stockQuantity: 45,
  },
];

/**
 * Get product by ID
 */
export function getProductById(id: string): Product | undefined {
  return catalogue.find((p) => p.id === id && p.active);
}

/**
 * Get all active products
 */
export function getAllActiveProducts(): Product[] {
  return catalogue.filter((p) => p.active);
}

/**
 * Calculate cart totals
 * This is the SERVER-SIDE calculation that MUST be used for checkout
 * NEVER trust client-side calculations
 */
export function calculateCartTotals(
  items: Array<{ id: string; qty: number }>,
  fulfillmentMode: 'delivery' | 'pickup'
): {
  itemsTotal: number;
  shippingTotal: number;
  grandTotal: number;
  validatedItems: Array<{
    product: Product;
    qty: number;
    itemTotal: number;
    shippingTotal: number;
  }>;
} | { error: string } {
  const validatedItems: Array<{
    product: Product;
    qty: number;
    itemTotal: number;
    shippingTotal: number;
  }> = [];

  let itemsTotal = 0;
  let shippingTotal = 0;

  // Validate and calculate each item
  for (const item of items) {
    // Get product from catalogue (SERVER SOURCE OF TRUTH)
    const product = getProductById(item.id);

    if (!product) {
      return { error: `Product not found: ${item.id}` };
    }

    // Validate quantity (1-10 per product)
    if (item.qty < 1 || item.qty > 10) {
      return { error: `Invalid quantity for ${product.name}: ${item.qty}` };
    }

    // Check stock if enabled
    if (product.stockQuantity !== undefined && product.stockQuantity < item.qty) {
      return { error: `Insufficient stock for ${product.name}` };
    }

    // Calculate item total
    const itemTotal = product.priceCents * item.qty;
    itemsTotal += itemTotal;

    // Calculate shipping (only for delivery mode)
    const itemShipping = fulfillmentMode === 'delivery' ? product.shippingCents * item.qty : 0;
    shippingTotal += itemShipping;

    validatedItems.push({
      product,
      qty: item.qty,
      itemTotal,
      shippingTotal: itemShipping,
    });
  }

  const grandTotal = itemsTotal + shippingTotal;

  return {
    itemsTotal,
    shippingTotal,
    grandTotal,
    validatedItems,
  };
}

/**
 * Format price in cents to euros (e.g., 1250 -> "12,50 €")
 */
export function formatCurrency(cents: number): string {
  const euros = cents / 100;
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(euros);
}

/**
 * Validate cart items before checkout
 */
export function validateCartItems(
  items: Array<{ id: string; qty: number }>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (items.length === 0) {
    errors.push('Cart is empty');
    return { valid: false, errors };
  }

  for (const item of items) {
    const product = getProductById(item.id);

    if (!product) {
      errors.push(`Product not found: ${item.id}`);
      continue;
    }

    if (item.qty < 1) {
      errors.push(`Quantity must be at least 1 for ${product.name}`);
    }

    if (item.qty > 10) {
      errors.push(`Maximum quantity is 10 per product for ${product.name}`);
    }

    if (product.stockQuantity !== undefined && product.stockQuantity < item.qty) {
      errors.push(`Only ${product.stockQuantity} items available for ${product.name}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
