-- Add is_featured column to categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- Update existing categories to have some defaults featured (optional, good for testing)
UPDATE categories SET is_featured = true WHERE slug IN ('ceramics', 'textiles', 'jewelry', 'home-decor');
