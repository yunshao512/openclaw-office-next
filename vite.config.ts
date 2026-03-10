import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

interface Config {
  server?: { port?: number; host?: string }
  frontend?: { port?: number; host?: string }
}

function loadConfig(): Config {
  try {
    const configPath = path.resolve(__dirname, 'conf/config.json')
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf-8')
      return JSON.parse(content)
    }
  } catch (error) {
    console.error('Failed to load config:', error)
  }
  return {}
}

const config = loadConfig()
const frontendPort = config.frontend?.port || 8088
const frontendHost = config.frontend?.host || '0.0.0.0'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: frontendPort,
    host: frontendHost,
  },
  publicDir: 'public',
})
