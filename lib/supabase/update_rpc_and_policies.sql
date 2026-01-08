-- Unified Update Script
-- 1. Disable RLS for Coupons (Dev Fix)
ALTER TABLE public.coupons DISABLE ROW LEVEL SECURITY;

-- 2. Disable RLS for Gift Cards (Dev Fix)
ALTER TABLE public.gift_cards DISABLE ROW LEVEL SECURITY;

-- 3. Install/Update Checkout RPC
CREATE OR REPLACE FUNCTION public.checkout_order(
  p_user_id uuid,
  p_items jsonb,
  p_total_amount numeric,
  p_shipping_address jsonb,
  p_coupon_id uuid DEFAULT NULL,
  p_gift_card_id uuid DEFAULT NULL
) 
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id uuid;
  v_item jsonb;
  v_gift_card_code text;
  v_new_card_id uuid;
  v_generated_cards jsonb[] := ARRAY[]::jsonb[];
BEGIN
  -- 1. Create Order
  INSERT INTO public.orders (
    user_id,
    status,
    total_amount,
    shipping_address,
    coupon_id
  ) VALUES (
    p_user_id,
    'processing',
    p_total_amount,
    p_shipping_address,
    p_coupon_id
  ) RETURNING id INTO v_order_id;

  -- 2. Process Items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Insert Order Item
    INSERT INTO public.order_items (
      order_id,
      product_id,
      quantity,
      price
    ) VALUES (
      v_order_id,
      (v_item->>'product_id')::uuid,
      (v_item->>'quantity')::int,
      (v_item->>'price')::numeric
    );

    -- 3. Check for Gift Card Product Type
    IF EXISTS (
      SELECT 1 FROM public.products 
      WHERE id = (v_item->>'product_id')::uuid 
      AND type = 'gift_card'
    ) THEN
      -- Loop for quantity
      FOR i IN 1..(v_item->>'quantity')::int LOOP
        -- Generate Code: GIFT-XXXX-XXXX
        v_gift_card_code := 'GIFT-' || upper(substr(md5(random()::text), 1, 4)) || '-' || upper(substr(md5(random()::text), 1, 4));
        
        -- Create Gift Card Record
        INSERT INTO public.gift_cards (
          code,
          initial_value,
          balance,
          status,
          purchaser_id,
          order_id,
          expiry_date
        ) VALUES (
          v_gift_card_code,
          (v_item->>'price')::numeric,
          (v_item->>'price')::numeric,
          'active',
          p_user_id,
          v_order_id,
          NOW() + INTERVAL '1 year'
        ) RETURNING id INTO v_new_card_id;

        -- Add to result array (to show user)
        v_generated_cards := array_append(v_generated_cards, jsonb_build_object(
          'code', v_gift_card_code,
          'amount', (v_item->>'price')::numeric
        ));
      END LOOP;
    END IF;
  END LOOP;

  -- 4. Deduct Balance from Used Gift Card (if any)
  IF p_gift_card_id IS NOT NULL THEN
    PERFORM public.use_gift_card(
      (SELECT code FROM public.gift_cards WHERE id = p_gift_card_id), 
      p_total_amount 
    );
  END IF;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'generated_cards', to_jsonb(v_generated_cards)
  );
END;
$$;
