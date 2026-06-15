import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { MealRecord } from '@/types/food'
import { sumProtein, sumFat, sumCarbs } from '@/lib/nutrition'

interface MacroBarChartProps {
  meals: MealRecord[]
  targets?: { protein_g?: number | null; fat_g?: number | null; carbs_g?: number | null }
}

export function MacroBarChart({ meals, targets }: MacroBarChartProps) {
  const allFoods = meals.flatMap(m => m.food_items)
  const protein = sumProtein(allFoods)
  const fat = sumFat(allFoods)
  const carbs = sumCarbs(allFoods)

  const data = [
    { name: '蛋白质', actual: protein, target: targets?.protein_g || 60, color: '#3b82f6' },
    { name: '脂肪', actual: fat, target: targets?.fat_g || 50, color: '#f59e0b' },
    { name: '碳水', actual: carbs, target: targets?.carbs_g || 250, color: '#10b981' },
  ]

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} layout="vertical" margin={{ left: 40, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 10 }} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={40} />
        <Tooltip formatter={(value: number) => `${Math.round(value)}g`} />
        <Bar dataKey="actual" radius={[0, 4, 4, 0]} barSize={16}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
