-- Enable RLS on product_images (if not enabled)
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists to clean up
DROP POLICY IF EXISTS "Public can view product images" ON product_images;

-- Create policy to allow public read access
CREATE POLICY "Public can view product images"
ON product_images FOR SELECT
USING (true);

-- Also ensure products are readable (just in case)
DROP POLICY IF EXISTS "Public can view active products" ON products;
CREATE POLICY "Public can view active products"
ON products FOR SELECT
USING (is_active = true);
