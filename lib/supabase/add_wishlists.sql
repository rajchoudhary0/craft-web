-- ============================================
-- WISHLISTS TABLES
-- ============================================
-- Run this in Supabase SQL Editor

-- Enable UUID extension if not already
create extension if not exists "uuid-ossp";

-- Wishlists (one per user)
create table if not exists wishlists (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade unique not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Wishlist items
create table if not exists wishlist_items (
  id uuid default uuid_generate_v4() primary key,
  wishlist_id uuid references wishlists(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(wishlist_id, product_id)
);

-- Enable RLS
alter table wishlists enable row level security;
alter table wishlist_items enable row level security;

-- Drop existing policies if any
drop policy if exists "Users can manage their own wishlist" on wishlists;
drop policy if exists "Users can manage their own wishlist items" on wishlist_items;

-- RLS Policies
create policy "Users can manage their own wishlist"
  on wishlists for all
  using (auth.uid() = user_id);

create policy "Users can manage their own wishlist items"
  on wishlist_items for all
  using (exists (
    select 1 from wishlists 
    where wishlists.id = wishlist_items.wishlist_id 
    and wishlists.user_id = auth.uid()
  ));

-- Indexes
create index if not exists idx_wishlist_items_wishlist on wishlist_items(wishlist_id);
create index if not exists idx_wishlist_items_product on wishlist_items(product_id);

-- Helper function to get or create wishlist
create or replace function public.get_or_create_wishlist()
returns uuid as $$
declare
  wishlist_uuid uuid;
begin
  select id into wishlist_uuid from wishlists where user_id = auth.uid();
  if wishlist_uuid is null then
    insert into wishlists (user_id) values (auth.uid()) returning id into wishlist_uuid;
  end if;
  return wishlist_uuid;
end;
$$ language plpgsql security definer;

-- Success message
select 'Wishlists tables created successfully!' as result;
