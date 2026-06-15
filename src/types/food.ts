// ==================== Meal / Food ====================

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type RecordSource = 'manual' | 'ai'

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '加餐',
}

export interface FoodItem {
  id: string
  meal_record_id: string
  name: string
  weight_g: number
  calories: number
  protein_g: number
  fat_g: number
  carbs_g: number
  confidence: number | null
  consumption_percent: number
  created_at: string
}

export interface FoodItemInsert {
  name: string
  weight_g: number
  calories: number
  protein_g: number
  fat_g: number
  carbs_g: number
  confidence?: number
  consumption_percent?: number
}

export interface MealRecord {
  id: string
  user_id: string
  meal_type: MealType
  recorded_at: string
  source: RecordSource
  note: string | null
  created_at: string
  updated_at: string
  food_items: FoodItem[]
}

export interface MealRecordInsert {
  meal_type: MealType
  recorded_at?: string
  source?: RecordSource
  note?: string
}

export interface MealRecordUpdate {
  meal_type?: MealType
  recorded_at?: string
  note?: string | null
}

// ==================== AI Recognition ====================

export interface AIFoodResult {
  name: string
  estimated_weight_g: number
  calories: number
  protein_g: number
  fat_g: number
  carbs_g: number
  confidence: number
  consumption_percent: number
}

export interface AIProxyRequest {
  imagePath?: string
  text?: string
  mealType?: MealType
}

export interface AIProxySuccessResponse {
  success: true
  data: {
    foods: AIFoodResult[]
  }
}

export interface AIProxyErrorResponse {
  success: false
  error: {
    code: string
    message: string
  }
}

export type AIProxyResponse = AIProxySuccessResponse | AIProxyErrorResponse
