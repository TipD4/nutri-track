import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as weightService from '@/services/weightService'
import type { WeightRecordInsert } from '@/types/weight'

export function useWeightRecords() {
  return useQuery({
    queryKey: ['weights'],
    queryFn: () => weightService.getWeightRecords(),
    staleTime: 30_000,
  })
}

export function useWeightTrend(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['weights', 'trend', startDate, endDate],
    queryFn: () => weightService.getWeightTrend(startDate, endDate),
  })
}

export function useUpsertWeight() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: WeightRecordInsert) => weightService.upsertWeight(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weights'] })
    },
  })
}

export function useDeleteWeight() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => weightService.deleteWeightRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weights'] })
    },
  })
}
