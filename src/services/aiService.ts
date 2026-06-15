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

/**
 * Analyze food from natural language text description.
 * Sends the text to the same proxy-ai edge function (text-only mode).
 */
export async function recognizeFoodByText(params: {
  text: string
  mealType: string
}): Promise<AIProxyResponse> {
  return recognizeFood({
    text: params.text,
    mealType: params.mealType as AIProxyRequest['mealType'],
  })
}
