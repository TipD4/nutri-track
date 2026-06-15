import { RingChart } from '@/shared/components/charts/RingChart'
import type { MealRecord } from '@/types/food'
import { sumCalories } from '@/lib/nutrition'

interface CalorieRingProps {
  meals: MealRecord[]
  target?: number | null
}

export function CalorieRing({ meals, target }: CalorieRingProps) {
  const total = sumCalories(meals.flatMap(m => m.food_items))
  return <RingChart value={total} target={target || 2000} label="热量 (kcal)" color="#ef4444" />
}
