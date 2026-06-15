import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useWeightRecords, useWeightTrend, useUpsertWeight, useDeleteWeight } from '@/features/weight/hooks/useWeight'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { Spinner } from '@/shared/components/ui/Spinner'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { TrendChart } from '@/shared/components/charts/TrendChart'
import { weightSchema, type WeightFormData } from '@/lib/zod-schemas'
import { todayStr, daysAgoStr, formatWeight } from '@/lib/format'
import { getUserMessage } from '@/lib/error-messages'

export default function WeightPage() {
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const today = todayStr()
  const thirtyDaysAgo = daysAgoStr(30)

  const { data: recordsData, isLoading: recordsLoading } = useWeightRecords()
  const { data: trendData } = useWeightTrend(thirtyDaysAgo, today)
  const upsertWeight = useUpsertWeight()
  const deleteWeight = useDeleteWeight()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<WeightFormData>({
    resolver: zodResolver(weightSchema),
    defaultValues: { recorded_date: today, weight_kg: undefined as unknown as number },
  })

  const onSubmit = async (data: WeightFormData) => {
    try {
      setError(null)
      await upsertWeight.mutateAsync(data)
      reset({ recorded_date: today, weight_kg: undefined as unknown as number })
    } catch (err) {
      setError(getUserMessage(err))
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteWeight.mutateAsync(deleteId)
    setDeleteId(null)
  }

  const chartData = (trendData || []).map(d => ({ date: d.recorded_date, value: d.weight_kg }))

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">体重管理</h2>

      {/* Chart */}
      <Card>
        <h3 className="text-sm font-medium text-gray-700 mb-2">30天趋势</h3>
        <TrendChart data={chartData} color="#8b5cf6" yLabel="kg" height={200} />
      </Card>

      {/* Log Form */}
      <Card>
        <h3 className="text-sm font-medium text-gray-700 mb-3">记录体重</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-3 items-end">
          <Input
            {...register('weight_kg', { valueAsNumber: true })}
            label="体重 (kg)"
            type="number"
            step="0.1"
            placeholder="70.0"
            error={errors.weight_kg?.message}
            className="w-32"
          />
          <Input
            {...register('recorded_date')}
            label="日期"
            type="date"
            error={errors.recorded_date?.message}
            className="w-40"
          />
          <Button type="submit" loading={isSubmitting}>记录</Button>
        </form>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </Card>

      {/* History List */}
      <Card>
        <h3 className="text-sm font-medium text-gray-700 mb-2">历史记录</h3>
        {recordsLoading ? <Spinner /> : (
          recordsData?.data.length === 0 ? (
            <EmptyState message="暂无体重记录" />
          ) : (
            <div className="divide-y divide-gray-100">
              {recordsData?.data.map(record => (
                <div key={record.id} className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">{record.recorded_date}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{formatWeight(record.weight_kg)}</span>
                    <button
                      onClick={() => setDeleteId(record.id)}
                      className="text-xs text-gray-400 hover:text-red-500"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        title="删除体重记录"
        message="确定要删除这条体重记录吗？"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleteWeight.isPending}
      />
    </div>
  )
}
