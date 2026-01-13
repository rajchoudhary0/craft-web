-- ============================================
-- Admin Permissions System
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Update profiles role constraint to include 'manager'
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role = ANY (ARRAY['customer'::text, 'manager'::text, 'admin'::text]));

-- 2. Create admin_permissions table (references profiles, not users)
CREATE TABLE IF NOT EXISTS public.admin_permissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  section text NOT NULL, -- 'products', 'categories', 'orders', etc.
  can_view boolean DEFAULT true,
  can_edit boolean DEFAULT false,
  can_delete boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, section),
  CONSTRAINT admin_permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- 3. Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_permissions_user_id ON public.admin_permissions(user_id);

-- 4. Disable RLS for development (enable in production with proper policies)
ALTER TABLE public.admin_permissions DISABLE ROW LEVEL SECURITY;

-- 5. Grant access
GRANT ALL ON public.admin_permissions TO authenticated;
GRANT ALL ON public.admin_permissions TO anon;

-- ============================================
-- OPTIONAL: Clean up duplicate 'users' table if not needed
-- (Only run if you confirm the 'users' table is not used)
-- ============================================
-- DROP TABLE IF EXISTS public.users CASCADE;

SELECT 'Admin permissions table created successfully!' as result;
