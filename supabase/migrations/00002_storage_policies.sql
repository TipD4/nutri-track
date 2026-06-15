-- ============================================================================
-- NutriTrack: Storage Bucket & Policies
-- Migration: 00002_storage_policies
-- Description: food-images bucket setup and access policies
-- ============================================================================

-- ============================================================================
-- STEP 1: Create the storage bucket (run via Dashboard or this SQL)
-- ============================================================================

-- Note: Bucket creation via SQL requires the supabase_storage_admin role.
-- If this fails, create the bucket manually in Supabase Dashboard:
--   Storage → New Bucket → Name: "food-images" → Public: NO
-- Then run the RLS policies below.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'food-images',
  'food-images',
  false,              -- NOT public — access controlled via RLS
  5242880,            -- 5MB max file size
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ]::text[]
)
on conflict (id) do nothing;

-- ============================================================================
-- STEP 2: Storage RLS Policies
-- ============================================================================

-- Drop existing policies first (idempotent migration)
drop policy if exists "Users can read own food images" on storage.objects;
drop policy if exists "Users can upload to own folder" on storage.objects;
drop policy if exists "Users can update own food images" on storage.objects;
drop policy if exists "Users can delete own food images" on storage.objects;

-- Policy: Users can only read their own images
-- Path structure: {user_id}/{filename}.{ext}
create policy "Users can read own food images"
  on storage.objects for select
  using (
    bucket_id = 'food-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can upload images to their own folder
-- Enforces the {user_id}/ prefix pattern
create policy "Users can upload to own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'food-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can update their own images
create policy "Users can update own food images"
  on storage.objects for update
  using (
    bucket_id = 'food-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'food-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can delete their own images
create policy "Users can delete own food images"
  on storage.objects for delete
  using (
    bucket_id = 'food-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- STEP 3: Verify
-- ============================================================================

-- Check that policies were created:
-- select * from storage.policies where bucket_id = 'food-images';

-- Check bucket configuration:
-- select * from storage.buckets where id = 'food-images';
