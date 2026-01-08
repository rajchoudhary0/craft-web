-- ============================================
-- MIGRATION SCRIPT - Add missing columns to existing tables
-- ============================================
-- Run this if you have EXISTING tables from the old schema

-- Add missing columns to products table
DO $$ 
BEGIN
  -- Add is_active column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'is_active') THEN
    ALTER TABLE products ADD COLUMN is_active boolean DEFAULT true;
  END IF;

  -- Add is_featured column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'is_featured') THEN
    ALTER TABLE products ADD COLUMN is_featured boolean DEFAULT false;
  END IF;

  -- Add is_new column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'is_new') THEN
    ALTER TABLE products ADD COLUMN is_new boolean DEFAULT false;
  END IF;

  -- Add slug column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'slug') THEN
    ALTER TABLE products ADD COLUMN slug text UNIQUE;
  END IF;

  -- Add category_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'category_id') THEN
    ALTER TABLE products ADD COLUMN category_id uuid;
  END IF;

  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'updated_at') THEN
    ALTER TABLE products ADD COLUMN updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());
  END IF;

  -- Add original_price column if doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'original_price') THEN
    ALTER TABLE products ADD COLUMN original_price numeric;
  END IF;
END $$;

-- Update existing products to be active
UPDATE products SET is_active = true WHERE is_active IS NULL;
UPDATE products SET is_featured = false WHERE is_featured IS NULL;
UPDATE products SET is_new = false WHERE is_new IS NULL;

-- Generate slugs for existing products that don't have one
UPDATE products 
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- ============================================
-- Now drop existing RLS policies and recreate
-- ============================================

-- Drop existing products policies
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;

-- Recreate products policies
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT 
  USING (is_active = true OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================
-- Create new tables if they don't exist
-- ============================================

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  is_active boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;

CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Add foreign key to products if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'products_category_id_fkey'
  ) THEN
    ALTER TABLE products 
    ADD CONSTRAINT products_category_id_fkey 
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Product Images
CREATE TABLE IF NOT EXISTS product_images (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  sort_order int DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Product images are viewable by everyone" ON product_images;
DROP POLICY IF EXISTS "Admins can manage product images" ON product_images;

CREATE POLICY "Product images are viewable by everyone"
  ON product_images FOR SELECT USING (true);

CREATE POLICY "Admins can manage product images"
  ON product_images FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Tags
CREATE TABLE IF NOT EXISTS tags (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS product_tags (
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tags are viewable by everyone" ON tags;
DROP POLICY IF EXISTS "Admins can manage tags" ON tags;
DROP POLICY IF EXISTS "Product tags are viewable by everyone" ON product_tags;
DROP POLICY IF EXISTS "Admins can manage product tags" ON product_tags;

CREATE POLICY "Tags are viewable by everyone" ON tags FOR SELECT USING (true);
CREATE POLICY "Admins can manage tags" ON tags FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Product tags are viewable by everyone" ON product_tags FOR SELECT USING (true);
CREATE POLICY "Admins can manage product tags" ON product_tags FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Carts
CREATE TABLE IF NOT EXISTS carts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS cart_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  cart_id uuid REFERENCES carts(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(cart_id, product_id)
);

ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own cart" ON carts;
DROP POLICY IF EXISTS "Users can manage their own cart items" ON cart_items;

CREATE POLICY "Users can manage their own cart" ON carts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own cart items" ON cart_items FOR ALL
  USING (EXISTS (SELECT 1 FROM carts WHERE id = cart_items.cart_id AND user_id = auth.uid()));

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  is_approved boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, product_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Approved reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can manage reviews" ON reviews;

CREATE POLICY "Approved reviews are viewable by everyone" ON reviews FOR SELECT
  USING (is_approved = true OR auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage reviews" ON reviews FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Site Content
CREATE TABLE IF NOT EXISTS site_content (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Site content is viewable by everyone" ON site_content;
DROP POLICY IF EXISTS "Admins can update site content" ON site_content;

CREATE POLICY "Site content is viewable by everyone" ON site_content FOR SELECT USING (true);
CREATE POLICY "Admins can update site content" ON site_content FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Insert default content
INSERT INTO site_content (key, value) VALUES
  ('hero', '{"title": "Handcrafted with Love", "subtitle": "Discover unique artisan creations", "cta_text": "Shop Now", "cta_link": "/products"}'),
  ('about', '{"title": "About The Vybe Store", "content": "We create beautiful handmade products with passion and care.", "image_url": ""}'),
  ('footer', '{"tagline": "Handcrafted by Neha Kumari", "copyright": "© 2024 The Vybe Store"}'),
  ('newsletter', '{"title": "Join Our Newsletter", "subtitle": "Get updates on new arrivals and exclusive offers"}')
ON CONFLICT (key) DO NOTHING;

-- Newsletter
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Anyone can subscribe" ON newsletter_subscribers;

CREATE POLICY "Admins can view subscribers" ON newsletter_subscribers FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers FOR INSERT WITH CHECK (true);

-- ============================================
-- Create indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);

-- Success message
SELECT 'Migration completed successfully!' as result;
