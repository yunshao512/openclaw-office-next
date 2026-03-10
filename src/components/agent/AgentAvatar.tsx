import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Agent } from '../../types'
import { getLocalAvatar, getStatusColor, getStatusLabel } from '../../lib/utils'
import { useOfficeStore } from '../../store/office-store'
import { getAgentImageUrl, agentImageExists } from '../../lib/agent-image'
import { AgentDetailModal } from './AgentDetailModal'

interface AgentAvatarProps {
  agent: Agent
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  showStatus?: boolean
}

export function AgentAvatar({ agent: initialAgent, size = 'md', onClick, showStatus = true }: AgentAvatarProps) {
  const [showDetail, setShowDetail] = useState(false)
  const [useCustom, setUseCustom] = useState(false)
  
  const selectedAgentId = useOfficeStore((s) => s.selectedAgentId)
  const updateAgent = useOfficeStore((s) => s.updateAgent)
  const imageVersion = useOfficeStore((s) => s.imageVersion)
  const agent = useOfficeStore((s) => s.agents.find(a => a.id === initialAgent.id) || initialAgent)
  
  const isSelected = selectedAgentId === agent.id
  const statusColor = getStatusColor(agent.status)
  
  const sizeMap = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  }
  
  const pulseSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const faceIndex = agent.faceImageIndex || 1
  const defaultAvatarUrl = getLocalAvatar(agent.id, agent.wardrobe.gender, faceIndex)
  const customAvatarUrl = getAgentImageUrl(agent.id, 'face') + '?v=' + imageVersion

  useEffect(() => {
    agentImageExists(agent.id, 'face').then(setUseCustom)
  }, [agent.id, imageVersion])

  const avatarUrl = useCustom ? customAvatarUrl : defaultAvatarUrl

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
    setShowDetail(true)
  }

  return (
    <>
      <motion.div
        className={`relative cursor-pointer ${sizeMap[size]}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
      >
        <div
          className={`w-full h-full rounded-full overflow-hidden border-2 transition-all ${
            isSelected 
              ? 'border-blue-500 shadow-lg shadow-blue-500/30' 
              : 'border-gray-300 shadow-md'
          }`}
          style={{ 
            borderColor: isSelected ? statusColor : undefined,
            boxShadow: isSelected ? `0 0 0 3px ${statusColor}20` : undefined
          }}
        >
          <img
            src={avatarUrl}
            alt={agent.name}
            className="w-full h-full"
            style={{ objectFit: 'cover', display: 'block' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              if (target.src !== defaultAvatarUrl) {
                target.src = defaultAvatarUrl
                setUseCustom(false)
              }
            }}
          />
        </div>
        
        <motion.div
          className={`absolute bottom-0 right-0 ${pulseSize[size]} rounded-full border-2 border-white`}
          style={{ 
            backgroundColor: statusColor,
            boxShadow: `0 0 0 2px ${statusColor}50`
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.8, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {showStatus && agent.status !== 'idle' && (
          <motion.div
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-xs font-medium text-gray-600 bg-white px-2 py-0.5 rounded-full shadow-sm border border-gray-200">
              {getStatusLabel(agent.status)}
            </span>
          </motion.div>
        )}
      </motion.div>

      <AgentDetailModal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        agent={agent}
        onUpdateAgent={updateAgent}
      />
    </>
  )
}
