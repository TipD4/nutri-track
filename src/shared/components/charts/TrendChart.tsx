import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface TrendChartProps {
  data: { date: string; value: number }[]
  color?: string
  yLabel?: string
  height?: number
}

export function TrendChart({ data, color = '#3b82f6', yLabel, height = 200 }: TrendChartProps) {
  if (!data.length) {
    return <div className="flex items-center justify-center text-gray-400 text-sm py-8">暂无数据</div>
  }

  const chartData = data.map(d => ({
    ...d,
    date: d.date.slice(5), // show MM-DD
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
        <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', style: { fontSize: 11 } } : undefined} />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
