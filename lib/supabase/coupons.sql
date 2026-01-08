-- ============================================
-- COUPONS SYSTEM SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL CHECK (discount_value > 0),
  min_order_amount numeric DEFAULT 0,
  max_discount_amount numeric, -- Useful for percentage discounts
  start_date timestamp with time zone DEFAULT now(),
  end_date timestamp with time zone,
  usage_limit int, -- Total times this coupon can be used
  used_count int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons(is_active);

-- 3. Row Level Security

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can do everything
CREATE POLICY "Admins can manage coupons" ON public.coupons
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Policy: Public/Customers can only view active valid coupons by code match
-- (Strictly speaking, allowing 'SELECT' on the whole table lets users enumerate codes if they guess IDs)
-- For better security, we usually use a function (RPC) to validate. 
-- But for now, we'll allow SELECT on active coupons so the checkout can query by code.
CREATE POLICY "Customers can view active coupons" ON public.coupons
  FOR SELECT
  USING (
    is_active = true 
    AND (start_date IS NULL OR start_date <= now())
    AND (end_date IS NULL OR end_date >= now())
  );

-- 4. Function to increment usage (safe increment)
-- This checks limits and increments transactionally
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_coupon_id uuid;
BEGIN
  -- Check validity and lock row
  SELECT id INTO v_coupon_id
  FROM public.coupons
  WHERE code = coupon_code
    AND is_active = true
    AND (usage_limit IS NULL OR used_count < usage_limit)
    AND (end_date IS NULL OR end_date >= now())
  FOR UPDATE;

  IF v_coupon_id IS NULL THEN
    RETURN false;
  END IF;

  -- Increment
  UPDATE public.coupons
  SET used_count = used_count + 1
  WHERE id = v_coupon_id;

  RETURN true;
END;
$$;

-- 5. Helper to validate coupon (optional, simplifies frontend check)
CREATE OR REPLACE FUNCTION public.validate_coupon(coupon_code text, order_amount numeric)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_coupon record;
BEGIN
  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE code = coupon_code
    AND is_active = true
    AND (start_date IS NULL OR start_date <= now())
    AND (end_date IS NULL OR end_date >= now());

  IF v_coupon IS NULL THEN
    RETURN json_build_object('valid', false, 'message', 'Invalid or expired coupon');
  END IF;

  IF v_coupon.usage_limit IS NOT NULL AND v_coupon.used_count >= v_coupon.usage_limit THEN
    RETURN json_build_object('valid', false, 'message', 'Coupon usage limit reached');
  END IF;

  IF order_amount < v_coupon.min_order_amount THEN
    RETURN json_build_object('valid', false, 'message', 'Minimum order amount not met');
  END IF;

  RETURN json_build_object(
    'valid', true, 
    'type', v_coupon.discount_type,
    'value', v_coupon.discount_value,
    'code', v_coupon.code
  );
END;
$$;

-- 6. Disable RLS for dev environment (Optional, matching previous pattern)
ALTER TABLE public.coupons DISABLE ROW LEVEL SECURITY;
