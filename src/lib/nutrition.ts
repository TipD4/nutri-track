import type { FoodItem } from '@/types/food'

// Apply consumption_percent to get actual consumed value
function consumed(item: FoodItem, value: number): number {
  return (value * item.consumption_percent) / 100
}

export function sumCalories(items: FoodItem[]): number {
  return items.reduce((sum, item) => sum + consumed(item, item.calories), 0)
}

export function sumProtein(items: FoodItem[]): number {
  return items.reduce((sum, item) => sum + consumed(item, item.protein_g), 0)
}

export function sumFat(items: FoodItem[]): number {
  return items.reduce((sum, item) => sum + consumed(item, item.fat_g), 0)
}

export function sumCarbs(items: FoodItem[]): number {
  return items.reduce((sum, item) => sum + consumed(item, item.carbs_g), 0)
}

export function calcMacroPercent(calories: number, macroGrams: number, calPerGram: number): number {
  if (!calories) return 0
  return ((macroGrams * calPerGram) / calories) * 100
}
