import { create } from 'zustand'
import type { AIFoodResult, MealType } from '@/types/food'

interface AIResultStore {
  result: AIFoodResult[] | null
  imagePath: string | null
  imageId: string | null
  mealType: MealType | null
  setResult: (result: AIFoodResult[], imagePath: string, imageId: string, mealType: MealType) => void
  updateFood: (index: number, updates: Partial<AIFoodResult>) => void
  clearResult: () => void
}

export const useAIResultStore = create<AIResultStore>((set) => ({
  result: null,
  imagePath: null,
  imageId: null,
  mealType: null,
  setResult: (result, imagePath, imageId, mealType) => set({ result, imagePath, imageId, mealType }),
  updateFood: (index, updates) =>
    set((state) => {
      if (!state.result) return state
      const newResult = [...state.result]
      newResult[index] = { ...newResult[index], ...updates }
      return { result: newResult }
    }),
  clearResult: () => set({ result: null, imagePath: null, imageId: null, mealType: null }),
}))
