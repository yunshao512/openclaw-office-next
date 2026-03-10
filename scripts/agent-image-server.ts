import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import os from 'os'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CONFIG_FILE = path.join(__dirname, '../conf/config.json')

interface Config {
  server?: {
    port?: number
    host?: string
  }
  openclaw?: {
    logDir?: string
    logPollInterval?: number
  }
}

function loadConfig(): Config {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, 'utf-8')
      return JSON.parse(content)
    }
  } catch (error) {
    console.error('Failed to load config:', error)
  }
  return {}
}

const config = loadConfig()
const PORT = parseInt(process.env.PORT || '') || config.server?.port || 3001
const OPENCLAW_LOG_DIR = config.openclaw?.logDir || '/tmp/openclaw'

const app = express()
const AGENTS_DIR = path.join(__dirname, '../public/agents')
const OPENCLAW_DIR = path.join(os.homedir(), '.openclaw')

const ALLOWED_ORIGINS = [
  'http://localhost:8088',
  'http://127.0.0.1:8088',
  `http://localhost:${PORT}`,
  `http://127.0.0.1:${PORT}`,
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true)
    } else {
      callback(null, true)
    }
  },
  credentials: true,
}))
app.use(express.json({ limit: '50mb' }))

function validateAgentId(agentId: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(agentId)
}

function sanitizeFilename(filename: string): string | null {
  const safe = filename.replace(/[^a-zA-Z0-9_.-]/g, '')
  if (safe !== filename || safe.includes('..')) return null
  return safe
}

if (!fs.existsSync(AGENTS_DIR)) {
  fs.mkdirSync(AGENTS_DIR, { recursive: true })
}

// 获取 OpenClaw agents
app.get('/api/openclaw/agents', (req, res) => {
  try {
    const configPath = path.join(OPENCLAW_DIR, 'openclaw.json')
    if (!fs.existsSync(configPath)) {
      return res.status(404).json({ error: 'OpenClaw config not found' })
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    const agentsList = config.agents?.list || []
    const agentsDir = path.join(OPENCLAW_DIR, 'agents')
    
    // 扫描 agents 目录中的所有 agent
    let discoveredAgents: string[] = []
    if (fs.existsSync(agentsDir)) {
      discoveredAgents = fs.readdirSync(agentsDir).filter(name => {
        const agentPath = path.join(agentsDir, name)
        return fs.statSync(agentPath).isDirectory()
      })
    }
    
    // 合并配置中的和发现的 agents（去重）
    const configuredIds = new Set(agentsList.map((a: any) => a.id))
    const allAgentIds = [...new Set([...configuredIds, ...discoveredAgents])]
    
    const agents = allAgentIds.map((agentId: string) => {
      const configAgent = agentsList.find((a: any) => a.id === agentId) || {}
      const profilePath = path.join(OPENCLAW_DIR, 'agents', agentId, 'agent', 'profile.json')
      const sessionsPath = path.join(OPENCLAW_DIR, 'agents', agentId, 'sessions', 'sessions.json')
      
      let profile: any = {}
      let status = 'idle'
      let lastActive = new Date().toISOString()
      let currentTask = ''
      
      if (fs.existsSync(profilePath)) {
        try {
          profile = JSON.parse(fs.readFileSync(profilePath, 'utf-8'))
        } catch (e) {
          console.error(`Failed to read profile for ${agentId}:`, e)
        }
      }
      
      // 多维度状态判断：基于 memory 文件和会话活动
      const workspacePath = configAgent.workspace || path.join(OPENCLAW_DIR, 'workspace')
      const memoryDir = path.join(workspacePath, 'memory')
      
      // 1. 检查 memory 目录的最近活动（参考 Star-Office-UI）
      if (fs.existsSync(memoryDir)) {
        try {
          const mdFiles = fs.readdirSync(memoryDir)
            .filter(f => f.endsWith('.md'))
            .map(f => ({
              name: f,
              path: path.join(memoryDir, f),
              mtime: fs.statSync(path.join(memoryDir, f)).mtime.getTime()
            }))
            .sort((a, b) => b.mtime - a.mtime)
          
          if (mdFiles.length > 0) {
            const latestFile = mdFiles[0]
            const latestTime = new Date(latestFile.mtime)
            const now = new Date()
            const timeDiff = now.getTime() - latestTime.getTime()
            
            // 根据文件修改时间判断状态
            if (timeDiff < 5 * 60 * 1000) { // 5分钟内
              // 根据文件名判断具体状态
              if (latestFile.name.toLowerCase().includes('research') || 
                  latestFile.name.toLowerCase().includes('knowledge')) {
                status = 'researching'
                currentTask = '研究分析中...'
              } else if (latestFile.name.toLowerCase().includes('execute') ||
                         latestFile.name.toLowerCase().includes('task')) {
                status = 'executing'
                currentTask = '执行任务中...'
              } else {
                status = 'working'
                currentTask = `最近活动: ${latestFile.name.replace('.md', '')}`
              }
              lastActive = latestTime.toISOString()
            } else if (timeDiff < 60 * 60 * 1000) { // 1小时内
              status = 'idle'
              currentTask = '短暂休息中'
              lastActive = latestTime.toISOString()
            } else {
              status = 'idle'
              currentTask = '待命中'
              lastActive = latestTime.toISOString()
            }
          }
        } catch (e) {
          console.error(`Failed to read memory dir for ${agentId}:`, e)
        }
      }
      
      // 2. 检查会话状态作为补充（如果 memory 没有活动）
      if (status === 'idle' && fs.existsSync(sessionsPath)) {
        try {
          const sessionsData = JSON.parse(fs.readFileSync(sessionsPath, 'utf-8'))
          const sessionKeys = Object.keys(sessionsData)
          
          if (sessionKeys.length > 0) {
            let latestSession: any = null
            let latestTime = 0
            
            for (const key of sessionKeys) {
              const session = sessionsData[key]
              if (session && session.updatedAt && session.updatedAt > latestTime) {
                latestTime = session.updatedAt
                latestSession = session
              }
            }
            
            if (latestSession && latestSession.updatedAt) {
              const sessionTime = new Date(latestSession.updatedAt)
              const now = new Date()
              const timeDiff = now.getTime() - sessionTime.getTime()
              
              if (timeDiff < 5 * 60 * 1000) {
                status = 'speaking'
                lastActive = sessionTime.toISOString()
                currentTask = '对话中...'
                
                if (latestSession.sessionFile && fs.existsSync(latestSession.sessionFile)) {
                  try {
                    const sessionContent = fs.readFileSync(latestSession.sessionFile, 'utf-8')
                    const lines = sessionContent.split('\n').filter(l => l.trim())
                    if (lines.length > 0) {
                      const lastLine = JSON.parse(lines[lines.length - 1])
                      if (lastLine.message && lastLine.message.content) {
                        const content = lastLine.message.content
                        if (Array.isArray(content)) {
                          for (const item of content) {
                            if (item.type === 'text' && item.text) {
                              currentTask = item.text.substring(0, 50) + (item.text.length > 50 ? '...' : '')
                              break
                            }
                          }
                        }
                      }
                    }
                  } catch (e) {
                    // 忽略解析错误
                  }
                }
              } else {
                lastActive = sessionTime.toISOString()
              }
            }
          }
        } catch (e) {
          console.error(`Failed to read sessions for ${agentId}:`, e)
        }
      }
      
      return {
        id: agentId,
        name: configAgent.name || profile.name || agentId,
        status,
        message: '',
        model: configAgent.model || 'unknown',
        workspace: configAgent.workspace,
        currentTask: status === 'working' ? currentTask : '',
        lastActive,
        wardrobe: {
          gender: 'female',
          hairstyle: 'long-wavy',
          hairColor: '#2D1B0E',
          skinTone: '#FFDBAC',
          outfit: 'blazer',
          outfitColor: '#1E3A5F',
          accessories: [],
        },
      }
    })
    
    res.json({ agents })
  } catch (error) {
    console.error('Failed to read OpenClaw config:', error)
    res.status(500).json({ error: 'Failed to read OpenClaw config' })
  }
})

// 保存 base64 图片
app.post('/api/agent/:agentId/image', (req, res) => {
  const { agentId } = req.params
  const { type, imageData, filename } = req.body
  
  console.log(`[image] Saving ${filename} for ${agentId}`)

  if (!agentId || !imageData || !filename) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  if (!validateAgentId(agentId)) {
    return res.status(400).json({ error: 'Invalid agentId format' })
  }

  const safeFilename = sanitizeFilename(filename)
  if (!safeFilename) {
    return res.status(400).json({ error: 'Invalid filename' })
  }

  if (!imageData.startsWith('data:image/')) {
    return res.status(400).json({ error: 'Invalid image data format' })
  }

  const agentDir = path.join(AGENTS_DIR, agentId)
  if (!fs.existsSync(agentDir)) {
    fs.mkdirSync(agentDir, { recursive: true })
  }

  const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '')
  const buffer = Buffer.from(base64Data, 'base64')
  
  const filePath = path.join(agentDir, safeFilename)
  fs.writeFileSync(filePath, buffer)

  console.log(`[image] Saved to ${filePath}, size: ${buffer.length}`)

  const imageUrl = `/agents/${agentId}/${safeFilename}`
  res.json({ success: true, path: imageUrl })
})

// 获取配置
app.get('/api/agent/:agentId/config', (req, res) => {
  const { agentId } = req.params
  
  if (!validateAgentId(agentId)) {
    return res.status(400).json({ error: 'Invalid agentId format' })
  }
  
  const configPath = path.join(AGENTS_DIR, agentId, 'config.json')
  
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    res.json(config)
  } else {
    res.json({})
  }
})

// 保存配置
app.post('/api/agent/:agentId/config', (req, res) => {
  const { agentId } = req.params
  const config = req.body
  
  if (!validateAgentId(agentId)) {
    return res.status(400).json({ error: 'Invalid agentId format' })
  }
  
  const agentDir = path.join(AGENTS_DIR, agentId)
  if (!fs.existsSync(agentDir)) {
    fs.mkdirSync(agentDir, { recursive: true })
  }
  
  const configPath = path.join(agentDir, 'config.json')
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
  
  res.json({ success: true })
})

// 删除图片
app.delete('/api/agent/:agentId/image', (req, res) => {
  const { agentId } = req.params
  const { type } = req.query
  
  if (!validateAgentId(agentId)) {
    return res.status(400).json({ error: 'Invalid agentId format' })
  }
  
  console.log(`[image] Deleting ${type} for ${agentId}`)
  
  const filename = type === 'face' ? 'face.jpg' : 'fullbody.jpg'
  const filePath = path.join(AGENTS_DIR, agentId, filename)
  
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
    console.log(`[image] Deleted ${filePath}`)
    res.json({ success: true })
  } else {
    res.status(404).json({ error: 'Image not found' })
  }
})

// 获取 OpenClaw 日志
app.get('/api/openclaw/logs', (req, res) => {
  try {
    if (!fs.existsSync(OPENCLAW_LOG_DIR)) {
      return res.json({ logs: [], message: 'Log directory not found' })
    }

    const files = fs.readdirSync(OPENCLAW_LOG_DIR)
      .filter(f => f.endsWith('.log') || f.endsWith('.txt'))
      .map(f => ({
        name: f,
        path: path.join(OPENCLAW_LOG_DIR, f),
        mtime: fs.statSync(path.join(OPENCLAW_LOG_DIR, f)).mtime.getTime()
      }))
      .sort((a, b) => b.mtime - a.mtime)

    const now = Date.now()
    const tenMinutesAgo = now - 10 * 60 * 1000
    const logs: any[] = []

    for (const file of files) {
      try {
        const content = fs.readFileSync(file.path, 'utf-8')
        const lines = content.split('\n')
        
        for (const line of lines) {
          if (!line.trim()) continue
          
          // 匹配包含 error 的日志行（不区分大小写）
          if (line.toLowerCase().includes('error') || 
              line.toLowerCase().includes('exception') ||
              line.toLowerCase().includes('fail')) {
            
            // 尝试从日志行中提取时间戳
            const timestampMatch = line.match(/(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2})/)
            let logTime = file.mtime
            let displayTime = new Date(file.mtime).toISOString()
            
            if (timestampMatch) {
              try {
                const parsedTime = new Date(timestampMatch[1])
                if (!isNaN(parsedTime.getTime())) {
                  logTime = parsedTime.getTime()
                  displayTime = timestampMatch[1]
                }
              } catch (e) {
                // 忽略解析错误
              }
            }

            // 只返回最近 10 分钟的日志
            if (logTime >= tenMinutesAgo) {
              logs.push({
                time: displayTime,
                file: file.name,
                level: 'error',
                message: line.trim(),
                timestamp: logTime
              })
            }
          }
        }
      } catch (e) {
        console.error(`Failed to read log file ${file.name}:`, e)
      }
    }

    // 按时间倒序排列，最多返回 100 条
    logs.sort((a, b) => b.timestamp - a.timestamp)
    const recentLogs = logs.slice(0, 100)

    res.json({ 
      logs: recentLogs,
      total: recentLogs.length,
      logDir: OPENCLAW_LOG_DIR
    })
  } catch (error) {
    console.error('Failed to read OpenClaw logs:', error)
    res.status(500).json({ error: 'Failed to read logs', logs: [] })
  }
})

app.listen(PORT, () => {
  console.log(`Agent image server running on http://localhost:${PORT}`)
})
