-- SEED 20 NEW PRODUCTS
-- Run this in Supabase SQL Editor to add more products

-- Get category IDs
DO $$
DECLARE
  v_ceramics_id uuid;
  v_textiles_id uuid;
  v_jewelry_id uuid;
  v_home_decor_id uuid;
  v_candles_id uuid;
  v_art_id uuid;
BEGIN
  SELECT id INTO v_ceramics_id FROM categories WHERE slug = 'ceramics';
  SELECT id INTO v_textiles_id FROM categories WHERE slug = 'textiles';
  SELECT id INTO v_jewelry_id FROM categories WHERE slug = 'jewelry';
  SELECT id INTO v_home_decor_id FROM categories WHERE slug = 'home-decor';
  SELECT id INTO v_candles_id FROM categories WHERE slug = 'candles';
  SELECT id INTO v_art_id FROM categories WHERE slug = 'art';

  -- CERAMICS (4 products)
  INSERT INTO products (name, slug, description, price, category_id, stock, is_active, is_featured, is_new)
  VALUES
    ('Speckled Stoneware Mug', 'speckled-stoneware-mug', 'Hand-thrown stoneware mug with unique speckled glaze. Perfect for your morning coffee.', 899, v_ceramics_id, 25, true, false, true),
    ('Ceramic Dinner Set (4 Pieces)', 'ceramic-dinner-set-4pc', 'Beautiful handcrafted dinner set including 4 plates with artistic glaze patterns.', 3499, v_ceramics_id, 10, true, true, false),
    ('Terracotta Plant Pot', 'terracotta-plant-pot', 'Classic terracotta pot with drainage hole. Handmade with love.', 599, v_ceramics_id, 40, true, false, true),
    ('Ceramic Soap Dispenser', 'ceramic-soap-dispenser', 'Elegant ceramic soap dispenser for kitchen or bathroom.', 749, v_ceramics_id, 20, true, false, false)
  ON CONFLICT (slug) DO NOTHING;

  -- TEXTILES (4 products)
  INSERT INTO products (name, slug, description, price, category_id, stock, is_active, is_featured, is_new)
  VALUES
    ('Block Print Table Runner', 'block-print-table-runner', 'Traditional block-printed cotton table runner. 180cm length.', 1299, v_textiles_id, 15, true, true, true),
    ('Handwoven Cotton Throw', 'handwoven-cotton-throw', 'Soft cotton throw blanket with handwoven patterns. 150x200cm.', 2499, v_textiles_id, 12, true, true, false),
    ('Embroidered Cushion Set', 'embroidered-cushion-set', 'Set of 2 cushion covers with intricate hand embroidery.', 1799, v_textiles_id, 18, true, false, true),
    ('Linen Napkins (Set of 6)', 'linen-napkins-set-6', 'Premium linen napkins with decorative stitching.', 999, v_textiles_id, 25, true, false, false)
  ON CONFLICT (slug) DO NOTHING;

  -- JEWELRY (4 products)
  INSERT INTO products (name, slug, description, price, category_id, stock, is_active, is_featured, is_new)
  VALUES
    ('Hammered Gold Hoops', 'hammered-gold-hoops', 'Handcrafted brass hoops with gold plating. Diameter: 3cm.', 1499, v_jewelry_id, 30, true, true, true),
    ('Beaded Boho Necklace', 'beaded-boho-necklace', 'Colorful beaded necklace with natural stones and wooden beads.', 899, v_jewelry_id, 20, true, false, true),
    ('Silver Leaf Pendant', 'silver-leaf-pendant', 'Delicate sterling silver pendant inspired by nature.', 1899, v_jewelry_id, 15, true, true, false),
    ('Macrame Bracelet Set', 'macrame-bracelet-set', 'Set of 3 handmade macrame bracelets with brass accents.', 699, v_jewelry_id, 35, true, false, false)
  ON CONFLICT (slug) DO NOTHING;

  -- HOME DECOR (4 products)
  INSERT INTO products (name, slug, description, price, category_id, stock, is_active, is_featured, is_new)
  VALUES
    ('Rattan Wall Mirror', 'rattan-wall-mirror', 'Bohemian-style round mirror with handwoven rattan frame. 45cm diameter.', 2999, v_home_decor_id, 8, true, true, true),
    ('Wooden Photo Frame Set', 'wooden-photo-frame-set', 'Set of 3 rustic wooden frames for your favorite memories.', 1299, v_home_decor_id, 20, true, false, true),
    ('Brass Candle Holders (Pair)', 'brass-candle-holders-pair', 'Handmade brass candle holders with antique finish.', 1799, v_home_decor_id, 15, true, true, false),
    ('Jute Storage Basket', 'jute-storage-basket', 'Large handwoven jute basket for storage or plant display.', 999, v_home_decor_id, 25, true, false, false)
  ON CONFLICT (slug) DO NOTHING;

  -- CANDLES (2 products)
  INSERT INTO products (name, slug, description, price, category_id, stock, is_active, is_featured, is_new)
  VALUES
    ('Rose Garden Scented Candle', 'rose-garden-candle', 'Luxurious rose-scented soy candle in ceramic jar. 40-hour burn time.', 899, v_candles_id, 30, true, true, true),
    ('Vanilla & Sandalwood Duo', 'vanilla-sandalwood-duo', 'Set of 2 scented candles with complementary fragrances.', 1499, v_candles_id, 20, true, false, false)
  ON CONFLICT (slug) DO NOTHING;

  -- ART (2 products)
  INSERT INTO products (name, slug, description, price, category_id, stock, is_active, is_featured, is_new)
  VALUES
    ('Abstract Watercolor Print', 'abstract-watercolor-print', 'Original watercolor art print on premium paper. 30x40cm.', 1999, v_art_id, 12, true, true, true),
    ('Handpainted Mandala Canvas', 'handpainted-mandala-canvas', 'Intricate mandala design painted on stretched canvas. 50x50cm.', 3499, v_art_id, 6, true, true, false)
  ON CONFLICT (slug) DO NOTHING;

END $$;

-- Add sample images for new products (using placeholder URLs)
DO $$
DECLARE
  v_product record;
BEGIN
  FOR v_product IN 
    SELECT id, slug FROM products 
    WHERE slug IN (
      'speckled-stoneware-mug', 'ceramic-dinner-set-4pc', 'terracotta-plant-pot', 'ceramic-soap-dispenser',
      'block-print-table-runner', 'handwoven-cotton-throw', 'embroidered-cushion-set', 'linen-napkins-set-6',
      'hammered-gold-hoops', 'beaded-boho-necklace', 'silver-leaf-pendant', 'macrame-bracelet-set',
      'rattan-wall-mirror', 'wooden-photo-frame-set', 'brass-candle-holders-pair', 'jute-storage-basket',
      'rose-garden-candle', 'vanilla-sandalwood-duo', 'abstract-watercolor-print', 'handpainted-mandala-canvas'
    )
  LOOP
    -- Add a primary image using Unsplash for product photography
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
    VALUES (
      v_product.id,
      CASE 
        WHEN v_product.slug LIKE '%mug%' THEN 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800'
        WHEN v_product.slug LIKE '%dinner%' THEN 'https://images.unsplash.com/photo-1595356700395-6f14b5c1f33f?w=800'
        WHEN v_product.slug LIKE '%plant-pot%' THEN 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800'
        WHEN v_product.slug LIKE '%soap%' THEN 'https://images.unsplash.com/photo-1607006344380-b6775a0824ce?w=800'
        WHEN v_product.slug LIKE '%runner%' THEN 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800'
        WHEN v_product.slug LIKE '%throw%' THEN 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'
        WHEN v_product.slug LIKE '%cushion%' THEN 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'
        WHEN v_product.slug LIKE '%napkin%' THEN 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800'
        WHEN v_product.slug LIKE '%hoops%' THEN 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800'
        WHEN v_product.slug LIKE '%necklace%' THEN 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800'
        WHEN v_product.slug LIKE '%pendant%' THEN 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800'
        WHEN v_product.slug LIKE '%bracelet%' THEN 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800'
        WHEN v_product.slug LIKE '%mirror%' THEN 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800'
        WHEN v_product.slug LIKE '%frame%' THEN 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800'
        WHEN v_product.slug LIKE '%holders%' THEN 'https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=800'
        WHEN v_product.slug LIKE '%basket%' THEN 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'
        WHEN v_product.slug LIKE '%rose%' THEN 'https://images.unsplash.com/photo-1602607605623-e1a73c7c49f2?w=800'
        WHEN v_product.slug LIKE '%vanilla%' THEN 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800'
        WHEN v_product.slug LIKE '%watercolor%' THEN 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800'
        WHEN v_product.slug LIKE '%mandala%' THEN 'https://images.unsplash.com/photo-1569172122301-bc5008bc09c5?w=800'
        ELSE 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800'
      END,
      v_product.slug,
      true,
      0
    ) ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

SELECT 'Added 20 new products!' as result;
