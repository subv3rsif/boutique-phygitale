import { z } from 'zod';

/**
 * Product Validation Schemas
 * Zod schemas for validating product inputs, stock adjustments, and image uploads
 */

// Slug validation (lowercase, numbers, hyphens only)
const slugRegex = /^[a-z0-9-]+$/;

/**
 * Complete product creation schema
 * Used for creating new products via admin API
 */
export const productSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug requis')
    .max(100, 'Slug trop long')
    .regex(slugRegex, 'Slug invalide (minuscules, chiffres, tirets uniquement)'),
  name: z.string().min(1, 'Nom requis').max(255, 'Nom trop long'),
  description: z.string().min(1, 'Description requise'),
  priceCents: z.number().int().min(0, 'Prix doit être >= 0'),
  shippingCents: z.number().int().min(0, 'Frais de port >= 0'),
  stockQuantity: z.number().int().min(0, 'Stock >= 0').default(0),
  stockAlertThreshold: z.number().int().min(0, 'Seuil >= 0').default(5),
  weightGrams: z.number().int().min(0).optional(),
  tags: z.string().optional(), // Category tags (comma-separated)
  badges: z.string().optional(), // Display badges (comma-separated)
  payfipProductCode: z.string().max(10).default('11'),
  editionNumber: z.number().int().min(1).optional(),
  editionTotal: z.number().int().min(1).optional(),
  active: z.boolean().default(true),
});

export type ProductInput = z.infer<typeof productSchema>;

/**
 * Partial product update schema
 * Used for updating existing products - all fields optional
 */
export const updateProductSchema = productSchema.partial();

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

/**
 * Stock adjustment schema
 * Used for manual stock adjustments in admin panel
 */
export const stockAdjustmentSchema = z.object({
  type: z.enum(['add', 'remove', 'set'], {
    message: 'Type doit être "add", "remove" ou "set"',
  }),
  quantity: z.number().int().min(0, 'Quantité >= 0'),
  note: z.string().optional(),
});

export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;

/**
 * Image upload metadata schema
 * Used when uploading product images
 */
export const imageUploadSchema = z.object({
  isPrimary: z.boolean().default(false),
});

export type ImageUploadInput = z.infer<typeof imageUploadSchema>;

/**
 * Transform comma-separated string into array
 * Handles trimming and filtering empty values
 * Used for both tags and badges
 *
 * @param csvString - Comma-separated string
 * @returns Array of trimmed, non-empty values
 */
export function parseCommaSeparated(csvString?: string): string[] {
  if (!csvString) return [];
  return csvString
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/**
 * Parse tags (alias for backwards compatibility)
 */
export function parseTags(tagsString?: string): string[] {
  return parseCommaSeparated(tagsString);
}

/**
 * Parse badges
 */
export function parseBadges(badgesString?: string): string[] {
  return parseCommaSeparated(badgesString);
}

/**
 * Auto-generate URL-friendly slug from product name
 * Normalizes accents, removes special characters, converts spaces to hyphens
 *
 * @param name - Product name
 * @returns URL-friendly slug
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .trim()
    .replace(/\s+/g, '-') // Spaces to hyphens
    .replace(/-+/g, '-'); // Multiple hyphens to single
}
