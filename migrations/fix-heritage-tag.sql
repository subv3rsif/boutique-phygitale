-- Migration: Fix heritage tag inconsistency
-- Date: 2026-04-17
-- Description: Updates products with 'héritage' tag to 'heritage' (without accent)

-- Update all products that have 'héritage' in their tags array
UPDATE products
SET tags = array_replace(tags, 'héritage', 'heritage')
WHERE 'héritage' = ANY(tags);

-- Verify the update
SELECT id, name, tags
FROM products
WHERE 'heritage' = ANY(tags)
ORDER BY created_at DESC;
