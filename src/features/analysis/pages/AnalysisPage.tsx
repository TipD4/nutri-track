import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { Spinner } from '@/shared/components/ui/Spinner'
import { ErrorMessage } from '@/shared/components/ui/ErrorMessage'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { getNutritionAnalysis } from '@/services/analysisService'
import { getUserMessage } from '@/lib/error-messages'
import { todayStr, daysAgoStr } from '@/lib/format'
import { ANALYSIS_TYPE_LABELS, type AnalysisType, type AnalysisContent } from '@/types/analysis'

export default function AnalysisPage() {
  const [activeType, setActiveType] = useState<AnalysisType>('daily')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisContent | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalysis = async (type: AnalysisType) => {
    setActiveType(type)
    setLoading(true)
    setError(null)
    try {
      let periodStart: string, periodEnd: string
      const today = todayStr()
      if (type === 'daily') {
        periodStart = today
        periodEnd = today
      } else if (type === 'weekly') {
        periodStart = daysAgoStr(7)
        periodEnd = today
      } else {
        periodStart = daysAgoStr(30)
        periodEnd = today
      }

      const response = await getNutritionAnalysis({ type, periodStart, periodEnd })
      if (response.success) {
        setResult(response.data)
      } else {
        setError(response.error.message)
      }
    } catch (err) {
      setError(getUserMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const types: AnalysisType[] = ['daily', 'weekly', 'monthly']

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">AI 营养分析</h2>

      {/* Period Selector */}
      <div className="flex gap-2">
        {types.map(type => (
          <Button
            key={type}
            variant={activeType === type ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => fetchAnalysis(type)}
            loading={loading && activeType === type}
          >
            {ANALYSIS_TYPE_LABELS[type]}
          </Button>
        ))}
      </div>

      {error && <ErrorMessage message={error} />}

      {loading && <Spinner fullScreen />}

      {result && !loading && (
        <Card>
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">{Math.round(result.summary.avgDailyCalories)}</div>
              <div className="text-xs text-gray-500">日均热量 (kcal)</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">{result.summary.avgDailyProtein.toFixed(1)}</div>
              <div className="text-xs text-gray-500">日均蛋白质 (g)</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">{result.summary.avgDailyFat.toFixed(1)}</div>
              <div className="text-xs text-gray-500">日均脂肪 (g)</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">{result.summary.avgDailyCarbs.toFixed(1)}</div>
              <div className="text-xs text-gray-500">日均碳水 (g)</div>
            </div>
          </div>

          {/* AI Analysis Markdown */}
          <div className="prose prose-sm max-w-none text-gray-700">
            <ReactMarkdown>{result.analysis}</ReactMarkdown>
          </div>

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="mt-4 p-3 bg-primary-50 rounded-lg">
              <h4 className="text-sm font-medium text-primary-700 mb-2">💡 建议</h4>
              <ul className="space-y-1">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm text-primary-600 flex gap-2">
                    <span>•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {!result && !loading && !error && (
        <EmptyState message="点击上方按钮生成营养分析" />
      )}
    </div>
  )
}
