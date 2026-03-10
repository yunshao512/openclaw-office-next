import { useOfficeStore } from '../../store/office-store'
import { Desk } from './Desk'
import { TaskMonitor } from '../monitor/TaskMonitor'
import { useState, useEffect } from 'react'

interface Config {
  openclaw: {
    gatewayUrl: string
    pollInterval: number
    reconnectInterval: number
  }
}

export function OfficeScene() {
  const { agents, selectAgent } = useOfficeStore()
  const [gatewayUrl, setGatewayUrl] = useState('http://127.0.0.1:8089')
  
  const deskAgents = agents.filter((a) => a.position.zone === 'desk')
  const loungeAgents = agents.filter((a) => a.position.zone === 'lounge')
  
  useEffect(() => {
    fetch('/config.json')
      .then(res => res.json())
      .then((config: Config) => {
        setGatewayUrl(config.openclaw.gatewayUrl)
      })
      .catch(err => console.error('Failed to load config:', err))
  }, [])
  
  const deskPositions = [
    { x: 60, y: 100 },
    { x: 240, y: 100 },
    { x: 420, y: 100 },
    { x: 60, y: 240 },
    { x: 240, y: 240 },
    { x: 420, y: 240 },
  ]
  
  const loungePositions = [
    { x: 60, y: 100 },
    { x: 240, y: 100 },
    { x: 420, y: 100 },
    { x: 60, y: 240 },
    { x: 240, y: 240 },
    { x: 420, y: 240 },
  ]

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-2xl overflow-hidden p-6">
      <div className="grid grid-cols-3 gap-6 h-full">
        
        <div className="col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm" style={{ height: 'calc(55% - 12px)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                办公区
              </h2>
              <span className="text-sm text-gray-500">{deskAgents.length} 个工位</span>
            </div>
            <div className="grid grid-cols-3 gap-4 h-[calc(100%-3rem)]">
              {deskPositions.slice(0, 6).map((_pos, i) => (
                <div key={i} className="relative">
                  <Desk
                    agent={deskAgents[i]}
                    index={i}
                    onSelect={() => deskAgents[i] && selectAgent(deskAgents[i].id)}
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm" style={{ height: 'calc(45% - 12px)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                休息区
              </h2>
              <span className="text-sm text-gray-500">{loungeAgents.length} 个座位</span>
            </div>
            <div className="grid grid-cols-3 gap-4 h-[calc(100%-3rem)]">
              {loungePositions.slice(0, 6).map((_pos, i) => (
                <div key={i} className="relative">
                  <Desk
                    agent={loungeAgents[i]}
                    index={i}
                    onSelect={() => loungeAgents[i] && selectAgent(loungeAgents[i].id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm" style={{ height: 'calc(55% - 12px)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                监控区
              </h2>
            </div>
            <div className="h-[calc(100%-3rem)]">
              <TaskMonitor pollInterval={5000} />
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm" style={{ height: 'calc(45% - 12px)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                系统状态
              </h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">活跃 Agent</span>
                <span className="text-lg font-semibold text-gray-900">{agents.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">工作中</span>
                <span className="text-lg font-semibold text-blue-600">{agents.filter(a => a.status !== 'idle').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">待命</span>
                <span className="text-lg font-semibold text-gray-400">{agents.filter(a => a.status === 'idle').length}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm text-gray-600">已连接 Gateway</span>
                </div>
                <p className="text-xs text-gray-400 mt-1 ml-4">{gatewayUrl}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
