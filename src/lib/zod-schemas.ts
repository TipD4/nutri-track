import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位'),
})

export const foodItemSchema = z.object({
  name: z.string().min(1, '请输入食物名称'),
  weight_g: z.coerce.number().positive('重量必须大于0'),
  calories: z.coerce.number().min(0, '热量不能为负数'),
  protein_g: z.coerce.number().min(0),
  fat_g: z.coerce.number().min(0),
  carbs_g: z.coerce.number().min(0),
  consumption_percent: z.coerce.number().min(0).max(100).default(100),
})

export const mealRecordSchema = z.object({
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  recorded_at: z.string().optional(),
  note: z.string().optional(),
  foods: z.array(foodItemSchema).min(1, '至少添加一种食物'),
})

export const weightSchema = z.object({
  weight_kg: z.coerce.number().positive('体重必须大于0').max(500, '请输入有效的体重'),
  recorded_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式不正确'),
})

export const targetsSchema = z.object({
  target_calories: z.coerce.number().positive().optional().nullable(),
  target_protein_g: z.coerce.number().positive().optional().nullable(),
  target_fat_g: z.coerce.number().positive().optional().nullable(),
  target_carbs_g: z.coerce.number().positive().optional().nullable(),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type FoodItemFormData = z.infer<typeof foodItemSchema>
export type MealRecordFormData = z.infer<typeof mealRecordSchema>
export type WeightFormData = z.infer<typeof weightSchema>
export type TargetsFormData = z.infer<typeof targetsSchema>
