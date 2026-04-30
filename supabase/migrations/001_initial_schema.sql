-- =============================================================================
-- Migration: 001_initial_schema
-- Description: Full schema for financial planning app
-- =============================================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- =============================================================================
-- TABLES
-- =============================================================================

-- User profiles (1:1 with auth.users)
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  created_at  timestamptz not null default now()
);

-- Banks / payment sources
-- user_id = NULL → public preset (visible to all users, not editable by users)
-- user_id = <uuid> → user-created custom bank
create table public.banks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users (id) on delete cascade,  -- nullable for public
  name        text not null,
  type        text not null check (type in ('bank', 'ewallet', 'cash', 'credit')),
  color       text,
  created_at  timestamptz not null default now()
);

-- Expense categories
-- user_id = NULL → public preset (visible to all users, not editable by users)
-- user_id = <uuid> → user-created custom category
create table public.expense_categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users (id) on delete cascade,  -- nullable for public
  name        text not null,
  color       text,
  "group"     text not null check ("group" in ('needs', 'wants', 'obligations')),
  created_at  timestamptz not null default now()
);

-- Monthly income entries
create table public.incomes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  month       date not null,  -- stored as first day of month, e.g. 2026-04-01
  source      text not null,
  amount      numeric(15, 2) not null check (amount >= 0),
  note        text,
  created_at  timestamptz not null default now()
);

-- Daily expense transactions
create table public.expenses (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  date            date not null,
  category_id     uuid references public.expense_categories (id) on delete set null,
  bank_id         uuid references public.banks (id) on delete set null,
  amount          numeric(15, 2) not null check (amount >= 0),
  description     text not null,
  status          text not null default 'paid' check (status in ('planned', 'paid', 'pending')),
  created_at      timestamptz not null default now()
);

-- Monthly budgets per category
create table public.budgets (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  month             date not null,  -- first day of month
  category_id       uuid references public.expense_categories (id) on delete cascade,
  estimated_amount  numeric(15, 2) not null check (estimated_amount >= 0),
  created_at        timestamptz not null default now(),
  unique (user_id, month, category_id)
);

-- Saving goals (multi-goal per user)
create table public.saving_goals (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  name            text not null,
  target_amount   numeric(15, 2) check (target_amount >= 0),
  target_date     date,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

-- Saving transactions (in/out per goal)
create table public.saving_transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  goal_id     uuid not null references public.saving_goals (id) on delete cascade,
  date        date not null,
  type        text not null check (type in ('in', 'out')),
  amount      numeric(15, 2) not null check (amount > 0),
  note        text,
  created_at  timestamptz not null default now()
);

-- Installments / debts
create table public.installments (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  name             text not null,
  total_amount     numeric(15, 2) not null check (total_amount > 0),
  monthly_amount   numeric(15, 2) not null check (monthly_amount > 0),
  tenor            integer check (tenor > 0),  -- number of months, nullable
  start_date       date not null,
  bank_id          uuid references public.banks (id) on delete set null,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now()
);

-- Auto-generated installment schedules (one row per month/due date)
create table public.installment_schedules (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  installment_id   uuid not null references public.installments (id) on delete cascade,
  due_date         date not null,
  expected_amount  numeric(15, 2) not null check (expected_amount > 0),
  created_at       timestamptz not null default now()
);

-- Manual installment payments (source of truth for "already paid")
create table public.installment_payments (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  installment_id   uuid not null references public.installments (id) on delete cascade,
  schedule_id      uuid references public.installment_schedules (id) on delete set null,
  paid_date        date not null,
  amount           numeric(15, 2) not null check (amount > 0),
  note             text,
  created_at       timestamptz not null default now()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

create index on public.banks (user_id);
create index on public.expense_categories (user_id);
create index on public.incomes (user_id, month);
create index on public.expenses (user_id, date);
create index on public.expenses (user_id, category_id);
create index on public.budgets (user_id, month);
create index on public.saving_transactions (user_id, goal_id);
create index on public.installment_schedules (user_id, due_date);
create index on public.installment_payments (user_id, installment_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

alter table public.profiles              enable row level security;
alter table public.banks                 enable row level security;
alter table public.expense_categories    enable row level security;
alter table public.incomes               enable row level security;
alter table public.expenses              enable row level security;
alter table public.budgets               enable row level security;
alter table public.saving_goals          enable row level security;
alter table public.saving_transactions   enable row level security;
alter table public.installments          enable row level security;
alter table public.installment_schedules enable row level security;
alter table public.installment_payments  enable row level security;

-- Profiles: own only
create policy "users can manage own profiles"
  on public.profiles for all using (auth.uid() = id);

-- Banks: read public (user_id IS NULL) + manage own
create policy "users can read public banks"
  on public.banks for select using (user_id is null or auth.uid() = user_id);

create policy "users can insert own banks"
  on public.banks for insert with check (auth.uid() = user_id);

create policy "users can update own banks"
  on public.banks for update using (auth.uid() = user_id);

create policy "users can delete own banks"
  on public.banks for delete using (auth.uid() = user_id);

-- Expense categories: read public (user_id IS NULL) + manage own
create policy "users can read public expense_categories"
  on public.expense_categories for select using (user_id is null or auth.uid() = user_id);

create policy "users can insert own expense_categories"
  on public.expense_categories for insert with check (auth.uid() = user_id);

create policy "users can update own expense_categories"
  on public.expense_categories for update using (auth.uid() = user_id);

create policy "users can delete own expense_categories"
  on public.expense_categories for delete using (auth.uid() = user_id);

-- Remaining tables: own only
create policy "users can manage own incomes"
  on public.incomes for all using (auth.uid() = user_id);

create policy "users can manage own expenses"
  on public.expenses for all using (auth.uid() = user_id);

create policy "users can manage own budgets"
  on public.budgets for all using (auth.uid() = user_id);

create policy "users can manage own saving_goals"
  on public.saving_goals for all using (auth.uid() = user_id);

create policy "users can manage own saving_transactions"
  on public.saving_transactions for all using (auth.uid() = user_id);

create policy "users can manage own installments"
  on public.installments for all using (auth.uid() = user_id);

create policy "users can manage own installment_schedules"
  on public.installment_schedules for all using (auth.uid() = user_id);

create policy "users can manage own installment_payments"
  on public.installment_payments for all using (auth.uid() = user_id);

-- =============================================================================
-- GLOBAL SEED DATA (public presets — user_id = NULL)
-- Run once at migration time, visible to all users
-- =============================================================================

insert into public.expense_categories (user_id, name, "group", color) values
  -- Needs
  (null, 'Makan & Minum',                   'needs',       '#f97316'),
  (null, 'Transportasi & Bensin',            'needs',       '#3b82f6'),
  (null, 'Utilitas (Listrik, Air, Sampah)',  'needs',       '#06b6d4'),
  (null, 'Komunikasi (Kuota/Internet)',       'needs',       '#8b5cf6'),
  (null, 'Kesehatan',                         'needs',       '#10b981'),
  (null, 'Kebutuhan Rumah Tangga',            'needs',       '#f59e0b'),
  -- Wants
  (null, 'Hiburan (Jalan-jalan, Nonton, dsb)', 'wants',     '#ec4899'),
  (null, 'Langganan Digital',                 'wants',       '#6366f1'),
  (null, 'Hobi',                              'wants',       '#14b8a6'),
  (null, 'Personal Care',                     'wants',       '#f43f5e'),
  (null, 'Dana Sosial',                       'wants',       '#a855f7'),
  -- Obligations
  (null, 'Tagihan PayLater',                  'obligations', '#ef4444'),
  (null, 'Cicilan Pinjaman',                  'obligations', '#dc2626'),
  (null, 'Servis Kendaraan',                  'obligations', '#b45309');

insert into public.banks (user_id, name, type, color) values
  (null, 'BCA',       'bank',    '#0066cc'),
  (null, 'Mandiri',   'bank',    '#003d82'),
  (null, 'BNI',       'bank',    '#f97316'),
  (null, 'BRI',       'bank',    '#3b82f6'),
  (null, 'GoPay',     'ewallet', '#00aad2'),
  (null, 'OVO',       'ewallet', '#4c3494'),
  (null, 'DANA',      'ewallet', '#118ef4'),
  (null, 'ShopeePay', 'ewallet', '#ee4d2d'),
  (null, 'Cash',      'cash',    '#10b981');

-- =============================================================================
-- TRIGGER: create profile on user registration
-- (no longer seeds categories/banks — those are global presets above)
-- =============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
