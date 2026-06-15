import supabase from './supabase'
import type { AIProxyRequest, AIProxyResponse } from '@/types/food'

const AI_REQUEST_TIMEOUT_MS = 60_000 // 60s — generous for Supabase edge function cold starts

export async function recognizeFood(request: AIProxyRequest): Promise<AIProxyResponse> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('AUTH_REQUIRED')

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL || 'https://cvgujbtkrouuvbbqsqch.supabase.co'}/functions/v1/proxy-ai`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      }
    )

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      const code = err.error?.code || 'AI_ANALYSIS_FAILED'
      throw new Error(code)
    }

    return response.json()
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error('AI_TIMEOUT')
      }
      // If it already has a known code, re-throw as-is
      if (err.message === err.message.toUpperCase() && err.message.includes('_')) {
        throw err
      }
    }
    // Network-level errors (e.g. "Load failed", "Failed to fetch")
    throw new Error('NETWORK_ERROR')
  } finally {
    clearTimeout(timeoutId)
  }
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
