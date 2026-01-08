-- ============================================
-- SEED DATA FOR THE VYBE STORE
-- ============================================
-- Run this AFTER complete_schema.sql

-- ============================================
-- CATEGORIES
-- ============================================
insert into categories (name, slug, description, is_active, sort_order) values
  ('Ceramics', 'ceramics', 'Handcrafted pottery and ceramic pieces', true, 1),
  ('Textiles', 'textiles', 'Woven and handmade fabric items', true, 2),
  ('Jewelry', 'jewelry', 'Artisan jewelry and accessories', true, 3),
  ('Home Decor', 'home-decor', 'Decorative items for your home', true, 4),
  ('Candles', 'candles', 'Hand-poured scented candles', true, 5),
  ('Art', 'art', 'Original artwork and prints', true, 6)
on conflict (slug) do nothing;

-- ============================================
-- TAGS
-- ============================================
insert into tags (name) values
  ('best-seller'),
  ('new'),
  ('limited-edition'),
  ('handmade'),
  ('eco-friendly'),
  ('gift')
on conflict (name) do nothing;

-- ============================================
-- PRODUCTS
-- ============================================
insert into products (name, slug, description, price, original_price, stock, category_id, is_featured, is_new, is_active) values
  (
    'Rustic Ceramic Vase',
    'rustic-ceramic-vase',
    'A beautifully handcrafted ceramic vase with an earthy, rustic finish. Perfect for dried flowers or as a standalone decorative piece.',
    2499,
    2999,
    15,
    (select id from categories where slug = 'ceramics'),
    true,
    false,
    true
  ),
  (
    'Handwoven Cotton Throw',
    'handwoven-cotton-throw',
    'Soft and cozy handwoven cotton throw blanket. Made with 100% organic cotton in warm, neutral tones.',
    3499,
    null,
    20,
    (select id from categories where slug = 'textiles'),
    true,
    true,
    true
  ),
  (
    'Minimalist Gold Earrings',
    'minimalist-gold-earrings',
    'Elegant minimalist earrings crafted from recycled gold. Lightweight and perfect for everyday wear.',
    1299,
    1499,
    30,
    (select id from categories where slug = 'jewelry'),
    false,
    true,
    true
  ),
  (
    'Macrame Wall Hanging',
    'macrame-wall-hanging',
    'Intricate macrame wall hanging made with natural cotton rope. Adds bohemian charm to any space.',
    1899,
    null,
    12,
    (select id from categories where slug = 'home-decor'),
    true,
    false,
    true
  ),
  (
    'Lavender Soy Candle',
    'lavender-soy-candle',
    'Hand-poured soy candle with natural lavender essential oil. Burns for 40+ hours.',
    799,
    899,
    50,
    (select id from categories where slug = 'candles'),
    false,
    false,
    true
  ),
  (
    'Abstract Watercolor Print',
    'abstract-watercolor-print',
    'Limited edition print of an original abstract watercolor painting. Printed on archival quality paper.',
    2199,
    null,
    8,
    (select id from categories where slug = 'art'),
    true,
    true,
    true
  ),
  (
    'Terracotta Planter Set',
    'terracotta-planter-set',
    'Set of 3 hand-thrown terracotta planters in varying sizes. Perfect for succulents and small plants.',
    1599,
    1899,
    25,
    (select id from categories where slug = 'ceramics'),
    false,
    false,
    true
  ),
  (
    'Embroidered Cushion Cover',
    'embroidered-cushion-cover',
    'Beautifully embroidered cushion cover with traditional motifs. Made from organic cotton.',
    999,
    null,
    40,
    (select id from categories where slug = 'textiles'),
    false,
    true,
    true
  )
on conflict (slug) do nothing;

-- ============================================
-- PRODUCT IMAGES
-- ============================================
insert into product_images (product_id, image_url, sort_order)
select p.id, 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800', 0
from products p where p.slug = 'rustic-ceramic-vase'
on conflict do nothing;

insert into product_images (product_id, image_url, sort_order)
select p.id, 'https://images.unsplash.com/photo-1544457070-4cd773b4b1d2?w=800', 0
from products p where p.slug = 'handwoven-cotton-throw'
on conflict do nothing;

insert into product_images (product_id, image_url, sort_order)
select p.id, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800', 0
from products p where p.slug = 'minimalist-gold-earrings'
on conflict do nothing;

insert into product_images (product_id, image_url, sort_order)
select p.id, 'https://images.unsplash.com/photo-1522758971460-1d21eed7dc1d?w=800', 0
from products p where p.slug = 'macrame-wall-hanging'
on conflict do nothing;

insert into product_images (product_id, image_url, sort_order)
select p.id, 'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=800', 0
from products p where p.slug = 'lavender-soy-candle'
on conflict do nothing;

insert into product_images (product_id, image_url, sort_order)
select p.id, 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800', 0
from products p where p.slug = 'abstract-watercolor-print'
on conflict do nothing;

insert into product_images (product_id, image_url, sort_order)
select p.id, 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800', 0
from products p where p.slug = 'terracotta-planter-set'
on conflict do nothing;

insert into product_images (product_id, image_url, sort_order)
select p.id, 'https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?w=800', 0
from products p where p.slug = 'embroidered-cushion-cover'
on conflict do nothing;

-- ============================================
-- PRODUCT TAGS
-- ============================================
insert into product_tags (product_id, tag_id)
select p.id, t.id from products p, tags t 
where p.slug = 'rustic-ceramic-vase' and t.name = 'best-seller'
on conflict do nothing;

insert into product_tags (product_id, tag_id)
select p.id, t.id from products p, tags t 
where p.slug = 'handwoven-cotton-throw' and t.name = 'new'
on conflict do nothing;

insert into product_tags (product_id, tag_id)
select p.id, t.id from products p, tags t 
where p.slug = 'abstract-watercolor-print' and t.name = 'limited-edition'
on conflict do nothing;
