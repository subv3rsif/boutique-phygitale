-- Migration: Add show_in_collection_page column to products table
-- Date: 2026-04-17
-- Description: Adds boolean field to control which products appear on collection page preview

-- Add the column with default value false
ALTER TABLE products
ADD COLUMN IF NOT EXISTS show_in_collection_page BOOLEAN NOT NULL DEFAULT false;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_show_in_collection
ON products(show_in_collection_page)
WHERE show_in_collection_page = true;

-- Add comment for documentation
COMMENT ON COLUMN products.show_in_collection_page IS
'Controls whether product appears in collection page preview (max 3 per category)';
