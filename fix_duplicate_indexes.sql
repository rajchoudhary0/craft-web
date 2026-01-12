-- ============================================
-- FIX DUPLICATE INDEXES
-- Run this in Supabase SQL Editor
-- ============================================

-- The linter detected identical indexes: idx_products_category and idx_products_category_id.
-- We will drop the one we just added (or the redundant one) to resolve the warning.

DROP INDEX IF EXISTS idx_products_category_id;
