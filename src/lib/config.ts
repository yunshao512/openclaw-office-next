export interface AppConfig {
  server: {
    port: number
    host: string
  }
  frontend: {
    port: number
    host: string
  }
  openclaw: {
    gatewayUrl: string
    pollInterval: number
    reconnectInterval: number
    logDir?: string
    logPollInterval?: number
  }
  logging?: {
    level: string
    dir: string
  }
  storage?: {
    agentsDir: string
    avatarsDir: string
  }
}

const defaultConfig: AppConfig = {
  server: { port: 3001, host: 'localhost' },
  frontend: { port: 8088, host: '0.0.0.0' },
  openclaw: {
    gatewayUrl: 'http://127.0.0.1:8089',
    pollInterval: 3000,
    reconnectInterval: 5000,
  },
}

let cachedConfig: AppConfig | null = null

export async function loadConfig(): Promise<AppConfig> {
  if (cachedConfig) return cachedConfig
  
  try {
    const response = await fetch('/config.json')
    if (response.ok) {
      cachedConfig = await response.json()
      return cachedConfig!
    }
  } catch (error) {
    console.warn('Failed to load config.json, using defaults:', error)
  }
  
  return defaultConfig
}

export function getConfig(): AppConfig {
  return cachedConfig || defaultConfig
}

export function getApiBaseUrl(): string {
  const config = getConfig()
  const host = config.server.host === '0.0.0.0' ? 'localhost' : config.server.host
  return `http://${host}:${config.server.port}`
}

export function resetConfigCache(): void {
  cachedConfig = null
}
