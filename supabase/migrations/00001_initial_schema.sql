-- ============================================================================
-- NutriTrack: Initial Database Schema
-- Migration: 00001_initial_schema
-- Description: Core tables, triggers, indexes, and RLS policies
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Automatically update `updated_at` on row modification
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Automatically create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================================================
-- TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles — 用户扩展信息与营养目标
-- 1:1 relationship with auth.users
-- ----------------------------------------------------------------------------
create table public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  display_name     text,
  avatar_url       text,
  target_calories  numeric,
  target_protein_g numeric,
  target_fat_g     numeric,
  target_carbs_g   numeric,
  created_at       timestamptz not null default timezone('utc'::text, now()),
  updated_at       timestamptz not null default timezone('utc'::text, now())
);

-- Trigger: auto-update updated_at
create trigger set_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- meal_records — 餐食记录（早餐/午餐/晚餐/加餐）
-- ----------------------------------------------------------------------------
create table public.meal_records (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  meal_type   text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  recorded_at timestamptz not null default timezone('utc'::text, now()),
  source      text not null default 'manual' check (source in ('manual', 'ai')),
  note        text,
  created_at  timestamptz not null default timezone('utc'::text, now()),
  updated_at  timestamptz not null default timezone('utc'::text, now())
);

-- Trigger: auto-update updated_at
create trigger set_updated_at
  before update on public.meal_records
  for each row
  execute function public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- food_items — 每条餐食中的具体食物明细
-- ----------------------------------------------------------------------------
create table public.food_items (
  id             uuid primary key default gen_random_uuid(),
  meal_record_id uuid not null references public.meal_records(id) on delete cascade,
  name           text not null check (char_length(name) > 0),
  weight_g       numeric not null,
  calories       numeric not null,
  protein_g      numeric not null,
  fat_g          numeric not null,
  carbs_g        numeric not null,
  confidence     numeric check (confidence >= 0 and confidence <= 1),
  created_at     timestamptz not null default timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- food_images — 食物照片存储记录
-- meal_record_id is NULLABLE: upload first, link later
-- ----------------------------------------------------------------------------
create table public.food_images (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  meal_record_id  uuid references public.meal_records(id) on delete set null,
  storage_path    text not null,
  thumbnail_path  text,
  created_at      timestamptz not null default timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- weight_records — 体重记录（每天一条）
-- ----------------------------------------------------------------------------
create table public.weight_records (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  weight_kg     numeric not null check (weight_kg > 0),
  recorded_date date not null,
  created_at    timestamptz not null default timezone('utc'::text, now()),

  -- Each user can only record one weight per day
  unique (user_id, recorded_date)
);

-- ----------------------------------------------------------------------------
-- ai_analysis_results — AI 营养分析结果缓存
-- Stores generated analysis to avoid repeated expensive AI calls
-- ----------------------------------------------------------------------------
create table public.ai_analysis_results (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  analysis_type text not null check (analysis_type in ('daily', 'weekly', 'monthly')),
  period_start  date not null,
  period_end    date not null,
  analysis_json jsonb not null,
  created_at    timestamptz not null default timezone('utc'::text, now()),

  -- One analysis per user per type per period
  unique (user_id, analysis_type, period_start)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- meal_records: query by user + date (most frequent query pattern)
create index idx_meal_records_user_date
  on public.meal_records (user_id, recorded_at desc);

-- meal_records: filter by meal type
create index idx_meal_records_user_type
  on public.meal_records (user_id, meal_type);

-- food_items: join path to meal_records
create index idx_food_items_meal
  on public.food_items (meal_record_id);

-- food_images: query user's image history
create index idx_food_images_user
  on public.food_images (user_id, created_at desc);

-- food_images: find images linked to a meal
create index idx_food_images_meal
  on public.food_images (meal_record_id);

-- weight_records: trend queries by date range
create index idx_weight_user_date
  on public.weight_records (user_id, recorded_date);

-- ai_analysis_results: lookup cached analysis
create index idx_analysis_user_type
  on public.ai_analysis_results (user_id, analysis_type, period_start desc);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Note: INSERT is handled by handle_new_user() trigger with security definer.
-- No direct INSERT policy needed for normal users.

-- Note: No DELETE policy — profiles live as long as the user exists (CASCADE from auth.users).

-- ----------------------------------------------------------------------------
-- meal_records
-- ----------------------------------------------------------------------------
alter table public.meal_records enable row level security;

create policy "Users can read own meal records"
  on public.meal_records for select
  using (auth.uid() = user_id);

create policy "Users can insert own meal records"
  on public.meal_records for insert
  with check (auth.uid() = user_id);

create policy "Users can update own meal records"
  on public.meal_records for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own meal records"
  on public.meal_records for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- food_items
-- Ownership verified via JOIN to parent meal_record
-- ----------------------------------------------------------------------------
alter table public.food_items enable row level security;

create policy "Users can read food items in own meals"
  on public.food_items for select
  using (
    exists (
      select 1 from public.meal_records
      where meal_records.id = food_items.meal_record_id
        and meal_records.user_id = auth.uid()
    )
  );

create policy "Users can insert food items in own meals"
  on public.food_items for insert
  with check (
    exists (
      select 1 from public.meal_records
      where meal_records.id = food_items.meal_record_id
        and meal_records.user_id = auth.uid()
    )
  );

create policy "Users can update food items in own meals"
  on public.food_items for update
  using (
    exists (
      select 1 from public.meal_records
      where meal_records.id = food_items.meal_record_id
        and meal_records.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.meal_records
      where meal_records.id = food_items.meal_record_id
        and meal_records.user_id = auth.uid()
    )
  );

create policy "Users can delete food items in own meals"
  on public.food_items for delete
  using (
    exists (
      select 1 from public.meal_records
      where meal_records.id = food_items.meal_record_id
        and meal_records.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- food_images
-- ----------------------------------------------------------------------------
alter table public.food_images enable row level security;

create policy "Users can read own food images"
  on public.food_images for select
  using (auth.uid() = user_id);

create policy "Users can insert own food images"
  on public.food_images for insert
  with check (auth.uid() = user_id);

create policy "Users can update own food images"
  on public.food_images for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own food images"
  on public.food_images for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- weight_records
-- ----------------------------------------------------------------------------
alter table public.weight_records enable row level security;

create policy "Users can read own weight records"
  on public.weight_records for select
  using (auth.uid() = user_id);

create policy "Users can insert own weight records"
  on public.weight_records for insert
  with check (auth.uid() = user_id);

create policy "Users can update own weight records"
  on public.weight_records for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own weight records"
  on public.weight_records for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- ai_analysis_results
-- ----------------------------------------------------------------------------
alter table public.ai_analysis_results enable row level security;

create policy "Users can read own analysis results"
  on public.ai_analysis_results for select
  using (auth.uid() = user_id);

create policy "Users can insert own analysis results"
  on public.ai_analysis_results for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own analysis results"
  on public.ai_analysis_results for delete
  using (auth.uid() = user_id);

-- Note: UPDATE is intentionally omitted. Analysis results should be
-- regenerated, not modified. If re-analysis is needed, delete the old
-- record and insert a new one.
