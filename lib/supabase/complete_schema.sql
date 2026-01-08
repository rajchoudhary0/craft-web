-- ============================================
-- THE VYBE STORE - COMPLETE SUPABASE SCHEMA
-- ============================================
-- Run this in Supabase SQL Editor to create all tables

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- 1. PROFILES (Extends Auth)
-- ============================================
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  role text default 'customer' check (role in ('customer', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can insert their own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- ============================================
-- 2. CATEGORIES
-- ============================================
create table if not exists categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  slug text not null unique,
  description text,
  image_url text,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table categories enable row level security;

create policy "Categories are viewable by everyone"
  on categories for select using (true);

create policy "Admins can manage categories"
  on categories for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ============================================
-- 3. PRODUCTS
-- ============================================
create table if not exists products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique,
  description text,
  price numeric not null,
  original_price numeric,
  stock int default 0,
  category_id uuid references categories(id) on delete set null,
  is_featured boolean default false,
  is_new boolean default false,
  is_active boolean default true,
  rating numeric default 0,
  reviews_count int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table products enable row level security;

create policy "Products are viewable by everyone"
  on products for select using (is_active = true or exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can manage products"
  on products for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ============================================
-- 4. PRODUCT IMAGES
-- ============================================
create table if not exists product_images (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references products(id) on delete cascade not null,
  image_url text not null,
  sort_order int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table product_images enable row level security;

create policy "Product images are viewable by everyone"
  on product_images for select using (true);

create policy "Admins can manage product images"
  on product_images for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ============================================
-- 5. TAGS
-- ============================================
create table if not exists tags (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists product_tags (
  product_id uuid references products(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (product_id, tag_id)
);

alter table tags enable row level security;
alter table product_tags enable row level security;

create policy "Tags are viewable by everyone"
  on tags for select using (true);

create policy "Admins can manage tags"
  on tags for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "Product tags are viewable by everyone"
  on product_tags for select using (true);

create policy "Admins can manage product tags"
  on product_tags for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ============================================
-- 6. CARTS (User-bound)
-- ============================================
create table if not exists carts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade unique,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists cart_items (
  id uuid default uuid_generate_v4() primary key,
  cart_id uuid references carts(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  quantity int not null default 1 check (quantity > 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(cart_id, product_id)
);

alter table carts enable row level security;
alter table cart_items enable row level security;

create policy "Users can manage their own cart"
  on carts for all using (auth.uid() = user_id);

create policy "Users can manage their own cart items"
  on cart_items for all
  using (exists (select 1 from carts where id = cart_items.cart_id and user_id = auth.uid()));

-- ============================================
-- 7. ORDERS
-- ============================================
create table if not exists orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete set null,
  status text check (status in ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')) default 'pending',
  total_amount numeric not null,
  payment_intent_id text,
  stripe_session_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  quantity int not null,
  price_at_purchase numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists shipping_addresses (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade unique,
  full_name text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'India',
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table orders enable row level security;
alter table order_items enable row level security;
alter table shipping_addresses enable row level security;

create policy "Users can view their own orders"
  on orders for select using (auth.uid() = user_id);

create policy "Admins can view all orders"
  on orders for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "Users can create orders"
  on orders for insert with check (auth.uid() = user_id);

create policy "Admins can update orders"
  on orders for update
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "Users can view their own order items"
  on order_items for select
  using (exists (select 1 from orders where id = order_items.order_id and user_id = auth.uid()));

create policy "Admins can view all order items"
  on order_items for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "Users can create order items"
  on order_items for insert
  with check (exists (select 1 from orders where id = order_items.order_id and user_id = auth.uid()));

create policy "Users can view their own shipping addresses"
  on shipping_addresses for select
  using (exists (select 1 from orders where id = shipping_addresses.order_id and user_id = auth.uid()));

create policy "Admins can view all shipping addresses"
  on shipping_addresses for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "Users can create shipping addresses"
  on shipping_addresses for insert
  with check (exists (select 1 from orders where id = shipping_addresses.order_id and user_id = auth.uid()));

-- ============================================
-- 8. REVIEWS
-- ============================================
create table if not exists reviews (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  rating int not null check (rating >= 1 and rating <= 5),
  title text,
  comment text,
  is_approved boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, product_id)
);

alter table reviews enable row level security;

create policy "Approved reviews are viewable by everyone"
  on reviews for select
  using (is_approved = true or auth.uid() = user_id or exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "Users can create reviews"
  on reviews for insert with check (auth.uid() = user_id);

create policy "Users can update their own reviews"
  on reviews for update using (auth.uid() = user_id);

create policy "Admins can manage reviews"
  on reviews for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ============================================
-- 9. SITE CONTENT (CMS)
-- ============================================
create table if not exists site_content (
  id uuid default uuid_generate_v4() primary key,
  key text not null unique,
  value jsonb not null default '{}',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table site_content enable row level security;

create policy "Site content is viewable by everyone"
  on site_content for select using (true);

create policy "Admins can update site content"
  on site_content for update
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Insert default content keys
insert into site_content (key, value) values
  ('hero', '{"title": "Handcrafted with Love", "subtitle": "Discover unique artisan creations", "cta_text": "Shop Now", "cta_link": "/products"}'),
  ('about', '{"title": "About The Vybe Store", "content": "We create beautiful handmade products with passion and care.", "image_url": ""}'),
  ('footer', '{"tagline": "Handcrafted by Neha Kumari", "copyright": "© 2024 The Vybe Store"}'),
  ('newsletter', '{"title": "Join Our Newsletter", "subtitle": "Get updates on new arrivals and exclusive offers"}')
on conflict (key) do nothing;

-- ============================================
-- 10. NEWSLETTER SUBSCRIBERS
-- ============================================
create table if not exists newsletter_subscribers (
  id uuid default uuid_generate_v4() primary key,
  email text not null unique,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table newsletter_subscribers enable row level security;

create policy "Admins can view subscribers"
  on newsletter_subscribers for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "Anyone can subscribe"
  on newsletter_subscribers for insert with check (true);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    'customer'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-create cart on first cart item
create or replace function public.get_or_create_cart()
returns uuid as $$
declare
  cart_uuid uuid;
begin
  select id into cart_uuid from carts where user_id = auth.uid();
  if cart_uuid is null then
    insert into carts (user_id) values (auth.uid()) returning id into cart_uuid;
  end if;
  return cart_uuid;
end;
$$ language plpgsql security definer;

-- Update product rating when review is approved
create or replace function public.update_product_rating()
returns trigger as $$
begin
  update products
  set 
    rating = (select coalesce(avg(rating), 0) from reviews where product_id = new.product_id and is_approved = true),
    reviews_count = (select count(*) from reviews where product_id = new.product_id and is_approved = true)
  where id = new.product_id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_review_change on reviews;
create trigger on_review_change
  after insert or update on reviews
  for each row execute procedure public.update_product_rating();

-- Update timestamps
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_products_updated_at on products;
create trigger update_products_updated_at
  before update on products
  for each row execute procedure public.update_updated_at();

drop trigger if exists update_orders_updated_at on orders;
create trigger update_orders_updated_at
  before update on orders
  for each row execute procedure public.update_updated_at();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_featured on products(is_featured) where is_featured = true;
create index if not exists idx_products_active on products(is_active) where is_active = true;
create index if not exists idx_orders_user on orders(user_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_cart_items_cart on cart_items(cart_id);
create index if not exists idx_reviews_product on reviews(product_id);
create index if not exists idx_reviews_approved on reviews(is_approved) where is_approved = true;
