-- PROMOTE USER TO ADMIN
-- 1. Sign up as a user in the app (e.g., admin@thevybestore.com) using the Sign Up page.
-- 2. Run this script in Supabase SQL Editor to promote that user to Admin.

-- Replace 'admin@thevybestore.com' with the email you signed up with:
DO $$
DECLARE
  target_email text := 'admin@thevybestore.com'; 
BEGIN
  -- Update profile role
  UPDATE public.profiles
  SET role = 'admin'
  WHERE id = (SELECT id FROM auth.users WHERE email = target_email);

  -- Verification
  IF FOUND THEN
    RAISE NOTICE 'User % promoted to admin successfully.', target_email;
  ELSE
    RAISE NOTICE 'User % not found. Please sign up first.', target_email;
  END IF;
END $$;
