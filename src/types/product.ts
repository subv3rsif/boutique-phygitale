/**
 * Product Type Definitions
 * Matches the Drizzle schema from src/lib/db/schema-products.ts
 */

/**
 * Product image metadata
 * Stores information about product images in the gallery
 */
export type ProductImage = {
  url: string; // Public URL of the image
  path: string; // Storage path (e.g., for file operations)
  order: number; // Display order in gallery
  isPrimary: boolean; // Whether this is the primary/featured image
};

/**
 * Product size configuration
 * Stores size-specific stock information
 */
export type ProductSize = {
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL'; // Available size
  stock: number; // Stock quantity for this size
  stockAlertThreshold: number; // Low stock alert threshold for this size
};

/**
 * Complete Product entity
 * Represents a product in the catalog with all its properties
 */
export type Product = {
  id: string; // UUID primary key
  slug: string; // URL-friendly identifier (unique)
  name: string; // Product name
  description: string; // Product description
  priceCents: number; // Price in cents (TTC)
  shippingCents: number; // Base shipping cost in cents per unit
  images: ProductImage[]; // Array of product images with metadata
  stockQuantity: number; // Current stock level
  stockAlertThreshold: number; // Threshold for low stock alerts
  weightGrams: number | null; // Product weight in grams (optional)
  tags: string[] | null; // Category tags for navigation/filtering (héritage, graffiti, collection, artisan)
  badges: string[] | null; // Display badges shown on product images (pièce phare, nouveauté, etc.)
  payfipProductCode: string | null; // PayFIP product code for administrative tracking
  editionNumber: number | null; // Edition number if part of limited series
  editionTotal: number | null; // Total editions if part of limited series
  active: boolean; // Whether product is active/available for sale
  featured: boolean; // Whether product is featured on homepage
  showInCollectionPage: boolean; // Whether to show in collection page preview (max 3 per category)
  sizes: ProductSize[] | null; // Size configurations (if product has sizes)
  createdAt: Date; // Timestamp of creation
  updatedAt: Date; // Timestamp of last update
};

/**
 * Stock Movement types
 * Represents different types of inventory transactions
 */
export type StockMovementType = 'sale' | 'restock' | 'adjustment' | 'return';

/**
 * Complete Stock Movement entity
 * Records every inventory transaction for audit trail
 */
export type StockMovement = {
  id: string; // UUID primary key
  productId: string; // Reference to product
  type: StockMovementType; // Type of movement
  quantity: number; // Quantity involved (can be negative)
  orderId: string | null; // Associated order ID if applicable
  note: string | null; // Optional note about the movement
  createdBy: string | null; // User/system that created the movement
  createdAt: Date; // Timestamp of the movement
};

/**
 * Input type for creating a new product
 * All fields are optional with sensible defaults
 */
export type CreateProductInput = {
  slug: string; // URL-friendly identifier
  name: string; // Product name
  description: string; // Product description
  priceCents: number; // Price in cents (TTC)
  shippingCents: number; // Shipping cost in cents per unit
  stockQuantity?: number; // Initial stock (default: 0)
  stockAlertThreshold?: number; // Low stock threshold (default: 5)
  weightGrams?: number; // Weight in grams (optional)
  tags?: string; // Comma-separated category tags (optional)
  badges?: string; // Comma-separated display badges (optional)
  payfipProductCode?: string; // PayFIP code (default: '11')
  editionNumber?: number; // Edition number (optional)
  editionTotal?: number; // Total editions (optional)
  active?: boolean; // Active status (default: true)
  featured?: boolean; // Featured on homepage (default: false)
  showInCollectionPage?: boolean; // Show in collection page preview (default: false)
  sizes?: ProductSize[]; // Size configurations (optional, default: [])
};

/**
 * Input type for updating a product
 * All fields are optional - only provided fields will be updated
 */
export type UpdateProductInput = Partial<CreateProductInput>;

/**
 * Stock adjustment operations for admin stock management
 * Supports three operations: add (increase), remove (decrease), set (absolute value)
 */
export type StockAdjustment = {
  type: 'add' | 'remove' | 'set'; // Operation type
  quantity: number; // Quantity to adjust
  note?: string; // Optional note for audit trail
};

/**
 * Response type for stock adjustment operations
 * Returns the result of the adjustment
 */
export type StockAdjustmentResult = {
  success: boolean; // Whether adjustment succeeded
  previousQuantity: number; // Stock level before adjustment
  newQuantity: number; // Stock level after adjustment
  movementId: string; // ID of created stock movement record
  message?: string; // Optional message
};

/**
 * Product filter options for queries
 * Used in product listing/filtering operations
 */
export type ProductFilter = {
  active?: boolean; // Filter by active status
  tags?: string[]; // Filter by tags
  minPrice?: number; // Minimum price in cents
  maxPrice?: number; // Maximum price in cents
  inStockOnly?: boolean; // Filter to only in-stock products
  searchText?: string; // Search in name/description
};

/**
 * Product with calculated properties
 * Extended product type with computed values
 */
export type ProductWithCalculations = Product & {
  isLowStock: boolean; // Whether stock is below alert threshold
  isOutOfStock: boolean; // Whether stock is 0
  isLimitedEdition: boolean; // Whether this is a limited edition
  displayPrice: string; // Formatted price (e.g., "12,00 €")
};
