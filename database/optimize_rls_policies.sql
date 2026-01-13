-- ============================================
-- Fix RLS Performance & Duplicates
-- Run this in Supabase SQL Editor
-- ============================================

-- ---------------------------------------------------------
-- 1. Helper Function for Admin Check (Optimized)
-- ---------------------------------------------------------
-- This function centralizes the admin check logic and uses the optimization 
-- implicitly because stable functions are cached per query statement.
CREATE OR REPLACE FUNCTION public.is_admin_or_manager()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'manager')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ---------------------------------------------------------
-- 2. PRODUCTS: Fix performance & duplicates
-- ---------------------------------------------------------
-- Drop known duplicates/unoptimized policies
-- Drop known duplicates/unoptimized policies
DROP POLICY IF EXISTS "Admins can delete products" ON products;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Public can view active products" ON products;
DROP POLICY IF EXISTS "Public can view products" ON products;
DROP POLICY IF EXISTS "Admins Manage Products" ON products;
DROP POLICY IF EXISTS "Public View Active Products" ON products;
DROP POLICY IF EXISTS "View Products" ON products;

-- Re-create optimized policies
-- Combine Public/Admin View into one policy for performance (avoids multiple policy checks)
CREATE POLICY "View Products" 
ON products FOR SELECT 
USING ( 
  is_active = true 
  OR 
  is_admin_or_manager() 
);

-- Admins Modify (Insert/Update/Delete only - Select is handled above)
DROP POLICY IF EXISTS "Admins Modify Products" ON products;
CREATE POLICY "Admins Modify Products" 
ON products FOR INSERT 
TO authenticated 
WITH CHECK ( is_admin_or_manager() ); 


DROP POLICY IF EXISTS "Admins Modify Products (Update)" ON products;
CREATE POLICY "Admins Modify Products (Update)" 
ON products FOR UPDATE
TO authenticated 
USING ( is_admin_or_manager() )
WITH CHECK ( is_admin_or_manager() );



DROP POLICY IF EXISTS "Admins Modify Products (Delete)" ON products;
CREATE POLICY "Admins Modify Products (Delete)" 
ON products FOR DELETE
TO authenticated 
USING ( is_admin_or_manager() );


-- ---------------------------------------------------------
-- 3. CATEGORIES: Fix duplicates
-- ---------------------------------------------------------
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Public can view categories" ON categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
DROP POLICY IF EXISTS "Admins can update categories" ON categories;
DROP POLICY IF EXISTS "Admins Manage Categories" ON categories;
DROP POLICY IF EXISTS "Public View Categories" ON categories;

-- 1. Public View (Everyone) - Admins are included in "true"
CREATE POLICY "Public View Categories" 
ON categories FOR SELECT 
USING ( true );

-- 2. Admin Modify (Insert/Update/Delete)
DROP POLICY IF EXISTS "Admins Modify Categories" ON categories;
CREATE POLICY "Admins Modify Categories" 
ON categories FOR INSERT 
TO authenticated 
WITH CHECK ( is_admin_or_manager() ); 


DROP POLICY IF EXISTS "Admins Modify Categories (Update)" ON categories;
CREATE POLICY "Admins Modify Categories (Update)" 
ON categories FOR UPDATE
TO authenticated 
USING ( is_admin_or_manager() )
WITH CHECK ( is_admin_or_manager() );


DROP POLICY IF EXISTS "Admins Modify Categories (Delete)" ON categories;
CREATE POLICY "Admins Modify Categories (Delete)" 
ON categories FOR DELETE
TO authenticated 
USING ( is_admin_or_manager() );


-- ---------------------------------------------------------
-- 4. REVIEWS: Fix performance & duplicates
-- ---------------------------------------------------------
DROP POLICY IF EXISTS "Admins can create reviews for anyone" ON reviews;
DROP POLICY IF EXISTS "Public can view reviews" ON reviews;
DROP POLICY IF EXISTS "View reviews" ON reviews;
DROP POLICY IF EXISTS "Insert reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can delete reviews" ON reviews;
DROP POLICY IF EXISTS "Update reviews" ON reviews;
DROP POLICY IF EXISTS "Admins Manage Reviews" ON reviews;
DROP POLICY IF EXISTS "Public View Reviews" ON reviews;
DROP POLICY IF EXISTS "Users Create Reviews" ON reviews;

-- 1. Public View
CREATE POLICY "Public View Reviews" 
ON reviews FOR SELECT 
USING ( true );

-- 2. Users Create (Own data) - Optimized with (select auth.uid())
CREATE POLICY "Users Create Reviews" 
ON reviews FOR INSERT 
TO authenticated 
WITH CHECK ( (select auth.uid()) = user_id );

-- 3. Admins Modify (Update/Delete)
-- Note: Insert is handled by logic on frontend usually, or separate admin insert if needed
DROP POLICY IF EXISTS "Admins Modify Reviews" ON reviews;
CREATE POLICY "Admins Modify Reviews" 
ON reviews FOR DELETE
TO authenticated 
USING ( is_admin_or_manager() );



DROP POLICY IF EXISTS "Admins Modify Reviews (Update)" ON reviews;
CREATE POLICY "Admins Modify Reviews (Update)" 
ON reviews FOR UPDATE
TO authenticated 
USING ( is_admin_or_manager() )
WITH CHECK ( is_admin_or_manager() );


-- ---------------------------------------------------------
-- 5. READ-ONLY TABLES (Tags, Product Images, Product Tags)
-- ---------------------------------------------------------
-- Product Images
DROP POLICY IF EXISTS "Product images are viewable by everyone" ON product_images;
DROP POLICY IF EXISTS "Public can view product images" ON product_images;
DROP POLICY IF EXISTS "Public can view product_images" ON product_images;
DROP POLICY IF EXISTS "Admins can delete product_images" ON product_images;
DROP POLICY IF EXISTS "Admins can insert product_images" ON product_images;
DROP POLICY IF EXISTS "Admins can update product_images" ON product_images;
DROP POLICY IF EXISTS "Admins Manage Product Images" ON product_images;
DROP POLICY IF EXISTS "Public View Product Images" ON product_images;

CREATE POLICY "Public View Product Images" ON product_images FOR SELECT USING (true);

-- Admin Modify Only
DROP POLICY IF EXISTS "Admins Modify Product Images" ON product_images;
CREATE POLICY "Admins Modify Product Images" ON product_images FOR INSERT WITH CHECK (is_admin_or_manager());
DROP POLICY IF EXISTS "Admins Modify Product Images (Update)" ON product_images;
CREATE POLICY "Admins Modify Product Images (Update)" ON product_images FOR UPDATE USING (is_admin_or_manager());
DROP POLICY IF EXISTS "Admins Modify Product Images (Delete)" ON product_images;
CREATE POLICY "Admins Modify Product Images (Delete)" ON product_images FOR DELETE USING (is_admin_or_manager());

-- Tags
DROP POLICY IF EXISTS "Public can view tags" ON tags;
DROP POLICY IF EXISTS "Tags are viewable by everyone" ON tags;
DROP POLICY IF EXISTS "Admins can delete tags" ON tags;
DROP POLICY IF EXISTS "Admins can insert tags" ON tags;
DROP POLICY IF EXISTS "Admins can update tags" ON tags;
DROP POLICY IF EXISTS "Admins Manage Tags" ON tags;
DROP POLICY IF EXISTS "Public View Tags" ON tags;

CREATE POLICY "Public View Tags" ON tags FOR SELECT USING (true);

-- Admin Modify Only
DROP POLICY IF EXISTS "Admins Modify Tags" ON tags;
CREATE POLICY "Admins Modify Tags" ON tags FOR INSERT WITH CHECK (is_admin_or_manager());
DROP POLICY IF EXISTS "Admins Modify Tags (Update)" ON tags;
CREATE POLICY "Admins Modify Tags (Update)" ON tags FOR UPDATE USING (is_admin_or_manager());
DROP POLICY IF EXISTS "Admins Modify Tags (Delete)" ON tags;
CREATE POLICY "Admins Modify Tags (Delete)" ON tags FOR DELETE USING (is_admin_or_manager());

-- Product Tags
DROP POLICY IF EXISTS "Product tags are viewable by everyone" ON product_tags;
DROP POLICY IF EXISTS "Public can view product_tags" ON product_tags;
DROP POLICY IF EXISTS "Admins can delete product_tags" ON product_tags;
DROP POLICY IF EXISTS "Admins can insert product_tags" ON product_tags;
DROP POLICY IF EXISTS "Admins can update product_tags" ON product_tags;
DROP POLICY IF EXISTS "Admins Manage Product Tags" ON product_tags;
DROP POLICY IF EXISTS "Public View Product Tags" ON product_tags;

CREATE POLICY "Public View Product Tags" ON product_tags FOR SELECT USING (true);

-- Admin Modify Only
DROP POLICY IF EXISTS "Admins Modify Product Tags" ON product_tags;
CREATE POLICY "Admins Modify Product Tags" ON product_tags FOR INSERT WITH CHECK (is_admin_or_manager());
DROP POLICY IF EXISTS "Admins Modify Product Tags (Delete)" ON product_tags;
CREATE POLICY "Admins Modify Product Tags (Delete)" ON product_tags FOR DELETE USING (is_admin_or_manager());


-- ---------------------------------------------------------
-- 6. GIFT CARDS: Fix duplicates
-- ---------------------------------------------------------
DROP POLICY IF EXISTS "Admins can delete gift_cards" ON gift_cards;
DROP POLICY IF EXISTS "Admins can insert gift_cards" ON gift_cards;
DROP POLICY IF EXISTS "Admins can manage gift_cards" ON gift_cards;
DROP POLICY IF EXISTS "Admins can update gift_cards" ON gift_cards;
DROP POLICY IF EXISTS "Users can view purchased gift_cards" ON gift_cards;
DROP POLICY IF EXISTS "View gift_cards" ON gift_cards;
DROP POLICY IF EXISTS "Admins Manage Gift Cards" ON gift_cards;
DROP POLICY IF EXISTS "Users View Own Gift Cards" ON gift_cards;

-- Combine User/Admin view for performance
DROP POLICY IF EXISTS "View Access Gift Cards" ON gift_cards;
CREATE POLICY "View Access Gift Cards" 
ON gift_cards FOR SELECT 
TO authenticated 
USING ( 
  purchaser_id = (select auth.uid()) OR 
  recipient_email = (select email from auth.users where id = (select auth.uid())) OR
  is_admin_or_manager()
);

-- Admin Modify
DROP POLICY IF EXISTS "Admins Modify Gift Cards" ON gift_cards;
CREATE POLICY "Admins Modify Gift Cards" 
ON gift_cards FOR INSERT 
TO authenticated 
WITH CHECK ( is_admin_or_manager() ); 


DROP POLICY IF EXISTS "Admins Modify Gift Cards (Update)" ON gift_cards;
CREATE POLICY "Admins Modify Gift Cards (Update)" 
ON gift_cards FOR UPDATE
TO authenticated 
USING ( is_admin_or_manager() );



DROP POLICY IF EXISTS "Admins Modify Gift Cards (Delete)" ON gift_cards;
CREATE POLICY "Admins Modify Gift Cards (Delete)" 
ON gift_cards FOR DELETE
TO authenticated 
USING ( is_admin_or_manager() );


-- ---------------------------------------------------------
-- 7. USERS: Fix performance
-- ---------------------------------------------------------
DROP POLICY IF EXISTS "Users can view themselves" ON users;
DROP POLICY IF EXISTS "Users View Own Data" ON users;
DROP POLICY IF EXISTS "Admins View All Users" ON users;

-- Combined View Policy
DROP POLICY IF EXISTS "View Users" ON users;
CREATE POLICY "View Users" 
ON users FOR SELECT 
TO authenticated 
USING ( 
  id = (select auth.uid()) 
  OR 
  is_admin_or_manager() 
);


SELECT 'RLS policies optimized and deduplicated successfully!' as result;
