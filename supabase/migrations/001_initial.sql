-- ============================================================
-- Shoemaker Association Billing App — Initial Schema
-- Run this in your Supabase SQL editor before starting the app.
-- ============================================================

-- ── Profiles (mirrors Supabase auth.users) ──────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users on delete cascade,
  full_name   text not null,
  email       text not null,
  role        text not null default 'admin' check (role in ('admin')),
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- Auto-create a profile row when a user signs up
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ── Members ─────────────────────────────────────────────────
create table if not exists members (
  id                 uuid primary key default gen_random_uuid(),
  full_name          text not null,
  phone              text not null,
  address            text,
  membership_number  text not null unique,
  active             boolean not null default true,
  created_at         timestamptz not null default now()
);

-- ── Bill Types ───────────────────────────────────────────────
create table if not exists bill_types (
  id             uuid primary key default gen_random_uuid(),
  name           text not null unique,
  default_amount numeric(10,2),
  created_at     timestamptz not null default now()
);

-- Seed default bill types
insert into bill_types (name, default_amount) values
  ('Security Bill',    0),
  ('LAWMA',            0),
  ('Association Dues', 0)
on conflict (name) do nothing;

-- ── Monthly Bills ────────────────────────────────────────────
create table if not exists monthly_bills (
  id            uuid primary key default gen_random_uuid(),
  member_id     uuid not null references members on delete cascade,
  bill_type_id  uuid not null references bill_types on delete restrict,
  year          integer not null check (year >= 2020),
  month         integer not null check (month between 1 and 12),
  amount        numeric(10,2) not null default 0,
  paid          boolean not null default false,
  paid_date     date,
  notes         text,
  recorded_by   uuid references profiles on delete set null,
  created_at    timestamptz not null default now(),
  unique (member_id, bill_type_id, year, month)
);

-- ── Row-Level Security ───────────────────────────────────────
alter table profiles     enable row level security;
alter table members      enable row level security;
alter table bill_types   enable row level security;
alter table monthly_bills enable row level security;

-- Admins can do everything
create or replace function is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  )
$$;

create policy "Admins full access — profiles"
  on profiles for all using (is_admin());

create policy "Admins full access — members"
  on members for all using (is_admin());

create policy "Admins full access — bill_types"
  on bill_types for all using (is_admin());

create policy "Admins full access — monthly_bills"
  on monthly_bills for all using (is_admin());
