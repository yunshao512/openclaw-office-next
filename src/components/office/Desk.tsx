import { motion } from 'framer-motion'
import { AgentAvatar } from '../agent/AgentAvatar'
import type { Agent } from '../../types'
import { Monitor } from 'lucide-react'
import { getStatusLabel } from '../../lib/utils'

interface DeskProps {
  agent?: Agent
  index: number
  onSelect: () => void
}

export function Desk({ agent, index, onSelect }: DeskProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="h-full bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col hover:border-gray-300 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <Monitor className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-400">#{index + 1}</span>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center gap-2">
        {agent ? (
          <>
            <AgentAvatar agent={agent} size="md" onClick={onSelect} showStatus={false} />
            <div className="text-center">
              <p className="text-xs font-medium text-gray-900">{agent.name}</p>
              <p className="text-[10px] text-gray-500">{agent.currentTask || getStatusLabel(agent.status)}</p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <Monitor className="w-8 h-8" />
            <p className="text-xs">空闲工位</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
