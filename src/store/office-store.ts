import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Agent } from '../types'

interface OfficeStore {
  agents: Agent[]
  selectedAgentId: string | null
  isConnected: boolean
  isLoading: boolean
  gatewayUrl: string
  imageVersion: number
  pollInterval: number
  
  setAgents: (agents: Agent[]) => void
  addAgent: (agent: Agent) => void
  updateAgent: (id: string, updates: Partial<Agent>) => void
  removeAgent: (id: string) => void
  selectAgent: (id: string | null) => void
  setConnected: (connected: boolean) => void
  setGatewayUrl: (url: string) => void
  refreshImages: () => void
  connectToGateway: () => Promise<void>
  startPolling: () => void
  stopPolling: () => void
}

const defaultAgents: Agent[] = [
  {
    id: 'agent-1',
    name: '小美',
    status: 'working',
    message: '正在处理文档...',
    wardrobe: {
      gender: 'female',
      hairstyle: 'long-wavy',
      hairColor: '#2D1B0E',
      skinTone: '#FFDBAC',
      outfit: 'blazer',
      outfitColor: '#1E3A5F',
      accessories: ['glasses'],
    },
    position: { x: 150, y: 200, zone: 'desk' },
    lastActive: new Date(),
    currentTask: '编写项目文档',
  },
  {
    id: 'agent-2',
    name: 'Alex',
    status: 'idle',
    wardrobe: {
      gender: 'male',
      hairstyle: 'short',
      hairColor: '#1A1A1A',
      skinTone: '#F5D0C5',
      outfit: 'casual',
      outfitColor: '#4A5568',
      accessories: [],
    },
    position: { x: 350, y: 200, zone: 'desk' },
    lastActive: new Date(),
  },
  {
    id: 'agent-3',
    name: '小雪',
    status: 'researching',
    message: '搜索相关资料中...',
    wardrobe: {
      gender: 'female',
      hairstyle: 'ponytail',
      hairColor: '#0F0F0F',
      skinTone: '#FFE0BD',
      outfit: 'dress',
      outfitColor: '#8B5CF6',
      accessories: ['earrings'],
    },
    position: { x: 550, y: 200, zone: 'desk' },
    lastActive: new Date(),
    currentTask: '调研市场数据',
  },
  {
    id: 'agent-4',
    name: '小琳',
    status: 'speaking',
    message: '正在与客户沟通...',
    wardrobe: {
      gender: 'female',
      hairstyle: 'bob',
      hairColor: '#6B4423',
      skinTone: '#FFDBAC',
      outfit: 'suit',
      outfitColor: '#2D3748',
      accessories: ['glasses', 'watch'],
    },
    position: { x: 200, y: 400, zone: 'lounge' },
    lastActive: new Date(),
    currentTask: '客户会议',
  },
]

let pollingIntervalId: ReturnType<typeof setInterval> | null = null

export const useOfficeStore = create<OfficeStore>()(
  persist(
    (set, get) => ({
      agents: defaultAgents,
      selectedAgentId: null,
      isConnected: false,
      isLoading: false,
      gatewayUrl: 'http://127.0.0.1:8089',
      imageVersion: Date.now(),
      pollInterval: 3000, // 3秒轮询

      setAgents: (agents) => set({ agents }),
      
      addAgent: (agent) => set((state) => ({
        agents: [...state.agents, agent]
      })),
      
      updateAgent: (id, updates) => {
        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === id ? { ...agent, ...updates } : agent
          ),
        }))
      },
      
      removeAgent: (id) => set((state) => ({
        agents: state.agents.filter((agent) => agent.id !== id),
      })),
      
      selectAgent: (id) => set({ selectedAgentId: id }),
      
      setConnected: (connected) => set({ isConnected: connected }),
      
      setGatewayUrl: (url) => set({ gatewayUrl: url }),
      
      refreshImages: () => set({ imageVersion: Date.now() }),
      
      startPolling: () => {
        const { pollInterval } = get()
        
        // 停止之前的轮询
        if (pollingIntervalId) {
          clearInterval(pollingIntervalId)
        }
        
        // 开始新的轮询
        pollingIntervalId = setInterval(async () => {
          const { connectToGateway } = get()
          await connectToGateway()
        }, pollInterval)
        
        console.log(`[startPolling] Started polling every ${pollInterval}ms`)
      },
      
      stopPolling: () => {
        if (pollingIntervalId) {
          clearInterval(pollingIntervalId)
          pollingIntervalId = null
          console.log('[stopPolling] Stopped polling')
        }
      },
      
      connectToGateway: async () => {
        set({ isLoading: true })
        try {
          const response = await fetch(`http://localhost:3001/api/openclaw/agents`)
          if (response.ok) {
            const data = await response.json()
            if (data.agents && Array.isArray(data.agents)) {
              const agents: Agent[] = data.agents.map((agent: any, index: number) => {
                const status = mapStatus(agent.status)
                const zone = status === 'idle' ? 'lounge' : 'desk'
                const positions = [
                  { x: 60, y: 100 },
                  { x: 240, y: 100 },
                  { x: 420, y: 100 },
                  { x: 60, y: 240 },
                  { x: 240, y: 240 },
                  { x: 420, y: 240 },
                ]
                
                return {
                  id: agent.id,
                  name: agent.name || agent.id,
                  status,
                  message: agent.message || agent.current_task || '',
                  wardrobe: agent.wardrobe || {
                    gender: 'female',
                    hairstyle: 'long-wavy',
                    hairColor: '#2D1B0E',
                    skinTone: '#FFDBAC',
                    outfit: 'blazer',
                    outfitColor: '#1E3A5F',
                    accessories: [],
                  },
                  position: { ...positions[index % positions.length], zone },
                  lastActive: new Date(agent.last_active || Date.now()),
                  currentTask: agent.currentTask || '',
                  tokenUsage: agent.token_usage,
                }
              })
              set({ agents, isConnected: true, isLoading: false })
              console.log(`[connectToGateway] Loaded ${agents.length} agents`)
            }
          } else {
            set({ isConnected: false, isLoading: false })
          }
        } catch (error) {
          console.error('Failed to connect to OpenClaw gateway:', error)
          set({ isConnected: false, isLoading: false })
        }
      },
    }),
    {
      name: 'office-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ agents: state.agents }),
    }
  )
)

function mapStatus(status: string): Agent['status'] {
  const statusMap: Record<string, Agent['status']> = {
    'idle': 'idle',
    'working': 'working',
    'write': 'working',
    'busy': 'working',
    'researching': 'researching',
    'research': 'researching',
    'search': 'researching',
    'executing': 'executing',
    'execute': 'executing',
    'run': 'executing',
    'running': 'executing',
    'syncing': 'syncing',
    'sync': 'syncing',
    'error': 'error',
    'speaking': 'speaking',
    'tool_calling': 'tool_calling',
  }
  return statusMap[status.toLowerCase()] || 'idle'
}
