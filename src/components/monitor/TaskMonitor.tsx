import { useState, useEffect } from 'react'
import { Activity, Clock, User } from 'lucide-react'
import type { Agent } from '../../types'

interface TaskMonitorProps {
  pollInterval?: number
}

export function TaskMonitor({ pollInterval = 5000 }: TaskMonitorProps) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchAgents = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:3001/api/openclaw/agents')
      if (response.ok) {
        const data = await response.json()
        setAgents(data.agents || [])
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAgents()
    const interval = setInterval(fetchAgents, pollInterval)
    return () => clearInterval(interval)
  }, [pollInterval])

  const formatTime = (timeStr: string | Date) => {
    try {
      const date = typeof timeStr === 'string' ? new Date(timeStr) : timeStr
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    } catch {
      return '刚刚'
    }
  }

  const activeAgents = agents.filter(a => 
    a.status !== 'idle' && (a.currentTask || a.message)
  )

  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      working: 'border-l-blue-500 bg-blue-50',
      researching: 'border-l-purple-500 bg-purple-50',
      executing: 'border-l-orange-500 bg-orange-50',
      speaking: 'border-l-cyan-500 bg-cyan-50',
      tool_calling: 'border-l-pink-500 bg-pink-50',
      syncing: 'border-l-green-500 bg-green-50',
      error: 'border-l-red-500 bg-red-50',
    }
    return styles[status] || 'border-l-gray-300 bg-gray-50'
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-3 px-1 flex-shrink-0">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Activity className="w-4 h-4 text-blue-500" />
          <span>当前任务</span>
          {isLoading && (
            <span className="text-blue-500 animate-pulse">刷新中...</span>
          )}
        </div>
        {lastUpdate && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{lastUpdate.toLocaleTimeString('zh-CN')}</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pr-2">
        {activeAgents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Activity className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">所有 Agent 待命中</p>
            <p className="text-xs mt-1">暂无正在执行的任务</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeAgents.map((agent, index) => (
              <div
                key={`${agent.id}-${index}`}
                className={`border-l-4 rounded-r px-3 py-2 ${getStatusStyle(agent.status)}`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 text-gray-400" />
                    <span className="text-xs font-medium text-gray-900">
                      {agent.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span className="font-mono">
                      {formatTime(new Date(agent.lastActive))}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-700 leading-relaxed">
                  {agent.currentTask || agent.message || '执行任务中...'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeAgents.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500 text-center flex-shrink-0">
          {activeAgents.length} 个 Agent 正在工作中
        </div>
      )}
    </div>
  )
}
