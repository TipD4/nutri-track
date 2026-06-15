import { Link } from 'react-router-dom'
import { Card } from '@/shared/components/ui/Card'
import { MEAL_TYPE_LABELS, type MealRecord } from '@/types/food'
import { formatDate } from '@/lib/format'
import { sumCalories } from '@/lib/nutrition'

function TrashIconSimple() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  )
}

interface RecordCardProps {
  record: MealRecord
  onDelete: (id: string) => void
}

export function RecordCard({ record, onDelete }: RecordCardProps) {
  const totalCal = sumCalories(record.food_items)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <Link to={`/records/${record.id}`} className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-1.5 py-0.5 bg-primary-50 text-primary-700 rounded text-xs font-medium">
              {MEAL_TYPE_LABELS[record.meal_type]}
            </span>
            {record.source === 'ai' && (
              <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded text-xs">AI</span>
            )}
            <span className="text-xs text-gray-400">{formatDate(record.recorded_at)}</span>
          </div>
          <p className="text-sm text-gray-700 truncate">
            {record.food_items.map(f => f.name).join('、') || '无详情'}
          </p>
          {record.note && <p className="text-xs text-gray-400 mt-0.5 truncate">{record.note}</p>}
          {record.food_items.some(f => (f.consumption_percent ?? 100) < 100) && (
            <span className="text-xs text-orange-500 mt-0.5 inline-block">📌 有剩余</span>
          )}
        </Link>
        <div className="flex items-center gap-2 ml-3 shrink-0">
          <span className="text-sm font-semibold text-gray-800">{Math.round(totalCal)} kcal</span>
          <button
            onClick={(e) => { e.preventDefault(); onDelete(record.id) }}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
          >
            <TrashIconSimple />
          </button>
        </div>
      </div>
    </Card>
  )
}
