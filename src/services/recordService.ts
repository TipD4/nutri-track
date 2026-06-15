import supabase from './supabase'
import type { MealRecord, MealRecordInsert, MealRecordUpdate, FoodItemInsert } from '@/types/food'
import { PAGE_SIZE } from '@/lib/constants'

export async function getRecords(params: { date?: string; mealType?: string; page?: number } = {}): Promise<{ data: MealRecord[]; count: number }> {
  let query = supabase
    .from('meal_records')
    .select('*, food_items(*)', { count: 'exact' })
    .order('recorded_at', { ascending: false })

  if (params.date) {
    const start = `${params.date}T00:00:00`
    const end = `${params.date}T23:59:59`
    query = query.gte('recorded_at', start).lte('recorded_at', end)
  }
  if (params.mealType) {
    query = query.eq('meal_type', params.mealType)
  }

  const page = params.page || 0
  query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

  const { data, error, count } = await query
  if (error) throw error
  return { data: data as MealRecord[], count: count || 0 }
}

export async function getRecord(id: string): Promise<MealRecord> {
  const { data, error } = await supabase
    .from('meal_records')
    .select('*, food_items(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as MealRecord
}

export async function createRecord(
  meal: MealRecordInsert,
  foods: Omit<FoodItemInsert, 'meal_record_id'>[]
): Promise<MealRecord> {
  // Step 1: insert meal record
  const { data: mealData, error: mealError } = await supabase
    .from('meal_records')
    .insert(meal)
    .select()
    .single()
  if (mealError) throw mealError

  // Step 2: insert food items
  const foodInserts = foods.map(f => ({ ...f, meal_record_id: mealData.id }))
  const { data: foodData, error: foodError } = await supabase
    .from('food_items')
    .insert(foodInserts)
    .select()
  if (foodError) {
    // Rollback: delete the meal record
    await supabase.from('meal_records').delete().eq('id', mealData.id)
    throw foodError
  }

  return { ...mealData, food_items: foodData } as MealRecord
}

export async function updateRecord(
  id: string,
  meal: MealRecordUpdate,
  foods: Omit<FoodItemInsert, 'meal_record_id'>[]
): Promise<MealRecord> {
  // Step 1: update meal fields
  const { error: mealError } = await supabase
    .from('meal_records')
    .update(meal)
    .eq('id', id)
  if (mealError) throw mealError

  // Step 2: replace food items (delete old, insert new)
  await supabase.from('food_items').delete().eq('meal_record_id', id)
  const foodInserts = foods.map(f => ({ ...f, meal_record_id: id }))
  const { error: foodError } = await supabase
    .from('food_items')
    .insert(foodInserts)
    .select()
  if (foodError) throw foodError

  // Step 3: fetch updated record
  return getRecord(id)
}

export async function deleteRecord(id: string): Promise<void> {
  const { error } = await supabase
    .from('meal_records')
    .delete()
    .eq('id', id)
  if (error) throw error
}
