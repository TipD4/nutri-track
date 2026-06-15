import supabase from './supabase'
import type { AIProxyRequest, AIProxyResponse } from '@/types/food'

export async function recognizeFood(request: AIProxyRequest): Promise<AIProxyResponse> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL || 'https://cvgujbtkrouuvbbqsqch.supabase.co'}/functions/v1/proxy-ai`,
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
    throw new Error(err.error?.code || 'AI_ANALYSIS_FAILED')
  }

  return response.json()
}
