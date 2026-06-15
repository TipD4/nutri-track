export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://cvgujbtkrouuvbbqsqch.supabase.co'
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const STORAGE_BUCKET = 'food-images'

export const IMAGE_MAX_SIZE = 5 * 1024 * 1024 // 5MB
export const IMAGE_MAX_DIMENSION = 1920

export const PAGE_SIZE = 20
