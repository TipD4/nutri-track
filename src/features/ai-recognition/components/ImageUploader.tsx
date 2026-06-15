import { useState, useCallback, useRef, useEffect } from 'react'
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
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const albumInputRef = useRef<HTMLInputElement>(null)
  // Track the local blob URL so we can clean it up on unmount
  const localBlobRef = useRef<string | null>(null)

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (localBlobRef.current) {
        URL.revokeObjectURL(localBlobRef.current)
      }
    }
  }, [])

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

    // Show local preview IMMEDIATELY using object URL (fixes blue ? mark on mobile)
    // Keep using local blob for display — most reliable for mobile browsers
    if (localBlobRef.current) {
      URL.revokeObjectURL(localBlobRef.current)
    }
    const localPreviewUrl = URL.createObjectURL(file)
    localBlobRef.current = localPreviewUrl
    setPreview(localPreviewUrl)

    setUploading(true)
    try {
      const imageRecord = await uploadImage(file)
      const remoteUrl = getImageUrl(imageRecord.storage_path)
      // Pass remote URL to parent for AI processing, but keep local blob for display
      onUploaded(imageRecord.storage_path, imageRecord.id, remoteUrl)
    } catch (err) {
      setError('上传失败，请重试')
      // Keep local preview even if upload fails
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
    // Reset input value so same file can be re-selected
    e.target.value = ''
  }, [processFile])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const file = e.clipboardData.files[0]
    if (file) processFile(file)
  }, [processFile])

  const resetPreview = () => {
    if (localBlobRef.current) {
      URL.revokeObjectURL(localBlobRef.current)
      localBlobRef.current = null
    }
    setPreview(null)
    setError(null)
  }

  return (
    <div>
      {!preview ? (
        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onPaste={handlePaste}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <Spinner size="md" />
              <span className="text-sm text-gray-500">上传中...</span>
            </div>
          ) : (
            <div>
              <div className="text-4xl mb-3">📸</div>
              <p className="text-sm text-gray-600 font-medium mb-4">
                点击、拖拽或粘贴食物照片
              </p>
              <p className="text-xs text-gray-400 mb-4">
                支持 JPG、PNG、WebP、HEIC
              </p>

              {/* Two separate buttons for mobile: Camera & Album */}
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 active:bg-primary-800 transition-colors"
                >
                  <span className="text-lg">📷</span>
                  拍照
                </button>
                <button
                  type="button"
                  onClick={() => albumInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <span className="text-lg">🖼️</span>
                  相册
                </button>
              </div>

              {/* Camera input: capture="environment" opens rear camera directly on mobile */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Album input: no capture attribute, opens photo library */}
              <input
                ref={albumInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          <img
            src={preview}
            alt="预览"
            className="w-full rounded-xl max-h-64 object-cover"
            onError={() => setError('图片加载失败')}
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <svg className="animate-spin h-8 w-8 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-xs text-white">上传中...</span>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={resetPreview}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full px-3 py-1 text-xs font-medium shadow-sm transition-colors"
          >
            重选
          </button>
        </div>
      )}
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  )
}
