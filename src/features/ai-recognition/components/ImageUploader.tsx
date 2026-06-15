import { useState, useCallback, useRef } from 'react'
import { Spinner } from '@/shared/components/ui/Spinner'
import { uploadImage, getImageUrl } from '@/services/imageService'
import { IMAGE_MAX_SIZE } from '@/lib/constants'

interface ImageUploaderProps {
  onUploaded: (imagePath: string, imageId: string, previewUrl: string) => void
}

export function ImageUploader({ onUploaded }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(async (file: File) => {
    if (file.size > IMAGE_MAX_SIZE) {
      setError('图片大小超过限制（最大5MB）')
      return
    }
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件')
      return
    }

    setError(null)
    setUploading(true)
    try {
      const imageRecord = await uploadImage(file)
      const url = getImageUrl(imageRecord.storage_path)
      setPreview(url)
      onUploaded(imageRecord.storage_path, imageRecord.id, url)
    } catch (err) {
      setError('上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }, [onUploaded])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const file = e.clipboardData.files[0]
    if (file) processFile(file)
  }, [processFile])

  return (
    <div>
      {!preview ? (
        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 transition-colors"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onPaste={handlePaste}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Spinner size="md" />
              <span className="text-sm text-gray-500">上传中...</span>
            </div>
          ) : (
            <div>
              <div className="text-4xl mb-2">📸</div>
              <p className="text-sm text-gray-600 font-medium">点击、拖拽或粘贴食物照片</p>
              <p className="text-xs text-gray-400 mt-1">支持 JPG、PNG、WebP、HEIC</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="relative">
          <img src={preview} alt="预览" className="w-full rounded-xl max-h-64 object-cover" />
          <button
            onClick={() => { setPreview(null); setError(null) }}
            className="absolute top-2 right-2 bg-white/80 rounded-full p-1 text-xs"
          >
            重选
          </button>
        </div>
      )}
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  )
}
