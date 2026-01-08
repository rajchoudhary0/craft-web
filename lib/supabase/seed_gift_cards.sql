-- Create Gift Cards Category
INSERT INTO public.categories (name, slug, description)
VALUES ('Gift Cards', 'gift-cards', 'Digital gift cards for your loved ones')
ON CONFLICT (slug) DO NOTHING;

-- Get the Category ID
DO $$
DECLARE
  v_category_id uuid;
BEGIN
  SELECT id INTO v_category_id FROM public.categories WHERE slug = 'gift-cards';

  -- Insert Products
  INSERT INTO public.products (
    name, 
    slug, 
    description, 
    price, 
    stock, 
    images, 
    category_id, 
    type,
    is_active
  ) VALUES 
  (
    'Digital Gift Card - ₹500', 
    'gift-card-500', 
    'The perfect gift for handcrafted lovers. Valid for 1 year.', 
    500, 
    99999, 
    ARRAY['https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&q=80&w=800'], 
    v_category_id, 
    'gift_card',
    true
  ),
  (
    'Digital Gift Card - ₹1000', 
    'gift-card-1000', 
    'The perfect gift for handcrafted lovers. Valid for 1 year.', 
    1000, 
    99999, 
    ARRAY['https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&q=80&w=800'], 
    v_category_id, 
    'gift_card',
    true
  ),
  (
    'Digital Gift Card - ₹2000', 
    'gift-card-2000', 
    'The perfect gift for handcrafted lovers. Valid for 1 year.', 
    2000, 
    99999, 
    ARRAY['https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&q=80&w=800'], 
    v_category_id, 
    'gift_card',
    true
  ),
  (
    'Digital Gift Card - ₹5000', 
    'gift-card-5000', 
    'The perfect gift for handcrafted lovers. Valid for 1 year.', 
    5000, 
    99999, 
    ARRAY['https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&q=80&w=800'], 
    v_category_id, 
    'gift_card',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET type = 'gift_card';
END $$;
