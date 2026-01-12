-- ============================================
-- REVIEWS RPC FUNCTIONS
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Check if a user has purchased a specific product
CREATE OR REPLACE FUNCTION public.has_purchased_product(p_user_id uuid, p_product_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.user_id = p_user_id 
      AND oi.product_id = p_product_id
      AND o.status IN ('paid', 'processing', 'shipped', 'delivered')
  );
$$;

-- 2. Check if a user can review a product (has purchased AND hasn't reviewed yet)
CREATE OR REPLACE FUNCTION public.can_review_product(p_product_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT 
    -- User must be authenticated
    auth.uid() IS NOT NULL
    -- User must have purchased the product
    AND EXISTS (
      SELECT 1 FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.user_id = auth.uid() 
        AND oi.product_id = p_product_id
        AND o.status IN ('paid', 'processing', 'shipped', 'delivered')
    )
    -- User hasn't reviewed this product yet
    AND NOT EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.user_id = auth.uid() 
        AND r.product_id = p_product_id
    );
$$;

-- 3. Get review statistics for a product
CREATE OR REPLACE FUNCTION public.get_product_review_stats(p_product_id uuid)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'average_rating', COALESCE(AVG(rating)::numeric(2,1), 0),
    'total_reviews', COUNT(*),
    'rating_breakdown', json_build_object(
      '5', COUNT(*) FILTER (WHERE rating = 5),
      '4', COUNT(*) FILTER (WHERE rating = 4),
      '3', COUNT(*) FILTER (WHERE rating = 3),
      '2', COUNT(*) FILTER (WHERE rating = 2),
      '1', COUNT(*) FILTER (WHERE rating = 1)
    )
  )
  FROM reviews
  WHERE product_id = p_product_id AND is_approved = true;
$$;
