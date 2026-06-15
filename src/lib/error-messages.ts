const ERROR_MESSAGES: Record<string, string> = {
  'invalid_credentials': '邮箱或密码错误',
  '23505': '该日期已有体重记录',
  '23514': '数据格式不正确',
  'PGRST116': '记录不存在',
  'AI_ANALYSIS_FAILED': '食物识别失败，请重新拍摄更清晰的照片',
  'AI_TIMEOUT': 'AI 响应超时，请检查网络后重试',
  'NETWORK_ERROR': '网络连接失败，请检查网络后重试',
  'AUTH_REQUIRED': '登录已过期，请重新登录',
  'STORAGE_LIMIT_EXCEEDED': '图片大小超过限制（最大5MB）',
  'INSUFFICIENT_DATA': '该时段暂无饮食记录',
}

export function getUserMessage(error: unknown): string {
  if (error instanceof Error) {
    for (const [code, msg] of Object.entries(ERROR_MESSAGES)) {
      if (error.message.includes(code)) return msg
    }
    return error.message || '操作失败，请稍后重试'
  }
  if (typeof error === 'string') {
    for (const [code, msg] of Object.entries(ERROR_MESSAGES)) {
      if (error.includes(code)) return msg
    }
  }
  return '操作失败，请稍后重试'
}

/** Returns true if the error is transient (retry may help) */
export function isRetryable(error: unknown): boolean {
  if (error instanceof Error) {
    const retryableCodes = ['AI_TIMEOUT', 'NETWORK_ERROR', 'AI_ANALYSIS_FAILED', 'AI_RATE_LIMITED']
    return retryableCodes.some(c => error.message.includes(c))
  }
  return false
}
