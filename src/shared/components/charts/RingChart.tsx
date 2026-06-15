import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface RingChartProps {
  value: number
  target: number
  label: string
  color?: string
}

export function RingChart({ value, target, label, color = '#3b82f6' }: RingChartProps) {
  const percentage = target ? Math.min((value / target) * 100, 100) : 0
  const remaining = target ? Math.max(target - value, 0) : 0

  const data = [
    { name: '已摄入', value },
    { name: '剩余', value: remaining },
  ]

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={32}
              outerRadius={48}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={color} />
              <Cell fill="#f3f4f6" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-gray-800">{Math.round(value)}</span>
          <span className="text-xs text-gray-500">{target ? Math.round(percentage) + '%' : '--'}</span>
        </div>
      </div>
      <span className="text-xs text-gray-500 mt-1">{label}</span>
    </div>
  )
}
