import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { OfficeScene } from './components/office/OfficeScene'
import { AgentPanel } from './components/panels/AgentPanel'
import { useOfficeStore } from './store/office-store'
import { Menu, X, RefreshCw, Wifi, WifiOff } from 'lucide-react'

function App() {
  const [showSidebar, setShowSidebar] = useState(true)
  const { agents, isConnected, isLoading, connectToGateway, startPolling, stopPolling } = useOfficeStore()

  useEffect(() => {
    // 初始连接
    connectToGateway()
    // 启动轮询（3秒间隔）
    startPolling()
    
    return () => {
      stopPolling()
    }
  }, [connectToGateway, startPolling, stopPolling])

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            {showSidebar ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">OC</span>
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">OpenClaw Office</h1>
              <p className="text-xs text-gray-500">多 Agent 协作可视化</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={connectToGateway}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="从 OpenClaw 刷新 Agent 列表"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isLoading ? '刷新中...' : '刷新'}</span>
          </button>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
            isConnected 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-700">已连接 {agents.length}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-600" />
                <span className="text-xs font-medium text-red-700">未连接</span>
              </>
            )}
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex overflow-hidden min-h-0 gap-4">
        <main className="flex-1 flex flex-col p-4 overflow-hidden min-h-0">
          <div className="flex-1 overflow-hidden min-h-0">
            <OfficeScene />
          </div>
        </main>
        
        <AnimatePresence>
          {showSidebar && (
            <AgentPanel />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
