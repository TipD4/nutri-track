import { cn } from '@/lib/cn'
import { MEAL_TYPE_LABELS, type MealType } from '@/types/food'
import { MEAL_TYPES } from '@/lib/constants'

interface MealTypeTabsProps {
  active: MealType
  onChange: (type: MealType) => void
}

export function MealTypeTabs({ active, onChange }: MealTypeTabsProps) {
  return (
    <div className="flex gap-2">
      {MEAL_TYPES.map(type => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
            active === type
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          {MEAL_TYPE_LABELS[type]}
        </button>
      ))}
    </div>
  )
}
