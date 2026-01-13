-- ENABLE PUBLIC READ ACCESS
-- Fixes "Error fetching product" and "Search not working"
-- This allows anyone (including anonymous visitors) to VIEW products, categories, etc.
-- It does NOT allow modification.

-- 1. PRODUCTS
-- Ensure RLS is on (just in case)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view products" ON public.products;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products; -- legacy name
CREATE POLICY "Public can view products" ON public.products
  FOR SELECT
  USING (true); -- Visible to everyone

-- 2. CATEGORIES
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories" ON public.categories
  FOR SELECT
  USING (true);

-- 3. PRODUCT IMAGES
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view product_images" ON public.product_images;
CREATE POLICY "Public can view product_images" ON public.product_images
  FOR SELECT
  USING (true);

-- 4. TAGS & PRODUCT TAGS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view tags" ON public.tags;
CREATE POLICY "Public can view tags" ON public.tags
  FOR SELECT
  USING (true);

ALTER TABLE public.product_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view product_tags" ON public.product_tags;
CREATE POLICY "Public can view product_tags" ON public.product_images
  FOR SELECT
  USING (true);
