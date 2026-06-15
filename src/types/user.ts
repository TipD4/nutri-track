// ==================== User / Auth ====================

export interface User {
  id: string
  email?: string
}

// ==================== Profile ====================

export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  target_calories: number | null
  target_protein_g: number | null
  target_fat_g: number | null
  target_carbs_g: number | null
  created_at: string
  updated_at: string
}

export interface ProfileUpdate {
  display_name?: string | null
  target_calories?: number | null
  target_protein_g?: number | null
  target_fat_g?: number | null
  target_carbs_g?: number | null
}

export interface UserTargets {
  calories: number | null
  protein_g: number | null
  fat_g: number | null
  carbs_g: number | null
}
