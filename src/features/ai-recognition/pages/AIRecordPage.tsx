import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ImageUploader } from '@/features/ai-recognition/components/ImageUploader'
import { AIResultPreview } from '@/features/ai-recognition/components/AIResultPreview'
import { AIResultEditor } from '@/features/ai-recognition/components/AIResultEditor'
import { Button } from '@/shared/components/ui/Button'
import { Spinner } from '@/shared/components/ui/Spinner'
import { ErrorMessage } from '@/shared/components/ui/ErrorMessage'
import { useAIResultStore } from '@/stores/aiResultStore'
import { recognizeFood } from '@/services/aiService'
import { createRecord } from '@/services/recordService'
import { linkImageToMeal } from '@/services/imageService'
import { MEAL_TYPE_LABELS, type MealType } from '@/types/food'
import { MEAL_TYPES } from '@/lib/constants'
import { getUserMessage } from '@/lib/error-messages'

export default function AIRecordPage() {
  const navigate = useNavigate()
  const { result, imagePath, setResult, clearResult } = useAIResultStore()
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch')
  const [uploadedImageId, setUploadedImageId] = useState<string | null>(null)
  const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(null)

  const handleUploaded = (path: string, imgId: string, _previewUrl: string) => {
    setUploadedImageId(imgId)
    setUploadedImagePath(path)
    setError(null)
  }

  const handleAnalyze = async () => {
    if (!uploadedImageId || !uploadedImagePath) return
    setAnalyzing(true)
    setError(null)
    try {
      const response = await recognizeFood({
        imagePath: uploadedImagePath,
        mealType: selectedMealType,
      })
      if (response.success) {
        setResult(response.data.foods, imagePath || '', uploadedImageId, selectedMealType)
      } else {
        setError(response.error.message)
      }
    } catch (err) {
      setError(getUserMessage(err))
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSave = async () => {
    if (!result) return
    setSaving(true)
    try {
      const meal = await createRecord(
        { meal_type: selectedMealType, source: 'ai' },
        result.map(f => ({
          name: f.name,
          weight_g: f.estimated_weight_g,
          calories: f.calories,
          protein_g: f.protein_g,
          fat_g: f.fat_g,
          carbs_g: f.carbs_g,
          confidence: f.confidence,
          consumption_percent: f.consumption_percent ?? 100,
        }))
      )
      if (uploadedImageId) {
        await linkImageToMeal(uploadedImageId, meal.id)
      }
      clearResult()
      navigate('/records')
    } catch (err) {
      setError(getUserMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-gray-800">AI 识别录入</h2>

      {!result && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">餐次</label>
            <select
              value={selectedMealType}
              onChange={(e) => setSelectedMealType(e.target.value as MealType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {MEAL_TYPES.map(t => (
                <option key={t} value={t}>{MEAL_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
          <ImageUploader onUploaded={handleUploaded} />
          {uploadedImageId && !analyzing && (
            <Button className="w-full" size="lg" onClick={handleAnalyze}>
              🔍 开始识别
            </Button>
          )}
          {analyzing && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Spinner size="lg" />
              <p className="text-sm text-gray-500">AI 正在分析食物...</p>
            </div>
          )}
        </>
      )}

      {error && <ErrorMessage message={error} />}

      {result && !editing && (
        <AIResultPreview foods={result} onEdit={() => setEditing(true)} onSave={handleSave} saving={saving} />
      )}

      {result && editing && (
        <AIResultEditor onSave={() => { setEditing(false); handleSave() }} saving={saving} />
      )}
    </div>
  )
}
