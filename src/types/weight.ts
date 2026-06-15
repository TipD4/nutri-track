// ==================== Weight ====================

export interface WeightRecord {
  id: string
  user_id: string
  weight_kg: number
  recorded_date: string // 'YYYY-MM-DD'
  created_at: string
}

export interface WeightRecordInsert {
  weight_kg: number
  recorded_date: string
}

export interface WeightTrendPoint {
  recorded_date: string
  weight_kg: number
}
