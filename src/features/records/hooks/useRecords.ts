import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as recordService from '@/services/recordService'
import type { MealRecordInsert, MealRecordUpdate, FoodItemInsert, MealType } from '@/types/food'

export function useRecords(date?: string, mealType?: MealType) {
  return useQuery({
    queryKey: ['records', { date, mealType }],
    queryFn: () => recordService.getRecords({ date, mealType }),
    staleTime: 10_000,
  })
}

export function useRecord(id: string) {
  return useQuery({
    queryKey: ['records', id],
    queryFn: () => recordService.getRecord(id),
    enabled: !!id,
  })
}

export function useCreateRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ meal, foods }: { meal: MealRecordInsert; foods: Omit<FoodItemInsert, 'meal_record_id'>[] }) =>
      recordService.createRecord(meal, foods),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, meal, foods }: { id: string; meal: MealRecordUpdate; foods: Omit<FoodItemInsert, 'meal_record_id'>[] }) =>
      recordService.updateRecord(id, meal, foods),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] })
    },
  })
}

export function useDeleteRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => recordService.deleteRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
