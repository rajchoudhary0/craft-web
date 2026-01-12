-- ============================================
-- OPTIMIZE RLS POLICIES (FIXED)
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. CATEGORIES
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
DROP POLICY IF EXISTS "Admins can update categories" ON categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON categories;

CREATE POLICY "Admins can insert categories" ON categories FOR INSERT WITH CHECK (exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin'));
CREATE POLICY "Admins can update categories" ON categories FOR UPDATE USING (exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin'));
CREATE POLICY "Admins can delete categories" ON categories FOR DELETE USING (exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin'));


-- 2. PRODUCTS
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;

CREATE POLICY "Admins can insert products" ON products FOR INSERT WITH CHECK (exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin'));
CREATE POLICY "Admins can update products" ON products FOR UPDATE USING (exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin'));
CREATE POLICY "Admins can delete products" ON products FOR DELETE USING (exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin'));
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT
  USING (is_active = true OR exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin'));


-- 3. ORDERS
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "View orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

CREATE POLICY "View orders" ON orders FOR SELECT
  USING ((select auth.uid()) = user_id OR exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin'));

CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Admins can update orders" ON orders FOR UPDATE
  USING (exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin'));


-- 4. ORDER ITEMS
DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
DROP POLICY IF EXISTS "View order items" ON order_items;
DROP POLICY IF EXISTS "Users can create order items" ON order_items;

CREATE POLICY "View order items" ON order_items FOR SELECT
  USING (
    exists (select 1 from orders where id = order_items.order_id and user_id = (select auth.uid()))
    OR 
    exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin')
  );

CREATE POLICY "Users can create order items" ON order_items FOR INSERT
  WITH CHECK (exists (select 1 from orders where id = order_items.order_id and user_id = (select auth.uid())));


-- 5. COUPONS
DROP POLICY IF EXISTS "Customers can view active coupons" ON coupons;
DROP POLICY IF EXISTS "Admins can manage coupons" ON coupons;
DROP POLICY IF EXISTS "Admins can insert coupons" ON coupons;
DROP POLICY IF EXISTS "Admins can update coupons" ON coupons;
DROP POLICY IF EXISTS "Admins can delete coupons" ON coupons;
DROP POLICY IF EXISTS "View coupons" ON coupons;

CREATE POLICY "Admins can insert coupons" ON coupons FOR INSERT WITH CHECK (exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin'));
CREATE POLICY "Admins can update coupons" ON coupons FOR UPDATE USING (exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin'));
CREATE POLICY "Admins can delete coupons" ON coupons FOR DELETE USING (exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin'));

CREATE POLICY "View coupons" ON coupons FOR SELECT
  USING (
    (is_active = true AND (start_date IS NULL OR start_date <= now()) AND (end_date IS NULL OR end_date >= now()))
    OR 
    exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin')
  );


-- 6. GIFT CARDS
DROP POLICY IF EXISTS "Users can view purchased gift_cards" ON gift_cards;
DROP POLICY IF EXISTS "Admins can manage gift_cards" ON gift_cards;
DROP POLICY IF EXISTS "Admins can insert gift_cards" ON gift_cards;
DROP POLICY IF EXISTS "Admins can update gift_cards" ON gift_cards;
DROP POLICY IF EXISTS "Admins can delete gift_cards" ON gift_cards;
DROP POLICY IF EXISTS "View gift_cards" ON gift_cards;

CREATE POLICY "Admins can insert gift_cards" ON gift_cards FOR INSERT WITH CHECK (exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin'));
CREATE POLICY "Admins can update gift_cards" ON gift_cards FOR UPDATE USING (exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin'));
CREATE POLICY "Admins can delete gift_cards" ON gift_cards FOR DELETE USING (exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin'));

CREATE POLICY "View gift_cards" ON gift_cards FOR SELECT
  USING (
    purchaser_id = (select auth.uid())
    OR 
    exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin')
  );


-- 7. REVIEWS
DROP POLICY IF EXISTS "Approved reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Admins can manage reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can insert reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can update reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can delete reviews" ON reviews;
DROP POLICY IF EXISTS "View reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;

CREATE POLICY "Admins can insert reviews" ON reviews FOR INSERT WITH CHECK (exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin'));
CREATE POLICY "Admins can update reviews" ON reviews FOR UPDATE USING (exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin'));
CREATE POLICY "Admins can delete reviews" ON reviews FOR DELETE USING (exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin'));

CREATE POLICY "View reviews" ON reviews FOR SELECT
  USING (
    is_approved = true 
    OR user_id = (select auth.uid())
    OR exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin')
  );

CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update their own reviews" ON reviews FOR UPDATE USING ((select auth.uid()) = user_id);


-- 8. PROFILES
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING ((select auth.uid()) = id);


-- 9. CARTS & CART ITEMS
DROP POLICY IF EXISTS "Users can manage their own cart" ON carts;
CREATE POLICY "Users can manage their own cart" ON carts FOR ALL USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can manage their own cart items" ON cart_items;
CREATE POLICY "Users can manage their own cart items" ON cart_items FOR ALL 
  USING (exists (select 1 from carts where id = cart_items.cart_id and user_id = (select auth.uid())));


-- 10. TAGS
DROP POLICY IF EXISTS "Admins can manage tags" ON tags;
DROP POLICY IF EXISTS "Admins can insert tags" ON tags;
DROP POLICY IF EXISTS "Admins can update tags" ON tags;
DROP POLICY IF EXISTS "Admins can delete tags" ON tags;

CREATE POLICY "Admins can insert tags" ON tags FOR INSERT WITH CHECK (exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin'));
CREATE POLICY "Admins can update tags" ON tags FOR UPDATE USING (exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin'));
CREATE POLICY "Admins can delete tags" ON tags FOR DELETE USING (exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin'));


-- 11. PRODUCT TAGS
DROP POLICY IF EXISTS "Admins can manage product tags" ON product_tags;
DROP POLICY IF EXISTS "Admins can insert product_tags" ON product_tags;
DROP POLICY IF EXISTS "Admins can update product_tags" ON product_tags;
DROP POLICY IF EXISTS "Admins can delete product_tags" ON product_tags;

CREATE POLICY "Admins can insert product_tags" ON product_tags FOR INSERT WITH CHECK (exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin'));
CREATE POLICY "Admins can update product_tags" ON product_tags FOR UPDATE USING (exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin'));
CREATE POLICY "Admins can delete product_tags" ON product_tags FOR DELETE USING (exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin'));


-- 12. PRODUCT IMAGES
DROP POLICY IF EXISTS "Admins can manage product images" ON product_images;
DROP POLICY IF EXISTS "Admins can insert product_images" ON product_images;
DROP POLICY IF EXISTS "Admins can update product_images" ON product_images;
DROP POLICY IF EXISTS "Admins can delete product_images" ON product_images;

CREATE POLICY "Admins can insert product_images" ON product_images FOR INSERT WITH CHECK (exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin'));
CREATE POLICY "Admins can update product_images" ON product_images FOR UPDATE USING (exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin'));
CREATE POLICY "Admins can delete product_images" ON product_images FOR DELETE USING (exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin'));


-- 13. SITE CONTENT
DROP POLICY IF EXISTS "Admins can update site content" ON site_content;
CREATE POLICY "Admins can update site content" ON site_content FOR UPDATE
  USING (exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin'));


-- 14. WISHLISTS
DROP POLICY IF EXISTS "Users can manage their own wishlist" ON wishlists;
CREATE POLICY "Users can manage their own wishlist" ON wishlists FOR ALL USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can manage their own wishlist items" ON wishlist_items;
CREATE POLICY "Users can manage their own wishlist items" ON wishlist_items FOR ALL
  USING (exists (select 1 from wishlists where id = wishlist_items.wishlist_id and user_id = (select auth.uid())));


-- 15. NEWSLETTER SUBSCRIBERS
DROP POLICY IF EXISTS "Admins can view subscribers" ON newsletter_subscribers;
CREATE POLICY "Admins can view subscribers" ON newsletter_subscribers FOR SELECT
  USING (exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin'));


-- 16. USER ADDRESSES (Safe Block)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_addresses') THEN
    DROP POLICY IF EXISTS "Users can manage their own addresses" ON public.user_addresses;
    CREATE POLICY "Users can manage their own addresses" ON public.user_addresses FOR ALL
      USING ((select auth.uid()) = user_id);
  END IF;
END $$;
