import { useState, useCallback } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { mealRecordSchema, type MealRecordFormData } from '@/lib/zod-schemas'
import { MEAL_TYPE_LABELS, type MealType } from '@/types/food'
import { MEAL_TYPES } from '@/lib/constants'
import { recognizeFoodByText } from '@/services/aiService'
import type { AIFoodResult } from '@/types/food'

interface FoodFormProps {
  onSubmit: (data: MealRecordFormData) => Promise<void>
  isSubmitting?: boolean
  defaultValues?: MealRecordFormData
  /** If true, show the form in edit mode without AI analysis */
  isEditing?: boolean
}

type InputMode = 'ai' | 'manual'

export function FoodForm({ onSubmit, isSubmitting, defaultValues, isEditing }: FoodFormProps) {
  const [inputMode, setInputMode] = useState<InputMode>(isEditing ? 'manual' : 'ai')
  const [foodDescription, setFoodDescription] = useState('')
  const [aiResults, setAiResults] = useState<AIFoodResult[] | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const { register, handleSubmit, control, formState: { errors }, setValue, getValues } = useForm<MealRecordFormData>({
    resolver: zodResolver(mealRecordSchema),
    defaultValues: defaultValues || {
      meal_type: 'breakfast',
      foods: [{ name: '', weight_g: 0, calories: 0, protein_g: 0, fat_g: 0, carbs_g: 0, consumption_percent: 100 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'foods' })

  // ==================== AI Text Analysis ====================

  const handleAIAnalyze = useCallback(async () => {
    const desc = foodDescription.trim()
    if (!desc) {
      setAiError('请描述你吃了什么')
      return
    }

    setAnalyzing(true)
    setAiError(null)
    try {
      const mealType = getValues('meal_type')
      const response = await recognizeFoodByText({ text: desc, mealType })
      if (response.success && response.data.foods.length > 0) {
        setAiResults(response.data.foods)
      } else {
        setAiError('未能识别食物，请尝试更详细的描述（如"两个鸡蛋、一碗米饭"）')
      }
    } catch (err) {
      setAiError('AI 分析失败，请重试或切换到手动输入')
    } finally {
      setAnalyzing(false)
    }
  }, [foodDescription, getValues])

  // Populate form fields from AI results
  const applyAIResults = useCallback(() => {
    if (!aiResults) return
    // Replace all form food fields with AI results
    const foods = aiResults.map(f => ({
      name: f.name,
      weight_g: f.estimated_weight_g,
      calories: Math.round(f.calories),
      protein_g: f.protein_g,
      fat_g: f.fat_g,
      carbs_g: f.carbs_g,
      consumption_percent: f.consumption_percent ?? 100,
    }))
    // Reset form with AI results
    setValue('foods', foods)
  }, [aiResults, setValue])

  // Apply AI results when user clicks "应用"
  const handleApplyAI = () => {
    applyAIResults()
    // Switch to manual mode for review/editing
    setInputMode('manual')
  }

  // Retry AI analysis
  const handleRetryAI = () => {
    setAiResults(null)
    setAiError(null)
    handleAIAnalyze()
  }

  // ==================== Render ====================

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Meal type selector — always visible */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">餐次</label>
        <select {...register('meal_type')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
          {MEAL_TYPES.map(t => (
            <option key={t} value={t}>{MEAL_TYPE_LABELS[t as MealType]}</option>
          ))}
        </select>
      </div>

      {/* Note — always visible */}
      <Input {...register('note')} label="备注（可选）" placeholder="例如：自己做的、外卖" />

      {/* Mode toggle — only show when not editing */}
      {!isEditing && (
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setInputMode('ai')}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
              inputMode === 'ai' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500'
            }`}
          >
            🤖 AI 文字识别
          </button>
          <button
            type="button"
            onClick={() => setInputMode('manual')}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
              inputMode === 'manual' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-500'
            }`}
          >
            ✍️ 手动输入
          </button>
        </div>
      )}

      {/* ==================== AI Mode ==================== */}
      {inputMode === 'ai' && !isEditing && (
        <div className="space-y-4">
          {!aiResults && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  描述你吃了什么
                </label>
                <textarea
                  value={foodDescription}
                  onChange={(e) => setFoodDescription(e.target.value)}
                  placeholder='例如：我吃了两个鸡蛋、一碗米饭和一份西兰花炒牛肉，还喝了一杯牛奶'
                  rows={4}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-gray-400"
                  disabled={analyzing}
                />
              </div>

              {aiError && (
                <p className="text-sm text-red-500">{aiError}</p>
              )}

              <Button
                type="button"
                className="w-full"
                size="lg"
                onClick={handleAIAnalyze}
                loading={analyzing}
                disabled={!foodDescription.trim()}
              >
                🔍 AI 分析食物
              </Button>
            </>
          )}

          {/* AI Results Preview */}
          {aiResults && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">
                AI 识别结果（基于你的描述）
              </h3>

              {aiResults.map((food, i) => (
                <Card key={i} className="bg-green-50/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-800">{food.name}</span>
                        <span className="text-xs text-green-600">
                          {Math.round(food.confidence * 100)}% 置信
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-gray-500">
                        <span>{food.estimated_weight_g}g</span>
                        <span>{Math.round(food.calories)} kcal</span>
                        <span>蛋白质 {food.protein_g}g</span>
                        <span>脂肪 {food.fat_g}g</span>
                        <span>碳水 {food.carbs_g}g</span>
                      </div>
                      {food.consumption_percent < 100 && (
                        <p className="text-xs text-orange-500 mt-1">
                          ⚠️ 只吃了 {food.consumption_percent}%
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              <div className="flex gap-3">
                <Button type="button" variant="secondary" className="flex-1" onClick={handleRetryAI}>
                  重新分析
                </Button>
                <Button type="button" className="flex-1" onClick={handleApplyAI}>
                  应用并编辑
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== Manual Mode (or after AI results applied) ==================== */}
      {(inputMode === 'manual' || isEditing) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">食物列表</h4>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => append({ name: '', weight_g: 0, calories: 0, protein_g: 0, fat_g: 0, carbs_g: 0, consumption_percent: 100 })}
            >
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
                  step="any"
                  placeholder="150"
                  error={errors.foods?.[index]?.weight_g?.message}
                />
                <Input
                  {...register(`foods.${index}.calories`, { valueAsNumber: true })}
                  label="热量 (kcal)"
                  type="number"
                  step="any"
                  placeholder="200"
                  error={errors.foods?.[index]?.calories?.message}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  {...register(`foods.${index}.protein_g`, { valueAsNumber: true })}
                  label="蛋白质 (g)"
                  type="number"
                  step="any"
                  placeholder="30"
                  error={errors.foods?.[index]?.protein_g?.message}
                />
                <Input
                  {...register(`foods.${index}.fat_g`, { valueAsNumber: true })}
                  label="脂肪 (g)"
                  type="number"
                  step="any"
                  placeholder="10"
                  error={errors.foods?.[index]?.fat_g?.message}
                />
                <Input
                  {...register(`foods.${index}.carbs_g`, { valueAsNumber: true })}
                  label="碳水 (g)"
                  type="number"
                  step="any"
                  placeholder="20"
                  error={errors.foods?.[index]?.carbs_g?.message}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  食用比例: {getValues(`foods.${index}.consumption_percent`) ?? 100}%
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
      )}

      {/* Submit button */}
      <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
        保存记录
      </Button>
    </form>
  )
}
