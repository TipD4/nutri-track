import supabase from './supabase'
import type { WeightRecord, WeightRecordInsert, WeightTrendPoint } from '@/types/weight'
import { PAGE_SIZE } from '@/lib/constants'

export async function getWeightRecords(page: number = 0): Promise<{ data: WeightRecord[]; count: number }> {
  const { data, error, count } = await supabase
    .from('weight_records')
    .select('*', { count: 'exact' })
    .order('recorded_date', { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
  if (error) throw error
  return { data: data as WeightRecord[], count: count || 0 }
}

export async function getWeightTrend(startDate: string, endDate: string): Promise<WeightTrendPoint[]> {
  const { data, error } = await supabase
    .from('weight_records')
    .select('recorded_date, weight_kg')
    .gte('recorded_date', startDate)
    .lte('recorded_date', endDate)
    .order('recorded_date', { ascending: true })
  if (error) throw error
  return data as WeightTrendPoint[]
}

export async function upsertWeight(record: WeightRecordInsert): Promise<WeightRecord> {
  const { data, error } = await supabase
    .from('weight_records')
    .upsert(record, { onConflict: 'user_id, recorded_date' })
    .select()
    .single()
  if (error) throw error
  return data as WeightRecord
}

export async function deleteWeightRecord(id: string): Promise<void> {
  const { error } = await supabase
    .from('weight_records')
    .delete()
    .eq('id', id)
  if (error) throw error
}
