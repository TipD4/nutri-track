import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSettings, useUpdateSettings } from '@/features/settings/hooks/useSettings'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { Spinner } from '@/shared/components/ui/Spinner'
import { targetsSchema, type TargetsFormData } from '@/lib/zod-schemas'
import { getUserMessage } from '@/lib/error-messages'

export default function SettingsPage() {
  const { data: profile, isLoading } = useSettings()
  const updateProfile = useUpdateSettings()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<TargetsFormData>({
    resolver: zodResolver(targetsSchema),
    values: {
      target_calories: profile?.target_calories ?? null,
      target_protein_g: profile?.target_protein_g ?? null,
      target_fat_g: profile?.target_fat_g ?? null,
      target_carbs_g: profile?.target_carbs_g ?? null,
    },
  })

  const onSubmit = async (data: TargetsFormData) => {
    try {
      setError(null)
      setSaved(false)
      await updateProfile.mutateAsync(data)
      setSaved(true)
    } catch (err) {
      setError(getUserMessage(err))
    }
  }

  if (isLoading) return <Spinner fullScreen />

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold text-gray-800">设置</h2>

      <Card>
        <div className="mb-4">
          <p className="text-sm text-gray-500">邮箱</p>
          <p className="text-gray-800">{profile?.id ? '已登录' : '未知'}</p>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-medium text-gray-700 mb-3">每日营养目标</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              {...register('target_calories', { valueAsNumber: true })}
              label="热量 (kcal)"
              type="number"
              placeholder="2000"
              error={errors.target_calories?.message}
            />
            <Input
              {...register('target_protein_g', { valueAsNumber: true })}
              label="蛋白质 (g)"
              type="number"
              placeholder="60"
              error={errors.target_protein_g?.message}
            />
            <Input
              {...register('target_fat_g', { valueAsNumber: true })}
              label="脂肪 (g)"
              type="number"
              placeholder="50"
              error={errors.target_fat_g?.message}
            />
            <Input
              {...register('target_carbs_g', { valueAsNumber: true })}
              label="碳水 (g)"
              type="number"
              placeholder="250"
              error={errors.target_carbs_g?.message}
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          {saved && <p className="text-xs text-green-600">已保存 ✓</p>}
          <Button type="submit" loading={isSubmitting} className="w-full">保存设置</Button>
        </form>
      </Card>
    </div>
  )
}
