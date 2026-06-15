import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import type { AIFoodResult } from '@/types/food'

interface AIResultPreviewProps {
  foods: AIFoodResult[]
  onEdit: () => void
  onSave: () => void
  saving?: boolean
}

export function AIResultPreview({ foods, onEdit, onSave, saving }: AIResultPreviewProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">AI 识别结果</h3>
      {foods.map((food, i) => (
        <Card key={i} className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-800">{food.name}</span>
              <span className="text-xs text-gray-400">{Math.round(food.confidence * 100)}% 置信度</span>
            </div>
            <div className="flex gap-3 mt-1 text-xs text-gray-500">
              <span>{food.estimated_weight_g}g</span>
              <span>{Math.round(food.calories)} kcal</span>
              <span>P:{food.protein_g}g</span>
              <span>F:{food.fat_g}g</span>
              <span>C:{food.carbs_g}g</span>
            </div>
            {((food as any).consumption_percent !== undefined && (food as any).consumption_percent < 100) && (
              <p className="text-xs text-orange-500 mt-1">
                ⚠️ 只吃了 {(food as any).consumption_percent}%
              </p>
            )}
          </div>
        </Card>
      ))}
      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onEdit}>修改</Button>
        <Button className="flex-1" onClick={onSave} loading={saving}>确认保存</Button>
      </div>
    </div>
  )
}
