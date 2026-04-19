-- Migration: Add sizes support to products
-- Date: 2026-04-17
-- Description: Adds sizes field to products table for size variant management

-- Add sizes column (JSON array)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS sizes JSONB DEFAULT '[]'::jsonb;

-- Add size_selected column to order_items
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS size_selected VARCHAR(10);

-- Add comment for documentation
COMMENT ON COLUMN products.sizes IS
'Array of size configurations with stock per size: [{size: "S", stock: 10, stockAlertThreshold: 5}, ...]';

COMMENT ON COLUMN order_items.size_selected IS
'Selected size for this order item (S, M, L, XL, XXL). NULL if product has no sizes.';

-- Example query to check products with sizes
-- SELECT id, name, sizes FROM products WHERE jsonb_array_length(sizes) > 0;
