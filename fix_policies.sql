-- 1. DROP DANGEROUS POLICIES (If they exist)
-- We use "DO" blocks to avoid errors if the policies don't exist
DO $$
BEGIN
    -- Products
    DROP POLICY IF EXISTS "Public can manage products" ON public.products;
    DROP POLICY IF EXISTS "Public can insert products" ON public.products;
    DROP POLICY IF EXISTS "Public can update products" ON public.products;
    DROP POLICY IF EXISTS "Public can delete products" ON public.products;
    
    -- Categories
    DROP POLICY IF EXISTS "Public can manage categories" ON public.categories;
    
    -- Tags
    DROP POLICY IF EXISTS "Public can manage tags" ON public.tags;
    DROP POLICY IF EXISTS "Public can manage product_tags" ON public.product_tags;
    
    -- Images
    DROP POLICY IF EXISTS "Public can manage product images" ON public.product_images;
END $$;

-- 2. ENSURE STRICT ADMIN POLICIES
-- Re-create or ensure admin policies exist (Supabase allows creating if not exists via straight SQL usually, but dropping first ensures clean slate)

-- Products: Viewable by everyone, Modifiable ONLY by Admin
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (
  exists ( select 1 from profiles where id = auth.uid() and role = 'admin' )
);

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (
  exists ( select 1 from profiles where id = auth.uid() and role = 'admin' )
);

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (
  exists ( select 1 from profiles where id = auth.uid() and role = 'admin' )
);

-- Profiles: Users manage own, Viewable by everyone
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (
  auth.uid() = id
);
