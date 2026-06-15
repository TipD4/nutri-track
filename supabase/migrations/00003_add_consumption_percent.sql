-- ============================================================================
-- NutriTrack: Add consumption_percent to food_items
-- Migration: 00003_add_consumption_percent
-- Description: Track how much of each food was actually eaten
-- ============================================================================

-- Add column with default 100 (fully consumed)
alter table public.food_items
  add column consumption_percent integer not null default 100
  check (consumption_percent >= 0 and consumption_percent <= 100);

-- Comment for documentation
comment on column public.food_items.consumption_percent is
  '实际食用比例 (0-100)。100=全部吃完, 0=完全没吃, 50=吃了一半。计算营养时按此比例折算。';
