import { motion, AnimatePresence } from 'framer-motion'
import { X, Activity, Clock, Zap } from 'lucide-react'
import { useOfficeStore } from '../../store/office-store'
import { AgentAvatar } from '../agent/AgentAvatar'
import { getStatusColor, getStatusLabel } from '../../lib/utils'

export function AgentPanel() {
  const { agents, selectedAgentId, selectAgent } = useOfficeStore()
  const selectedAgent = agents.find((a) => a.id === selectedAgentId)
  
  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="w-80 bg-white border-l border-gray-200 h-full overflow-hidden flex flex-col ml-4"
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Agent 列表</h2>
          <span className="text-sm text-gray-500">{agents.length} 在线</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <AnimatePresence>
          {agents.map((agent) => (
            <motion.div
              key={agent.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`
                p-3 rounded-xl cursor-pointer transition-all
                ${selectedAgentId === agent.id
                  ? 'bg-blue-50 border-2 border-blue-500'
                  : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100 hover:border-gray-300'}
              `}
              onClick={() => selectAgent(selectedAgentId === agent.id ? null : agent.id)}
            >
              <div className="flex items-center gap-3">
                <AgentAvatar agent={agent} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 truncate">{agent.name}</span>
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getStatusColor(agent.status) }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {getStatusLabel(agent.status)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <AnimatePresence>
        {selectedAgent && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Agent 详情</h3>
                <button
                  onClick={() => selectAgent(null)}
                  className="p-1 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              
              <div className="flex items-center gap-4">
                <AgentAvatar agent={selectedAgent} size="lg" />
                <div>
                  <h4 className="font-medium text-gray-900">{selectedAgent.name}</h4>
                  <p className="text-sm text-gray-500">{getStatusLabel(selectedAgent.status)}</p>
                </div>
              </div>
              
              {selectedAgent.message && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-sm text-gray-700">{selectedAgent.message}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Activity className="w-4 h-4" />
                  <span>状态: {getStatusLabel(selectedAgent.status)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>最后活动: 刚刚</span>
                </div>
                {selectedAgent.tokenUsage && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Zap className="w-4 h-4" />
                    <span>Token: {selectedAgent.tokenUsage.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
