import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getImages, getImageUrl, deleteImage } from '@/services/imageService'
import { Card } from '@/shared/components/ui/Card'
import { Spinner } from '@/shared/components/ui/Spinner'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { ErrorMessage } from '@/shared/components/ui/ErrorMessage'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { formatDate } from '@/lib/format'

export default function ImagesPage() {
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; path: string } | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['images'],
    queryFn: () => getImages(),
  })

  const deleteMutation = useMutation({
    mutationFn: ({ id, path }: { id: string; path: string }) => deleteImage(id, path),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] })
      setDeleteTarget(null)
    },
  })

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">图片历史</h2>

      {isLoading && <Spinner fullScreen />}
      {error && <ErrorMessage message="加载失败" />}

      {data && data.data.length === 0 && (
        <EmptyState message="暂无图片" />
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {data?.data.map(img => (
          <Card key={img.id} className="overflow-hidden p-0">
            <img
              src={getImageUrl(img.storage_path)}
              alt="食物照片"
              className="w-full h-32 object-cover"
              loading="lazy"
            />
            <div className="p-2 flex items-center justify-between">
              <span className="text-xs text-gray-400">{formatDate(img.created_at)}</span>
              <button
                onClick={() => setDeleteTarget({ id: img.id, path: img.storage_path })}
                className="text-xs text-gray-400 hover:text-red-500"
              >
                删除
              </button>
            </div>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="删除图片"
        message="确定要删除这张图片吗？此操作不可撤销。"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
