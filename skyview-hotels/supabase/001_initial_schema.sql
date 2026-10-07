-- SKYVIEW HOTELS / Supabase PostgreSQL
create extension if not exists pgcrypto;

do $$ begin create type public.user_role as enum ('guest','receptionist','manager','administrator'); exception when duplicate_object then null; end $$;
do $$ begin create type public.booking_status as enum ('pending_payment','paid','confirmed','checked_in','checked_out','cancelled','refunded'); exception when duplicate_object then null; end $$;
do $$ begin create type public.payment_status as enum ('pending','success','failed','reversed','refunded'); exception when duplicate_object then null; end $$;
do $$ begin create type public.room_status as enum ('available','occupied','maintenance','blocked'); exception when duplicate_object then null; end $$;

create table if not exists public.profiles(id uuid primary key references auth.users(id) on delete cascade,full_name text,phone text,role public.user_role not null default 'guest',avatar_url text,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.rooms(id uuid primary key default gen_random_uuid(),name text not null,description text,price_per_night numeric(12,2) not null check(price_per_night>=0),capacity int not null default 2 check(capacity>0),image_url text,amenities jsonb not null default '[]'::jsonb,status public.room_status not null default 'available',is_active boolean not null default true,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.bookings(id uuid primary key default gen_random_uuid(),user_id uuid references public.profiles(id) on delete set null,room_id uuid not null references public.rooms(id),booking_reference text unique not null,check_in date not null,check_out date not null,guests int not null default 1,guest_name text not null,guest_email text not null,guest_phone text,nightly_rate numeric(12,2) not null,total_amount numeric(12,2) not null,booking_status public.booking_status not null default 'pending_payment',payment_status public.payment_status not null default 'pending',paystack_reference text unique,notes text,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),constraint valid_dates check(check_out>check_in));
create table if not exists public.payments(id uuid primary key default gen_random_uuid(),booking_id uuid not null references public.bookings(id) on delete cascade,reference text unique not null,provider text not null default 'paystack',amount numeric(12,2) not null,currency text not null default 'NGN',status public.payment_status not null default 'pending',provider_transaction_id bigint,channel text,paid_at timestamptz,raw_response jsonb,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.booking_events(id uuid primary key default gen_random_uuid(),booking_id uuid not null references public.bookings(id) on delete cascade,event_type text not null,payload jsonb not null default '{}'::jsonb,created_by uuid references public.profiles(id),created_at timestamptz not null default now());
create table if not exists public.services(id uuid primary key default gen_random_uuid(),name text not null,description text,price numeric(12,2) not null default 0,is_active boolean not null default true);
create table if not exists public.service_requests(id uuid primary key default gen_random_uuid(),booking_id uuid not null references public.bookings(id) on delete cascade,service_id uuid not null references public.services(id),quantity int not null default 1,notes text,status text not null default 'requested',created_at timestamptz not null default now());

create index if not exists bookings_room_dates_idx on public.bookings(room_id,check_in,check_out);
create index if not exists bookings_user_idx on public.bookings(user_id,created_at desc);
create index if not exists payments_booking_idx on public.payments(booking_id);

create or replace function public.is_staff() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.profiles where id=auth.uid() and role in ('receptionist','manager','administrator')); $$;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='administrator'); $$;

create or replace function public.room_is_available(p_room_id uuid,p_check_in date,p_check_out date,p_ignore_booking uuid default null) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.rooms r where r.id=p_room_id and r.is_active=true and r.status <> 'maintenance') and not exists(select 1 from public.bookings b where b.room_id=p_room_id and b.id is distinct from p_ignore_booking and b.booking_status in ('pending_payment','paid','confirmed','checked_in') and b.check_in < p_check_out and b.check_out > p_check_in);
$$;

alter table public.profiles enable row level security; alter table public.rooms enable row level security; alter table public.bookings enable row level security; alter table public.payments enable row level security; alter table public.booking_events enable row level security; alter table public.services enable row level security; alter table public.service_requests enable row level security;

drop policy if exists profiles_self on public.profiles; create policy profiles_self on public.profiles for select using(id=auth.uid() or public.is_staff());
drop policy if exists rooms_public_read on public.rooms; create policy rooms_public_read on public.rooms for select using(is_active=true or public.is_staff());
drop policy if exists rooms_staff_write on public.rooms; create policy rooms_staff_write on public.rooms for all using(public.is_staff()) with check(public.is_staff());
drop policy if exists bookings_owner_read on public.bookings; create policy bookings_owner_read on public.bookings for select using(user_id=auth.uid() or public.is_staff());
drop policy if exists bookings_owner_insert on public.bookings; create policy bookings_owner_insert on public.bookings for insert with check(user_id=auth.uid() or user_id is null);
drop policy if exists bookings_staff_write on public.bookings; create policy bookings_staff_write on public.bookings for update using(public.is_staff()) with check(public.is_staff());
drop policy if exists payments_owner_read on public.payments; create policy payments_owner_read on public.payments for select using(exists(select 1 from public.bookings b where b.id=booking_id and (b.user_id=auth.uid() or public.is_staff())));
drop policy if exists events_staff_read on public.booking_events; create policy events_staff_read on public.booking_events for select using(public.is_staff());
drop policy if exists services_public_read on public.services; create policy services_public_read on public.services for select using(is_active=true or public.is_staff());
drop policy if exists service_staff_all on public.service_requests; create policy service_staff_all on public.service_requests for all using(public.is_staff()) with check(public.is_staff());

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.profiles(id,full_name) values(new.id,coalesce(new.raw_user_meta_data->>'full_name',split_part(new.email,'@',1))) on conflict(id) do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users; create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

insert into public.rooms(name,description,price_per_night,capacity,image_url,amenities) values
('Deluxe King','Spacious king room with premium bedding and a refined work area.',95000,2,'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1000','["King bed","Wi-Fi","Breakfast","Smart TV"]'),
('Executive Suite','Separate living area with elevated city views.',145000,3,'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000','["King bed","Lounge","Wi-Fi","Breakfast","Mini bar"]'),
('Presidential Suite','Our signature suite for exceptional stays and special occasions.',280000,4,'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000','["King bed","Living room","Dining","Wi-Fi","Breakfast","Butler"]')
on conflict do nothing;
