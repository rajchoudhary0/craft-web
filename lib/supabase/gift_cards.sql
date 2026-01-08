-- ============================================
-- GIFT CARDS SYSTEM SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Modify Products Table using a safer DO block to avoid errors
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'type') THEN
    ALTER TABLE public.products ADD COLUMN type text DEFAULT 'physical';
  END IF;
END $$;

-- 2. Create Gift Cards Table
CREATE TABLE IF NOT EXISTS public.gift_cards (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  initial_value numeric NOT NULL CHECK (initial_value >= 0),
  balance numeric NOT NULL CHECK (balance >= 0),
  currency text DEFAULT 'INR',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
  purchaser_id uuid REFERENCES auth.users(id), -- Who bought it
  recipient_email text, -- Who it's for
  order_id uuid, -- Origin order
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  expiry_date timestamp with time zone
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON public.gift_cards(code);
CREATE INDEX IF NOT EXISTS idx_gift_cards_status ON public.gift_cards(status);

-- 4. Enable RLS
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;

-- Policies
-- Admins can manage all
CREATE POLICY "Admins can manage gift_cards" ON public.gift_cards
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Users can view their own purchased cards
CREATE POLICY "Users can view purchased gift_cards" ON public.gift_cards
  FOR SELECT
  USING (auth.uid() = purchaser_id);

-- 5. RPC: Validate Gift Card
-- Checks if code exists, is active, and returns balance
CREATE OR REPLACE FUNCTION public.validate_gift_card(code_input text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_card record;
BEGIN
  SELECT * INTO v_card
  FROM public.gift_cards
  WHERE code = code_input
    AND status = 'active'
    AND balance > 0
    AND (expiry_date IS NULL OR expiry_date > now());

  IF v_card IS NULL THEN
    RETURN json_build_object('valid', false, 'message', 'Invalid or expired gift card');
  END IF;

  RETURN json_build_object(
    'valid', true,
    'code', v_card.code,
    'balance', v_card.balance,
    'initial_value', v_card.initial_value
  );
END;
$$;

-- 6. RPC: Redeem/Use Gift Card (called during checkout)
-- Decreases balance transactionally
CREATE OR REPLACE FUNCTION public.use_gift_card(code_input text, amount_to_use numeric)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_card_id uuid;
  v_current_balance numeric;
  v_actual_deduction numeric;
BEGIN
  -- Lock the row
  SELECT id, balance INTO v_card_id, v_current_balance
  FROM public.gift_cards
  WHERE code = code_input
    AND status = 'active'
    AND (expiry_date IS NULL OR expiry_date > now())
  FOR UPDATE;

  IF v_card_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Card invalid or unavailable');
  END IF;

  IF v_current_balance <= 0 THEN
     RETURN json_build_object('success', false, 'message', 'Insufficient balance');
  END IF;

  -- Calculate deduction (can't deduct more than balance)
  v_actual_deduction := LEAST(v_current_balance, amount_to_use);

  -- Update balance
  UPDATE public.gift_cards
  SET balance = balance - v_actual_deduction,
      status = CASE WHEN (balance - v_actual_deduction) = 0 THEN 'used' ELSE 'active' END
  WHERE id = v_card_id;

  RETURN json_build_object(
    'success', true,
    'deducted', v_actual_deduction,
    'remaining_balance', v_current_balance - v_actual_deduction
  );
END;
$$;

-- 7. Trigger: Auto-generate Gift Card on Order (Optional for now, requires complex Order Item logic)
-- For MVP, Admin creates them or we simulate purchase. 
-- We'll rely on the Admin UI or a "success" hook to call an RPC to generate.

-- Disable RLS for Dev
ALTER TABLE public.gift_cards DISABLE ROW LEVEL SECURITY;
