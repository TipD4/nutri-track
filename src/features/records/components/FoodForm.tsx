import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { mealRecordSchema, type MealRecordFormData } from '@/lib/zod-schemas'
import { MEAL_TYPE_LABELS, type MealType } from '@/types/food'
import { MEAL_TYPES } from '@/lib/constants'

interface FoodFormProps {
  onSubmit: (data: MealRecordFormData) => Promise<void>
  isSubmitting?: boolean
  defaultValues?: MealRecordFormData
}

export function FoodForm({ onSubmit, isSubmitting, defaultValues }: FoodFormProps) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<MealRecordFormData>({
    resolver: zodResolver(mealRecordSchema),
    defaultValues: defaultValues || {
      meal_type: 'breakfast',
      foods: [{ name: '', weight_g: 0, calories: 0, protein_g: 0, fat_g: 0, carbs_g: 0, consumption_percent: 100 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'foods' })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Meal type selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">餐次</label>
        <select {...register('meal_type')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
          {MEAL_TYPES.map(t => (
            <option key={t} value={t}>{MEAL_TYPE_LABELS[t as MealType]}</option>
          ))}
        </select>
      </div>

      {/* Note */}
      <Input {...register('note')} label="备注（可选）" placeholder="例如：自己做的" />

      {/* Food items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">食物列表</h4>
          <Button type="button" variant="secondary" size="sm" onClick={() => append({ name: '', weight_g: 0, calories: 0, protein_g: 0, fat_g: 0, carbs_g: 0, consumption_percent: 100 })}>
            + 添加食物
          </Button>
        </div>
        {errors.foods?.root?.message && (
          <p className="text-xs text-red-500">{errors.foods.root.message}</p>
        )}

        {fields.map((field, index) => (
          <div key={field.id} className="bg-gray-50 rounded-lg p-3 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">食物 #{index + 1}</span>
              {fields.length > 1 && (
                <button type="button" onClick={() => remove(index)} className="text-xs text-red-500">删除</button>
              )}
            </div>
            <Input
              {...register(`foods.${index}.name`)}
              label="食物名称"
              placeholder="例如：鸡胸肉"
              error={errors.foods?.[index]?.name?.message}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                {...register(`foods.${index}.weight_g`, { valueAsNumber: true })}
                label="重量 (g)"
                type="number"
                placeholder="150"
                error={errors.foods?.[index]?.weight_g?.message}
              />
              <Input
                {...register(`foods.${index}.calories`, { valueAsNumber: true })}
                label="热量 (kcal)"
                type="number"
                placeholder="200"
                error={errors.foods?.[index]?.calories?.message}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input
                {...register(`foods.${index}.protein_g`, { valueAsNumber: true })}
                label="蛋白质 (g)"
                type="number"
                placeholder="30"
                error={errors.foods?.[index]?.protein_g?.message}
              />
              <Input
                {...register(`foods.${index}.fat_g`, { valueAsNumber: true })}
                label="脂肪 (g)"
                type="number"
                placeholder="10"
                error={errors.foods?.[index]?.fat_g?.message}
              />
              <Input
                {...register(`foods.${index}.carbs_g`, { valueAsNumber: true })}
                label="碳水 (g)"
                type="number"
                placeholder="20"
                error={errors.foods?.[index]?.carbs_g?.message}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                食用比例: {field.consumption_percent ?? 100}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                {...register(`foods.${index}.consumption_percent`, { valueAsNumber: true })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                <span>0% 没吃</span>
                <span>100% 吃完</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
        保存记录
      </Button>
    </form>
  )
}
