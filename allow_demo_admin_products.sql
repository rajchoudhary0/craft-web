-- Allow Demo Admin (Unauthenticated) to manage products
-- WARNING: This allows any unauthenticated user to modify products. 
-- Only use this for local development or demo purposes where true Auth is not used.

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 1. UPDATE
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (
  auth.uid() IS NULL OR 
  exists ( select 1 from profiles where id = auth.uid() and role = 'admin' )
);

-- 2. INSERT
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (
  auth.uid() IS NULL OR 
  exists ( select 1 from profiles where id = auth.uid() and role = 'admin' )
);

-- 3. DELETE
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (
  auth.uid() IS NULL OR 
  exists ( select 1 from profiles where id = auth.uid() and role = 'admin' )
);
