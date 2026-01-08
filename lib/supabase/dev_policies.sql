-- ============================================
-- FIX RLS: Enable public access for admin operations
-- Run this in Supabase SQL Editor
-- ============================================

-- STEP 1: Disable RLS temporarily on products (easiest fix)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- STEP 2: Add missing columns to product_images
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'product_images' AND column_name = 'alt_text') THEN
    ALTER TABLE product_images ADD COLUMN alt_text text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'product_images' AND column_name = 'display_order') THEN
    ALTER TABLE product_images ADD COLUMN display_order int DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'product_images' AND column_name = 'is_primary') THEN
    ALTER TABLE product_images ADD COLUMN is_primary boolean DEFAULT false;
  END IF;
END $$;

-- STEP 3: Add slug to tags if missing
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tags' AND column_name = 'slug') THEN
    ALTER TABLE tags ADD COLUMN slug text;
  END IF;
END $$;

-- STEP 4: Add missing columns to products
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'story') THEN
    ALTER TABLE products ADD COLUMN story text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'materials') THEN
    ALTER TABLE products ADD COLUMN materials text[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'dimensions') THEN
    ALTER TABLE products ADD COLUMN dimensions text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'care_instructions') THEN
    ALTER TABLE products ADD COLUMN care_instructions text[];
  END IF;
END $$;

SELECT 'RLS DISABLED! You can now add products.' as result;
