import { Link } from 'react-router-dom'
import { Card } from '@/shared/components/ui/Card'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import type { MealRecord } from '@/types/food'
import { MEAL_TYPE_LABELS } from '@/types/food'
import { formatDate } from '@/lib/format'
import { sumCalories } from '@/lib/nutrition'

interface RecentRecordsProps {
  records: MealRecord[]
}

export function RecentRecords({ records }: RecentRecordsProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">最近记录</h3>
        <Link to="/records" className="text-xs text-primary-600">查看全部</Link>
      </div>
      {records.length === 0 ? (
        <EmptyState message="暂无饮食记录" />
      ) : (
        <div className="space-y-2">
          {records.map(record => (
            <Link key={record.id} to={`/records/${record.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400">{formatDate(record.recorded_at)}</span>
                    <span className="ml-2 px-1.5 py-0.5 bg-gray-100 rounded text-xs font-medium">
                      {MEAL_TYPE_LABELS[record.meal_type]}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">
                    {Math.round(sumCalories(record.food_items))} kcal
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {record.food_items.map(f => f.name).join('、')}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
