-- Enable RLS on gift_cards to be sure
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;

-- Drop existing restricted policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can manage gift_cards" ON public.gift_cards;
DROP POLICY IF EXISTS "Users can view purchased gift_cards" ON public.gift_cards;

-- 1. Policy for Admins (Authenticated)
CREATE POLICY "Admins can manage gift_cards" ON public.gift_cards
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 2. Policy for Users (View their own)
CREATE POLICY "Users can view purchased gift_cards" ON public.gift_cards
  FOR SELECT
  USING (auth.uid() = purchaser_id);

-- 3. Policy for Demo Admin / Manual Issue (Unauthenticated inserts/selects)
-- Allows operations on cards that don't belong to a registered user (purchaser_id IS NULL)
CREATE POLICY "Allow management of system gift cards" ON public.gift_cards
  FOR ALL
  USING (purchaser_id IS NULL)
  WITH CHECK (purchaser_id IS NULL);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_gift_cards_purchaser_id ON public.gift_cards(purchaser_id);
