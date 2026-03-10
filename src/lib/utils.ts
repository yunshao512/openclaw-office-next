import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function getLocalAvatar(_seed: string, gender?: 'male' | 'female' | 'neutral', imageIndex?: number): string {
  const genderPath = gender || 'female'
  const index = imageIndex || 1
  return `/avatars/${genderPath}/face/${index}.jpg`
}

export function getLocalFullBody(_seed: string, gender?: 'male' | 'female' | 'neutral', imageIndex?: number): string {
  const genderPath = gender || 'female'
  const index = imageIndex || 1
  return `/avatars/${genderPath}/fullbody/${index}.jpg`
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    idle: '#64748B',
    working: '#3B82F6',
    researching: '#8B5CF6',
    executing: '#F59E0B',
    syncing: '#10B981',
    error: '#EF4444',
    speaking: '#06B6D4',
    tool_calling: '#EC4899',
  }
  return colors[status] || colors.idle
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    idle: '待命',
    working: '工作中',
    researching: '研究中',
    executing: '执行中',
    syncing: '同步中',
    error: '错误',
    speaking: '对话中',
    tool_calling: '调用工具',
  }
  return labels[status] || '未知'
}
