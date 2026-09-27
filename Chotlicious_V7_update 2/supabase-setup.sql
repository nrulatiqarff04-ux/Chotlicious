-- Chotlicious V7 — Supabase setup
-- 1) Create a Supabase project.
-- 2) Run this SQL in SQL Editor.
-- 3) In Authentication > Users, create the seller login email/password.
-- 4) Copy that user's UUID and replace SELLER_USER_UUID below, then run the final INSERT.
-- 5) Put the project's URL + publishable/anon key into config.js.

create extension if not exists pgcrypto;

create table if not exists public.seller_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  phone text not null,
  email text not null,
  postcode text not null,
  delivery_address text not null,
  payment_method text not null,
  items jsonb not null,
  total_jars integer not null check (total_jars > 0),
  subtotal numeric(10,2) not null check (subtotal >= 0),
  total numeric(10,2) not null check (total >= 0),
  status text not null default 'New' check (status in ('New','Preparing','Completed','Cancelled')),
  created_at timestamptz not null default now()
);

alter table public.seller_users enable row level security;
alter table public.orders enable row level security;

revoke all on table public.seller_users from anon, authenticated;
revoke all on table public.orders from anon, authenticated;

grant select on table public.seller_users to authenticated;
grant insert on table public.orders to anon;
grant select, update on table public.orders to authenticated;

create policy "Seller can view own seller record"
on public.seller_users for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Anyone can place a demo order"
on public.orders for insert
to anon
with check (true);

create policy "Only registered sellers can view orders"
on public.orders for select
to authenticated
using (exists (
  select 1 from public.seller_users s
  where s.user_id = (select auth.uid())
));

create policy "Only registered sellers can update order status"
on public.orders for update
to authenticated
using (exists (
  select 1 from public.seller_users s
  where s.user_id = (select auth.uid())
))
with check (exists (
  select 1 from public.seller_users s
  where s.user_id = (select auth.uid())
));

-- IMPORTANT: replace these placeholders with the actual seller auth user's UUID/email.
-- insert into public.seller_users (user_id, email)
-- values ('SELLER_USER_UUID', 'your-seller-email@example.com');
