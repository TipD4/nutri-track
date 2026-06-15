import { useState } from 'react'
import { useRecords, useDeleteRecord } from '@/features/records/hooks/useRecords'
import { MealTypeTabs } from '@/features/records/components/MealTypeTabs'
import { RecordCard } from '@/features/records/components/RecordCard'
import { Spinner } from '@/shared/components/ui/Spinner'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { ErrorMessage } from '@/shared/components/ui/ErrorMessage'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { useNavigate } from 'react-router-dom'
import type { MealType } from '@/types/food'
import { todayStr } from '@/lib/format'

export function RecordList() {
  const today = todayStr()
  const [activeTab, setActiveTab] = useState<MealType>('breakfast')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const navigate = useNavigate()

  const { data, isLoading, error, refetch } = useRecords(today, activeTab)
  const deleteRecord = useDeleteRecord()

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteRecord.mutateAsync(deleteId)
    setDeleteId(null)
  }

  return (
    <div className="space-y-4">
      <MealTypeTabs active={activeTab} onChange={setActiveTab} />

      {isLoading && <Spinner size="md" />}
      {error && <ErrorMessage message="加载失败" onRetry={() => refetch()} />}

      {data && data.data.length === 0 && (
        <EmptyState
          message="暂无记录"
          action={{ label: '添加记录', onClick: () => navigate('/records/new') }}
        />
      )}

      <div className="space-y-2">
        {data?.data.map(record => (
          <RecordCard key={record.id} record={record} onDelete={setDeleteId} />
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="删除记录"
        message="确定要删除这条饮食记录吗？此操作不可撤销。"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleteRecord.isPending}
      />
    </div>
  )
}
