// ==================== AI Analysis ====================

export type AnalysisType = 'daily' | 'weekly' | 'monthly'

export const ANALYSIS_TYPE_LABELS: Record<AnalysisType, string> = {
  daily: '今日',
  weekly: '本周',
  monthly: '本月',
}

export interface AnalysisContent {
  summary: {
    avgDailyCalories: number
    avgDailyProtein: number
    avgDailyFat: number
    avgDailyCarbs: number
    weightChange?: number
  }
  analysis: string       // Markdown
  recommendations: string[]
}

export interface AnalysisRequest {
  type: AnalysisType
  periodStart: string
  periodEnd: string
}

export interface AnalysisSuccessResponse {
  success: true
  data: AnalysisContent
}

export interface AnalysisErrorResponse {
  success: false
  error: {
    code: string
    message: string
  }
}

export type AnalysisResponse = AnalysisSuccessResponse | AnalysisErrorResponse

export interface AIAnalysisResult {
  id: string
  user_id: string
  analysis_type: AnalysisType
  period_start: string
  period_end: string
  analysis_json: AnalysisContent
  created_at: string
}
