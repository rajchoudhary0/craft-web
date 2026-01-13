-- RESTORE STRICT SECURITY (Remove Demo Access)
-- Run this AFTER you have successfully logged in as a real Admin.

-- 1. Products: Admin Only Updates
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (
  exists ( select 1 from profiles where id = auth.uid() and role = 'admin' )
);

DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (
  exists ( select 1 from profiles where id = auth.uid() and role = 'admin' )
);

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (
  exists ( select 1 from profiles where id = auth.uid() and role = 'admin' )
);

-- 2. Gift Cards: Remove Anon Access
-- We drop the policy that allowed "purchaser_id IS NULL" for everyone.
DROP POLICY IF EXISTS "Allow management of system gift cards" ON public.gift_cards;

-- Reuse/Ensure Admin policy exists
DROP POLICY IF EXISTS "Admins can manage gift_cards" ON public.gift_cards;
CREATE POLICY "Admins can manage gift_cards" ON public.gift_cards
  FOR ALL
  USING (
    exists ( select 1 from profiles where id = auth.uid() and role = 'admin' )
  );
