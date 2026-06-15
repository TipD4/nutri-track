import supabase from './supabase'
import type { AnalysisRequest, AnalysisResponse } from '@/types/analysis'

export async function getNutritionAnalysis(request: AnalysisRequest): Promise<AnalysisResponse> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL || 'https://cvgujbtkrouuvbbqsqch.supabase.co'}/functions/v1/analyze-nutrition`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(request),
    }
  )

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.code || 'ANALYSIS_FAILED')
  }

  return response.json()
}
