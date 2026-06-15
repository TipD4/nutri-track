import { useNavigate } from 'react-router-dom'
import { useCreateRecord } from '@/features/records/hooks/useRecords'
import { FoodForm } from '@/features/records/components/FoodForm'
import { ErrorMessage } from '@/shared/components/ui/ErrorMessage'
import { getUserMessage } from '@/lib/error-messages'
import { useState } from 'react'
import type { MealRecordFormData } from '@/lib/zod-schemas'

export default function RecordNewPage() {
  const navigate = useNavigate()
  const createRecord = useCreateRecord()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: MealRecordFormData) => {
    try {
      setError(null)
      const { meal_type, note, foods } = data
      await createRecord.mutateAsync({
        meal: { meal_type, note: note || undefined },
        foods: foods.map(f => ({ name: f.name, weight_g: f.weight_g, calories: f.calories, protein_g: f.protein_g, fat_g: f.fat_g, carbs_g: f.carbs_g, consumption_percent: f.consumption_percent ?? 100 })),
      })
      navigate('/records')
    } catch (err) {
      setError(getUserMessage(err))
    }
  }

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-gray-800">手动录入</h2>
      {error && <ErrorMessage message={error} />}
      <FoodForm onSubmit={handleSubmit} isSubmitting={createRecord.isPending} />
    </div>
  )
}
