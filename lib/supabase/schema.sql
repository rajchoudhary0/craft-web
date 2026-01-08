-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES Table (Extends Auth)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  role text default 'customer' check (role in ('customer', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 2. PRODUCTS Table
create table products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price numeric not null,
  original_price numeric,
  stock int default 0,
  images text[],
  category text,
  tags text[],
  rating numeric default 0,
  reviews_count int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table products enable row level security;

-- Policies
create policy "Products are viewable by everyone"
  on products for select
  using ( true );

create policy "Admins can insert products"
  on products for insert
  with check ( exists ( select 1 from profiles where id = auth.uid() and role = 'admin' ) );

create policy "Admins can update products"
  on products for update
  using ( exists ( select 1 from profiles where id = auth.uid() and role = 'admin' ) );

create policy "Admins can delete products"
  on products for delete
  using ( exists ( select 1 from profiles where id = auth.uid() and role = 'admin' ) );


-- 3. ORDERS Table
create table orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id),
  status text check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')) default 'pending',
  total numeric not null,
  stripe_session_id text,
  shipping_address jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table orders enable row level security;

-- Policies
create policy "Users can view their own orders"
  on orders for select
  using ( auth.uid() = user_id );

create policy "Admins can view all orders"
  on orders for select
  using ( exists ( select 1 from profiles where id = auth.uid() and role = 'admin' ) );

create policy "Users can create orders"
  on orders for insert
  with check ( auth.uid() = user_id );

create policy "Admins can update orders"
  on orders for update
  using ( exists ( select 1 from profiles where id = auth.uid() and role = 'admin' ) );


-- 4. ORDER ITEMS Table
create table order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  quantity int not null,
  price_at_purchase numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table order_items enable row level security;

-- Policies
create policy "Users can view their own order items"
  on order_items for select
  using ( exists ( select 1 from orders where id = order_items.order_id and user_id = auth.uid() ) );

create policy "Admins can view all order items"
  on order_items for select
  using ( exists ( select 1 from profiles where id = auth.uid() and role = 'admin' ) );

create policy "Users can create order items"
  on order_items for insert
  with check ( exists ( select 1 from orders where id = order_items.order_id and user_id = auth.uid() ) );


-- TRIGGER: Create Profile on Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'customer');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
