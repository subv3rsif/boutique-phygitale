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
    id: 'mug-love-symbol',
    name: 'Mug Love Symbol Edition',
    description: 'Mug en céramique premium avec motif Love Symbol. Capacité 350ml, compatible lave-vaisselle et micro-ondes.',
    priceCents: 1400, // 14.00€
    shippingCents: 450,
    image: 'https://placehold.co/600x750/503B64/F3EFEA?text=Mug+Love+Symbol&font=playfair-display',
    active: true,
    weightGrams: 380,
    tags: ['vaisselle', 'collection', 'nouveau'],
    stockQuantity: 45,
  },
  {
    id: 'tote-bag-heritage',
    name: 'Tote Bag Héritage 1885',
    description: 'Sac en coton bio premium avec sérigraphie vintage. Dimensions généreuses : 40x45cm. Anses renforcées.',
    priceCents: 1800, // 18.00€
    shippingCents: 450,
    image: 'https://placehold.co/600x750/F3EFEA/503B64?text=Tote+Heritage&font=playfair-display',
    active: true,
    weightGrams: 140,
    tags: ['textile', 'eco-friendly', 'best-seller'],
    stockQuantity: 35,
  },
  {
    id: 'stickers-vibrant-pack',
    name: 'Collection Stickers Vibrant',
    description: 'Set de 8 stickers aux finitions holographiques. Design exclusif Love Symbol. Résistants à l\'eau et aux UV.',
    priceCents: 700, // 7.00€
    shippingCents: 200,
    image: 'https://placehold.co/600x750/826E96/F3EFEA?text=Stickers+Vibrant&font=playfair-display',
    active: true,
    weightGrams: 25,
    tags: ['papeterie', 'nouveau'],
    stockQuantity: 120,
  },
  {
    id: 'carnet-edition-1885',
    name: 'Carnet Édition 1885',
    description: 'Carnet de notes premium avec couverture gaufrée Love Symbol. Papier 120g, format A5, 192 pages numérotées.',
    priceCents: 2200, // 22.00€
    shippingCents: 450,
    image: 'https://placehold.co/600x750/503B64/F3EFEA?text=Carnet+1885&font=playfair-display',
    active: true,
    weightGrams: 320,
    tags: ['papeterie', 'collection', 'nouveau', 'best-seller'],
    stockQuantity: 50,
  },
  {
    id: 'pin-love-symbol',
    name: 'Pin\'s Love Symbol',
    description: 'Pin\'s émaillé haut de gamme avec finition brillante. Attache papillon dorée. Diamètre 3cm.',
    priceCents: 900, // 9.00€
    shippingCents: 200,
    image: 'https://placehold.co/600x750/A091AF/503B64?text=Pins+Love&font=playfair-display',
    active: true,
    weightGrams: 15,
    tags: ['accessoires', 'nouveau', 'best-seller'],
    stockQuantity: 80,
  },
  {
    id: 'affiche-heritage',
    name: 'Affiche Héritage 1885',
    description: 'Affiche d\'art exclusive sur papier mat 250g. Format A3 (29,7 x 42 cm). Design vintage revisité.',
    priceCents: 2500, // 25.00€
    shippingCents: 450,
    image: 'https://placehold.co/600x750/F3EFEA/503B64?text=Affiche+1885&font=playfair-display',
    active: true,
    weightGrams: 180,
    tags: ['decoration', 'collection'],
    stockQuantity: 25,
  },
  {
    id: 'sweat-love-edition',
    name: 'Sweat Love Edition',
    description: 'Sweat-shirt brodé 100% coton bio. Coupe unisexe confortable. Broderie premium poitrine.',
    priceCents: 4500, // 45.00€
    shippingCents: 600,
    image: 'https://placehold.co/600x750/503B64/F3EFEA?text=Sweat+Love&font=playfair-display',
    active: true,
    weightGrams: 420,
    tags: ['textile', 'collection', 'nouveau'],
    stockQuantity: 30,
  },
  {
    id: 'gourde-inox-1885',
    name: 'Gourde Inox 1885',
    description: 'Gourde isotherme en inox 500ml. Garde le froid 24h et le chaud 12h. Design gravé laser.',
    priceCents: 2800, // 28.00€
    shippingCents: 600,
    image: 'https://placehold.co/600x750/826E96/F3EFEA?text=Gourde+Inox&font=playfair-display',
    active: true,
    weightGrams: 280,
    tags: ['vaisselle', 'eco-friendly', 'best-seller'],
    stockQuantity: 40,
  },
  {
    id: 'badges-collection',
    name: 'Collection Badges Vintage',
    description: 'Set de 6 badges vintage 56mm. Designs rétro inspirés des archives municipales de 1885.',
    priceCents: 1200, // 12.00€
    shippingCents: 200,
    image: 'https://placehold.co/600x750/F3EFEA/503B64?text=Badges+Vintage&font=playfair-display',
    active: true,
    weightGrams: 40,
    tags: ['accessoires', 'collection'],
    stockQuantity: 60,
  },
  {
    id: 'trousse-heritage',
    name: 'Trousse Héritage',
    description: 'Trousse en toile cirée avec fermeture éclair dorée. Doublure intérieure Love Symbol. 20x12cm.',
    priceCents: 1600, // 16.00€
    shippingCents: 450,
    image: 'https://placehold.co/600x750/503B64/F3EFEA?text=Trousse+Heritage&font=playfair-display',
    active: true,
    weightGrams: 90,
    tags: ['accessoires', 'nouveau'],
    stockQuantity: 35,
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
