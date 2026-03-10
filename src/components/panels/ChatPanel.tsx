import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Smile } from 'lucide-react'
import { useOfficeStore } from '../../store/office-store'

export function ChatPanel() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<{ id: number; text: string; sender: string; time: Date }[]>([])
  const { selectedAgentId, agents } = useOfficeStore()
  const selectedAgent = agents.find((a) => a.id === selectedAgentId)

  const handleSend = () => {
    if (!message.trim() || !selectedAgent) return
    
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: message,
        sender: 'user',
        time: new Date(),
      },
    ])
    setMessage('')
    
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: `收到你的消息："${message}"，我正在处理中...`,
          sender: selectedAgent.id,
          time: new Date(),
        },
      ])
    }, 1000)
  }

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col max-h-64"
    >
      <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        <span className="text-sm font-medium text-gray-900">
          {selectedAgent ? `与 ${selectedAgent.name} 对话` : '选择一个 Agent 开始对话'}
        </span>
        {selectedAgent && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            在线
          </span>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${
                msg.sender === 'user'
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-900 rounded-bl-md'
              }`}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="p-3 border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
            <Smile className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={selectedAgent ? '输入消息...' : '请先选择一个 Agent'}
            disabled={!selectedAgent}
            className="flex-1 px-3 py-2 bg-gray-50 text-gray-900 placeholder-gray-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
          />
          <button
            onClick={handleSend}
            disabled={!selectedAgent || !message.trim()}
            className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
