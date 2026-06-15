import { TrendChart } from '@/shared/components/charts/TrendChart'
import type { WeightTrendPoint } from '@/types/weight'

interface WeightTrendWidgetProps {
  data: WeightTrendPoint[]
}

export function WeightTrendWidget({ data }: WeightTrendWidgetProps) {
  const chartData = data.map(d => ({ date: d.recorded_date, value: d.weight_kg }))
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-2">体重趋势</h3>
      <TrendChart data={chartData} color="#8b5cf6" yLabel="kg" height={180} />
    </div>
  )
}
