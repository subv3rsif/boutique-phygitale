-- Add badges column to products table
-- Badges are display labels shown on product images (e.g., "pièce phare", "nouveauté")
-- Separate from tags which are used for category navigation

ALTER TABLE products
ADD COLUMN IF NOT EXISTS badges text[];

-- Add comment for documentation
COMMENT ON COLUMN products.badges IS 'Display badges shown on product images (e.g., pièce phare, nouveauté, édition limitée)';
