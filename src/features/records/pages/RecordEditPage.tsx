import { useParams, useNavigate } from 'react-router-dom'
import { useRecord, useUpdateRecord, useDeleteRecord } from '@/features/records/hooks/useRecords'
import { FoodForm } from '@/features/records/components/FoodForm'
import { Spinner } from '@/shared/components/ui/Spinner'
import { ErrorMessage } from '@/shared/components/ui/ErrorMessage'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { Button } from '@/shared/components/ui/Button'
import { getUserMessage } from '@/lib/error-messages'
import { useState } from 'react'
import type { MealRecordFormData } from '@/lib/zod-schemas'

export default function RecordEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: record, isLoading, error } = useRecord(id!)
  const updateRecord = useUpdateRecord()
  const deleteRecord = useDeleteRecord()
  const [showDelete, setShowDelete] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  if (isLoading) return <Spinner fullScreen />
  if (error || !record) return <ErrorMessage message="记录不存在" />

  const defaultValues: MealRecordFormData = {
    meal_type: record.meal_type,
    note: record.note || '',
    foods: record.food_items.map(f => ({
      name: f.name,
      weight_g: f.weight_g,
      calories: f.calories,
      protein_g: f.protein_g,
      fat_g: f.fat_g,
      carbs_g: f.carbs_g,
      consumption_percent: f.consumption_percent ?? 100,
    })),
  }

  const handleSubmit = async (data: MealRecordFormData) => {
    try {
      setSaveError(null)
      const { meal_type, note, foods } = data
      await updateRecord.mutateAsync({
        id: id!,
        meal: { meal_type, note: note || undefined },
        foods: foods.map(f => ({ name: f.name, weight_g: f.weight_g, calories: f.calories, protein_g: f.protein_g, fat_g: f.fat_g, carbs_g: f.carbs_g, consumption_percent: f.consumption_percent ?? 100 })),
      })
      navigate('/records')
    } catch (err) {
      setSaveError(getUserMessage(err))
    }
  }

  const handleDelete = async () => {
    await deleteRecord.mutateAsync(id!)
    navigate('/records')
  }

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">编辑记录</h2>
        <Button variant="danger" size="sm" onClick={() => setShowDelete(true)}>删除</Button>
      </div>
      {saveError && <ErrorMessage message={saveError} />}
      <FoodForm onSubmit={handleSubmit} isSubmitting={updateRecord.isPending} defaultValues={defaultValues} />

      <ConfirmDialog
        open={showDelete}
        title="删除记录"
        message="确定要删除这条饮食记录吗？此操作不可撤销。"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        loading={deleteRecord.isPending}
      />
    </div>
  )
}
