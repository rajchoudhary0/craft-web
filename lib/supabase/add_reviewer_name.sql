-- ============================================
-- ADD REVIEWER NAME TO REVIEWS TABLE
-- Run this in Supabase SQL Editor
-- ============================================

-- Add reviewer_name column to allow custom names for in-person buyers
-- When this is set, it will be displayed instead of the user's profile name
ALTER TABLE public.reviews 
  ADD COLUMN IF NOT EXISTS reviewer_name text;

-- Make user_id nullable so admin can create reviews without a linked user
ALTER TABLE public.reviews 
  ALTER COLUMN user_id DROP NOT NULL;

-- Drop the unique constraint that requires user_id
ALTER TABLE public.reviews 
  DROP CONSTRAINT IF EXISTS reviews_user_id_product_id_key;

-- Add a new constraint that allows one review per user OR per reviewer_name per product
-- This uses a partial unique index approach
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_user_product 
  ON public.reviews (user_id, product_id) 
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_name_product 
  ON public.reviews (reviewer_name, product_id) 
  WHERE user_id IS NULL AND reviewer_name IS NOT NULL;

-- Allow admins to create reviews without requiring auth.uid()
-- This enables admin-created reviews for in-person buyers
DROP POLICY IF EXISTS "Admins can create reviews for anyone" ON public.reviews;
CREATE POLICY "Admins can create reviews for anyone"
  ON public.reviews FOR INSERT
  WITH CHECK (
    -- Allow if user_id is null (admin-created for in-person buyers)
    user_id IS NULL
    -- Or if the user is inserting for themselves
    OR auth.uid() = user_id
    -- Or if user is an admin
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Update the existing "Users can create reviews" policy to be more permissive
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;

