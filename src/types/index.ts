export type AgentStatus = 
  | 'idle' 
  | 'working' 
  | 'researching' 
  | 'executing' 
  | 'syncing' 
  | 'error' 
  | 'speaking'
  | 'tool_calling'

export type AgentGender = 'male' | 'female' | 'neutral'

export interface AgentWardrobe {
  gender: AgentGender
  hairstyle: string
  hairColor: string
  skinTone: string
  outfit: string
  outfitColor: string
  accessories: string[]
}

export interface AgentPosition {
  x: number
  y: number
  zone: 'desk' | 'lounge'
}

export interface Agent {
  id: string
  name: string
  status: AgentStatus
  message?: string
  wardrobe: AgentWardrobe
  faceImageIndex?: number
  fullbodyImageIndex?: number
  faceCropData?: {
    scale: number
    x: number
    y: number
  }
  fullbodyCropData?: {
    scale: number
    x: number
    y: number
  }
  position: AgentPosition
  lastActive: Date
  tokenUsage?: number
  currentTask?: string
}

export interface OfficeState {
  agents: Agent[]
  selectedAgentId: string | null
  isConnected: boolean
  gatewayUrl: string
}

export interface WardrobePreset {
  id: string
  name: string
  nameZh: string
  wardrobe: Partial<AgentWardrobe>
}
