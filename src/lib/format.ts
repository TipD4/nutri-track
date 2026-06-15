export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays}天前`

  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  })
}

export function formatCalories(cal: number): string {
  return `${Math.round(cal)} kcal`
}

export function formatWeight(kg: number): string {
  return `${kg.toFixed(1)} kg`
}

export function formatMacro(g: number): string {
  return `${g.toFixed(1)}g`
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export function daysAgoStr(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}
