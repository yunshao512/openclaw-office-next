import { AnimatePresence, motion } from 'framer-motion'
import { X, Activity, Clock, Zap, Settings, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { Agent } from '../../types'
import { getStatusColor, getStatusLabel, getLocalAvatar, getLocalFullBody } from '../../lib/utils'
import { useOfficeStore } from '../../store/office-store'
import { getAgentImageUrl, agentImageExists, deleteAgentImage } from '../../lib/agent-image'
import { ImageCropper } from './ImageCropper'

interface AgentDetailModalProps {
  isOpen: boolean
  onClose: () => void
  agent: Agent | null
  onUpdateAgent?: (agentId: string, updates: Partial<Agent>) => void
}

export function AgentDetailModal({ isOpen, onClose, agent: initialAgent, onUpdateAgent }: AgentDetailModalProps) {
  const [showCropper, setShowCropper] = useState(false)
  const [cropperType, setCropperType] = useState<'face' | 'fullbody'>('face')
  const [hasCustomFullbody, setHasCustomFullbody] = useState(false)
  const imageVersion = useOfficeStore((s) => s.imageVersion)
  const refreshImages = useOfficeStore((s) => s.refreshImages)
  const agent = useOfficeStore((s) => s.agents.find(a => a.id === initialAgent?.id) || initialAgent)

  useEffect(() => {
    if (agent) {
      agentImageExists(agent.id, 'fullbody').then(setHasCustomFullbody)
    }
  }, [agent, imageVersion])

  if (!agent) return null

  const fullbodyIndex = agent.fullbodyImageIndex || 1
  const defaultFullbodyUrl = getLocalFullBody(agent.id, agent.wardrobe.gender, fullbodyIndex)
  const customFullbodyUrl = getAgentImageUrl(agent.id, 'fullbody') + '?v=' + imageVersion
  const fullbodyUrl = hasCustomFullbody ? customFullbodyUrl : defaultFullbodyUrl

  const handleOpenCropper = () => {
    setShowCropper(true)
  }

  const handleSaveCrop = async (_imageData: string, imageIndex: number) => {    
    if (onUpdateAgent) {
      if (cropperType === 'face') {
        onUpdateAgent(agent.id, { faceImageIndex: imageIndex })
      } else {
        onUpdateAgent(agent.id, { fullbodyImageIndex: imageIndex })
      }
    }
    
    refreshImages()
  }

  const handleRemoveCustomImage = async (type: 'face' | 'fullbody') => {
    if (!confirm(`确定要删除自定义${type === 'face' ? '头像' : '全身照'}吗？`)) {
      return
    }
    
    try {
      await deleteAgentImage(agent.id, type)
      refreshImages()
    } catch (error) {
      console.error('Failed to delete image:', error)
      alert('删除图片失败')
    }
  }

  const allFaceImages = Array.from({ length: 9 }, (_, i) => 
    getLocalAvatar(agent.id, agent.wardrobe.gender, i + 1)
  )
  
  const allFullbodyImages = Array.from({ length: 9 }, (_, i) => 
    getLocalFullBody(agent.id, agent.wardrobe.gender, i + 1)
  )

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              onClick={onClose}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Agent 详情</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenCropper}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm border border-gray-300"
                    title="设置形象"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">设置形象</span>
                  </button>
                  {hasCustomFullbody && (
                    <button
                      onClick={() => handleRemoveCustomImage('fullbody')}
                      className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm border border-red-200"
                      title="删除自定义全身照"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">删除自定义</span>
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="w-64 h-96 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                        <img
                          src={fullbodyUrl}
                          alt={agent.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = defaultFullbodyUrl
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{agent.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getStatusColor(agent.status) }}
                        />
                        <span className="text-sm text-gray-600">{getStatusLabel(agent.status)}</span>
                      </div>
                    </div>

                    {agent.message && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-900">{agent.message}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      {agent.currentTask && (
                        <div className="flex items-center gap-2 text-sm">
                          <Activity className="w-4 h-4 text-blue-500" />
                          <span className="text-gray-600">当前任务:</span>
                          <span className="text-gray-900">{agent.currentTask}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">最后活动:</span>
                        <span className="text-gray-900">刚刚</span>
                      </div>
                      {agent.tokenUsage && (
                        <div className="flex items-center gap-2 text-sm">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <span className="text-gray-600">Token 使用:</span>
                          <span className="text-gray-900">{agent.tokenUsage.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ImageCropper
        isOpen={showCropper}
        onClose={() => setShowCropper(false)}
        imageUrls={cropperType === 'face' ? allFaceImages : allFullbodyImages}
        onSave={handleSaveCrop}
        title={cropperType === 'face' ? '选择头像' : '选择全身照'}
        aspectRatio={cropperType === 'face' ? 1 : 2/3}
        mode={cropperType}
        onModeChange={setCropperType}
        agentId={agent.id}
      />
    </>
  )
}
