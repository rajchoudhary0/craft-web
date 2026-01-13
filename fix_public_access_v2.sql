-- FIX PUBLIC READ ACCESS (V2 - Corrected)
-- Explicitly enable public read access for all catalog tables.

-- 1. PRODUCTS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view products" ON public.products;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);

-- 2. CATEGORIES
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);

-- 3. PRODUCT IMAGES
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view product_images" ON public.product_images;
DROP POLICY IF EXISTS "Public can view product_tags" ON public.product_images; -- Remove typo policy
CREATE POLICY "Public can view product_images" ON public.product_images FOR SELECT USING (true);

-- 4. TAGS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view tags" ON public.tags;
CREATE POLICY "Public can view tags" ON public.tags FOR SELECT USING (true);

-- 5. PRODUCT TAGS (Fixing previous typo)
ALTER TABLE public.product_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view product_tags" ON public.product_tags;
CREATE POLICY "Public can view product_tags" ON public.product_tags FOR SELECT USING (true);

-- 6. REVIEWS (Ensure approved ones are visible)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view reviews" ON public.reviews;
CREATE POLICY "Public can view reviews" ON public.reviews FOR SELECT USING (is_approved = true);
