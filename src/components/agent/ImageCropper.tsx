import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ZoomIn, ZoomOut, RotateCcw, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop'
import type { Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

interface ImageCropperProps {
  isOpen: boolean
  onClose: () => void
  imageUrls: string[]
  onSave: (imageData: string, imageIndex: number) => void
  title: string
  aspectRatio?: number
  mode?: 'face' | 'fullbody'
  onModeChange?: (mode: 'face' | 'fullbody') => void
  agentId?: string
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight,
  )
}

export function ImageCropper({ 
  isOpen, 
  onClose, 
  imageUrls, 
  onSave, 
  title,
  aspectRatio = 1,
  mode = 'face',
  onModeChange,
  agentId,
}: ImageCropperProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [saving, setSaving] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  const currentImage = imageUrls[currentIndex]

  useEffect(() => {
    setCurrentIndex(0)
    setCrop(undefined)
    setCompletedCrop(undefined)
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [mode])

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, aspectRatio))
  }, [aspectRatio])

  const handlePrevImage = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : imageUrls.length - 1))
    setCrop(undefined)
    setCompletedCrop(undefined)
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleNextImage = () => {
    setCurrentIndex((prev) => (prev < imageUrls.length - 1 ? prev + 1 : 0))
    setCrop(undefined)
    setCompletedCrop(undefined)
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.1, 3))
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.5))

  const handleReset = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
    if (imgRef.current) {
      const { width, height } = imgRef.current
      setCrop(centerAspectCrop(width, height, aspectRatio))
    }
  }

  const getCroppedImage = useCallback(() => {
    const image = imgRef.current
    if (!image || !completedCrop) return null

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const targetWidth = mode === 'face' ? 200 : 300
    const targetHeight = mode === 'face' ? 200 : 450
    canvas.width = targetWidth
    canvas.height = targetHeight

    const displayWidth = image.width
    const displayHeight = image.height

    const scaleX = image.naturalWidth / displayWidth
    const scaleY = image.naturalHeight / displayHeight

    const sourceX = completedCrop.x * scaleX
    const sourceY = completedCrop.y * scaleY
    const sourceWidth = completedCrop.width * scaleX
    const sourceHeight = completedCrop.height * scaleY

    ctx.drawImage(
      image,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, targetWidth, targetHeight
    )

    return canvas.toDataURL('image/jpeg', 0.9)
  }, [completedCrop, mode])

  const handleSave = async () => {
    setSaving(true)
    try {
      const imageData = getCroppedImage()
      if (imageData && agentId) {
        const filename = mode === 'face' ? 'face.jpg' : 'fullbody.jpg'
        await fetch(`http://localhost:3001/api/agent/${agentId}/image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: mode, imageData, filename }),
        })
      }
      onSave(currentImage, currentIndex + 1)
      onClose()
    } catch (error) {
      console.error('Failed to save image:', error)
      alert('保存图片失败')
    } finally {
      setSaving(false)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || scale <= 1) return
    const startX = e.clientX - position.x
    const startY = e.clientY - position.y

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX - startX, y: e.clientY - startY })
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                {onModeChange && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onModeChange('face')}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        mode === 'face' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                      }`}
                    >
                      头像
                    </button>
                    <button
                      onClick={() => onModeChange('fullbody')}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        mode === 'fullbody' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                      }`}
                    >
                      全身
                    </button>
                  </div>
                )}
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex gap-4 mb-4">
                <span className="text-sm text-gray-600">图片 {currentIndex + 1} / {imageUrls.length}</span>
                <div className="flex-1 flex justify-center gap-2">
                  <button onClick={handleZoomOut} className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300">
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <span className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm border border-gray-300">{Math.round(scale * 100)}%</span>
                  <button onClick={handleZoomIn} className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300">
                    <ZoomIn className="w-5 h-5" />
                  </button>
                  <button onClick={handleReset} className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300">
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div 
                className="relative bg-gray-100 rounded-xl overflow-hidden mb-4 border border-gray-200"
                style={{ height: '500px', cursor: scale > 1 ? 'grab' : 'default' }}
                onMouseDown={scale > 1 ? handleMouseDown : undefined}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={aspectRatio}
                  >
                    <img
                      ref={imgRef}
                      src={currentImage}
                      alt="Preview"
                      onLoad={onImageLoad}
                      crossOrigin="anonymous"
                      style={{
                        transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                        transformOrigin: 'center',
                        maxHeight: '500px',
                        objectFit: 'contain',
                      }}
                    />
                  </ReactCrop>
                </div>

                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 rounded-full hover:bg-white shadow-lg border border-gray-300"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>
                
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 rounded-full hover:bg-white shadow-lg border border-gray-300"
                >
                  <ChevronRight className="w-6 h-6 text-gray-700" />
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300"
                  disabled={saving}
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Check className="w-5 h-5" />
                  {saving ? '保存中...' : '确认选择'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
