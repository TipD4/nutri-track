
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { useAIResultStore } from '@/stores/aiResultStore'

interface AIResultEditorProps {
  onSave: () => void
  saving?: boolean
}

export function AIResultEditor({ onSave, saving }: AIResultEditorProps) {
  const { result, updateFood } = useAIResultStore()

  if (!result) return null

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">修改识别结果</h3>
      {result.map((food, i) => (
        <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-2">
          <span className="text-xs font-medium text-gray-500">食物 #{i + 1}</span>
          <Input
            label="名称"
            value={food.name}
            onChange={(e) => updateFood(i, { name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="重量 (g)"
              type="number"
              value={food.estimated_weight_g}
              onChange={(e) => updateFood(i, { estimated_weight_g: Number(e.target.value) })}
            />
            <Input
              label="热量 (kcal)"
              type="number"
              value={food.calories}
              onChange={(e) => updateFood(i, { calories: Number(e.target.value) })}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Input
              label="蛋白质 (g)"
              type="number"
              value={food.protein_g}
              onChange={(e) => updateFood(i, { protein_g: Number(e.target.value) })}
            />
            <Input
              label="脂肪 (g)"
              type="number"
              value={food.fat_g}
              onChange={(e) => updateFood(i, { fat_g: Number(e.target.value) })}
            />
            <Input
              label="碳水 (g)"
              type="number"
              value={food.carbs_g}
              onChange={(e) => updateFood(i, { carbs_g: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              食用比例: {food.consumption_percent ?? 100}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              value={food.consumption_percent ?? 100}
              onChange={(e) => updateFood(i, { consumption_percent: Number(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
              <span>0% 没吃</span>
              <span>100% 吃完</span>
            </div>
          </div>
        </div>
      ))}
      <Button className="w-full" onClick={onSave} loading={saving}>确认保存</Button>
    </div>
  )
}
