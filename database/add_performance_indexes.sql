-- ============================================
-- ADD PERFORMANCE INDEXES
-- Run this in Supabase SQL Editor
-- ============================================

-- Based on Query Performance Analysis, the following indexes are missing 
-- and causing slower queries during joins and sorting.

-- 1. Optimize Product Image lookups (frequent JOINs)
CREATE INDEX IF NOT EXISTS idx_product_images_product_id 
  ON public.product_images USING btree (product_id);

-- 2. Optimize Product Tag lookups (frequent JOINs)
CREATE INDEX IF NOT EXISTS idx_product_tags_product_id 
  ON public.product_tags USING btree (product_id);

-- 3. Optimize Product Sorting (ORDER BY created_at DESC)
-- This is used frequently in the main product feed
CREATE INDEX IF NOT EXISTS idx_products_created_at 
  ON public.products USING btree (created_at);

-- 4. Optimize Category lookups (common in product filters)
-- (Good practice as it's a foreign key used in joins)
CREATE INDEX IF NOT EXISTS idx_products_category_id 
  ON public.products USING btree (category_id);
