-- ============================================
-- FIX REVIEWS PERFORMANCE (Consolidate Policies)
-- Run this in Supabase SQL Editor
-- ============================================

-- The linter flags having separate "Admin" vs "User" policies for the same action as inefficient.
-- We will consolidate them into single "Manage" policies using OR logic.

-- 1. INSERT
DROP POLICY IF EXISTS "Admins can insert reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Insert reviews" ON reviews;

CREATE POLICY "Insert reviews" ON reviews FOR INSERT WITH CHECK (
  (select auth.uid()) = user_id 
  OR 
  exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin')
);

-- 2. UPDATE
DROP POLICY IF EXISTS "Admins can update reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
DROP POLICY IF EXISTS "Update reviews" ON reviews;

CREATE POLICY "Update reviews" ON reviews FOR UPDATE USING (
  (select auth.uid()) = user_id 
  OR 
  exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin')
);

-- 3. DELETE (Admins Only - checking if we need to clean up old ones just in case)
-- We'll keep the separate efficient one if it's the only one.
-- But just to be safe and consistent:
-- DROP POLICY IF EXISTS "Admins can delete reviews" ON reviews;
-- CREATE POLICY "Admins can delete reviews" ON reviews FOR DELETE USING (exists (select 1 from profiles where id = (select auth.uid()) and role = 'admin'));
-- (Leaving DELETE alone as it didn't trigger a warning because Users likely don't have a DELETE policy)

-- 4. SELECT (Already optimized in previous script, but ensuring no leftovers)
-- "View reviews" should be the only one.
