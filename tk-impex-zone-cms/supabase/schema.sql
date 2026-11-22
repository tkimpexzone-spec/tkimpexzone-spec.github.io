-- TK Impex Zone CMS schema
-- Run this complete script in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'editor' check (role in ('admin','editor')),
  created_at timestamptz not null default now()
);

create table if not exists public.divisions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  division_id uuid not null references public.divisions(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique(division_id,slug)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  division_id uuid not null references public.divisions(id),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  origin text,
  grades text,
  packaging text,
  specifications jsonb not null default '{}'::jsonb,
  cover_image_url text,
  seo_title text,
  seo_description text,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  division_id uuid references public.divisions(id) on delete set null,
  heading text not null,
  subheading text,
  image_url text,
  button_text text,
  button_link text,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company_name text,
  email text not null,
  phone text not null,
  country text,
  product_id uuid references public.products(id) on delete set null,
  product_name text,
  quantity text,
  message text not null,
  status text not null default 'new' check (status in ('new','contacted','quotation_sent','converted','closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  setting_key text primary key,
  setting_value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists products_published_sort_idx on public.products(is_published,sort_order);
create index if not exists banners_published_sort_idx on public.banners(is_published,sort_order);
create index if not exists enquiries_created_idx on public.enquiries(created_at desc);

-- Keep updated_at current.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();
drop trigger if exists banners_updated_at on public.banners;
create trigger banners_updated_at before update on public.banners for each row execute function public.set_updated_at();

-- Profile creation: newly registered auth users default to editor.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id,full_name,role)
  values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),'editor')
  on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.is_admin_or_editor()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id=auth.uid() and role in ('admin','editor'));
$$;

alter table public.profiles enable row level security;
alter table public.divisions enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.banners enable row level security;
alter table public.enquiries enable row level security;
alter table public.site_settings enable row level security;

-- Public read access only to published catalogue content.
drop policy if exists "Public read divisions" on public.divisions;
create policy "Public read divisions" on public.divisions for select using (true);
drop policy if exists "Public read categories" on public.categories;
create policy "Public read categories" on public.categories for select using (true);
drop policy if exists "Public read published products" on public.products;
create policy "Public read published products" on public.products for select using (is_published or public.is_admin_or_editor());
drop policy if exists "Public read images of published products" on public.product_images;
create policy "Public read images of published products" on public.product_images for select using (exists(select 1 from public.products p where p.id=product_id and (p.is_published or public.is_admin_or_editor())));
drop policy if exists "Public read published banners" on public.banners;
create policy "Public read published banners" on public.banners for select using (is_published or public.is_admin_or_editor());
drop policy if exists "Admin read profiles" on public.profiles;
create policy "Admin read profiles" on public.profiles for select using (id=auth.uid() or public.is_admin_or_editor());
-- Profile role changes are intentionally not allowed from the public client.
-- Assign/promote administrators through the Supabase SQL editor only.

-- Admin/editor writes.
do $$ declare t text; begin
 foreach t in array array['divisions','categories','products','product_images','banners','site_settings'] loop
   execute format('drop policy if exists "Admin manage %1$s" on public.%1$s',t);
   execute format('create policy "Admin manage %1$s" on public.%1$s for all using (public.is_admin_or_editor()) with check (public.is_admin_or_editor())',t);
 end loop;
end $$;

-- Public can submit enquiries; only admin/editor can read or update them.
drop policy if exists "Public submit enquiry" on public.enquiries;
create policy "Public submit enquiry" on public.enquiries for insert with check (
  length(trim(name)) between 1 and 120 and
  length(trim(email)) between 3 and 200 and
  length(trim(phone)) between 3 and 40 and
  length(trim(message)) between 1 and 3000
);
drop policy if exists "Admin manage enquiries" on public.enquiries;
create policy "Admin manage enquiries" on public.enquiries for select using (public.is_admin_or_editor());
drop policy if exists "Admin update enquiries" on public.enquiries;
create policy "Admin update enquiries" on public.enquiries for update using (public.is_admin_or_editor()) with check (public.is_admin_or_editor());
drop policy if exists "Admin delete enquiries" on public.enquiries;
create policy "Admin delete enquiries" on public.enquiries for delete using (public.is_admin_or_editor());

-- Storage buckets. Public reads; authenticated admin/editor uploads and management.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values
 ('website-banners','website-banners',true,10485760,array['image/jpeg','image/png','image/webp']),
 ('product-images','product-images',true,10485760,array['image/jpeg','image/png','image/webp']),
 ('site-assets','site-assets',true,5242880,array['image/jpeg','image/png','image/webp','image/svg+xml'])
on conflict(id) do update set public=true;

drop policy if exists "Public view CMS images" on storage.objects;
create policy "Public view CMS images" on storage.objects for select using (bucket_id in ('website-banners','product-images','site-assets'));
drop policy if exists "Admins upload CMS images" on storage.objects;
create policy "Admins upload CMS images" on storage.objects for insert to authenticated with check (bucket_id in ('website-banners','product-images','site-assets') and public.is_admin_or_editor());
drop policy if exists "Admins update CMS images" on storage.objects;
create policy "Admins update CMS images" on storage.objects for update to authenticated using (bucket_id in ('website-banners','product-images','site-assets') and public.is_admin_or_editor()) with check (bucket_id in ('website-banners','product-images','site-assets') and public.is_admin_or_editor());
drop policy if exists "Admins delete CMS images" on storage.objects;
create policy "Admins delete CMS images" on storage.objects for delete to authenticated using (bucket_id in ('website-banners','product-images','site-assets') and public.is_admin_or_editor());

-- Initial divisions.
insert into public.divisions(name,slug,description,sort_order) values
 ('Agriculture','agriculture','Agricultural commodities and food products.',1),
 ('Stone & Minerals','stone-minerals','Natural stones and mineral resources.',2)
on conflict(slug) do nothing;

-- Starter categories. Edit/add these in SQL or through future category-management enhancement.
insert into public.categories(division_id,name,slug,sort_order)
select d.id,x.name,x.slug,x.sort_order from public.divisions d
cross join (values ('Rice','rice',1),('Red Chilli','red-chilli',2),('Green Chilli','green-chilli',3),('Onions','onions',4)) as x(name,slug,sort_order)
where d.slug='agriculture' on conflict(division_id,slug) do nothing;
insert into public.categories(division_id,name,slug,sort_order)
select d.id,x.name,x.slug,x.sort_order from public.divisions d
cross join (values ('Granite','granite',1),('Marble','marble',2),('Limestone','limestone',3),('Other Minerals','other-minerals',4)) as x(name,slug,sort_order)
where d.slug='stone-minerals' on conflict(division_id,slug) do nothing;

-- IMPORTANT: after creating your first admin user in Authentication > Users,
-- promote that account using the SQL below (replace with its auth user UUID):
-- update public.profiles set role='admin' where id='YOUR-AUTH-USER-UUID';
