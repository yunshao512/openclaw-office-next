import { getApiBaseUrl } from './config'

export interface AgentImageConfig {
  faceImageIndex?: number
  fullbodyImageIndex?: number
}

export type CropData = {
  scale: number
  x: number
  y: number
  width: number
  height: number
}

function getApiBase(): string {
  return getApiBaseUrl()
}

export async function saveAgentImage(
  agentId: string,
  type: 'face' | 'fullbody',
  imageUrl: string,
  cropData: CropData
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        const targetSize = type === 'face' ? 200 : 300
        const targetHeight = type === 'face' ? 200 : 450
        canvas.width = targetSize
        canvas.height = targetHeight

        const { scale, x, y, width, height } = cropData

        console.log(`[saveAgentImage] Source: ${img.width}x${img.height}`)
        console.log(`[saveAgentImage] Crop: scale=${scale}, x=${x}, y=${y}, w=${width}, h=${height}`)

        const maxHeight = 500
        const aspectRatio = img.width / img.height
        
        let displayWidth: number, displayHeight: number
        if (aspectRatio > 1) {
          displayHeight = maxHeight
          displayWidth = maxHeight * aspectRatio
        } else {
          displayHeight = maxHeight
          displayWidth = maxHeight * aspectRatio
        }

        console.log(`[saveAgentImage] Display size: ${displayWidth.toFixed(0)}x${displayHeight.toFixed(0)}`)

        const scaleX = img.width / displayWidth
        const scaleY = img.height / displayHeight
        
        const cropCenterX = displayWidth / 2 + x
        const cropCenterY = displayHeight / 2 + y
        
        const cropLeft = cropCenterX - width / 2
        const cropTop = cropCenterY - height / 2

        let sourceX = cropLeft * scaleX
        let sourceY = cropTop * scaleY
        let sourceWidth = width * scaleX * scale
        let sourceHeight = height * scaleY * scale

        sourceX = Math.max(0, sourceX)
        sourceY = Math.max(0, sourceY)
        sourceWidth = Math.min(sourceWidth, img.width - sourceX)
        sourceHeight = Math.min(sourceHeight, img.height - sourceY)

        console.log(`[saveAgentImage] Source rect: ${sourceX.toFixed(0)}, ${sourceY.toFixed(0)}, ${sourceWidth.toFixed(0)}, ${sourceHeight.toFixed(0)}`)

        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, targetSize, targetHeight
        )

        const imageData = canvas.toDataURL('image/jpeg', 0.9)
        const filename = type === 'face' ? 'face.jpg' : 'fullbody.jpg'

        fetch(`${getApiBase()}/api/agent/${agentId}/image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, imageData, filename }),
        })
          .then(response => response.json())
          .then(result => {
            console.log(`[saveAgentImage] Saved:`, result.path)
            resolve(result.path)
          })
          .catch(reject)
      } catch (error) {
        console.error(`[saveAgentImage] Error:`, error)
        reject(error)
      }
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = imageUrl
  })
}

export async function getAgentConfig(agentId: string): Promise<AgentImageConfig> {
  try {
    const response = await fetch(`${getApiBase()}/api/agent/${agentId}/config`)
    if (!response.ok) return {}
    return await response.json()
  } catch {
    return {}
  }
}

export async function saveAgentConfig(
  agentId: string,
  config: AgentImageConfig
): Promise<void> {
  await fetch(`${getApiBase()}/api/agent/${agentId}/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  })
}

export function getAgentImageUrl(agentId: string, type: 'face' | 'fullbody'): string {
  return `/agents/${agentId}/${type}.jpg`
}

export function agentImageExists(agentId: string, type: 'face' | 'fullbody'): Promise<boolean> {
  return new Promise((resolve) => {
    const url = getAgentImageUrl(agentId, type) + '?t=' + Date.now()
    fetch(url, { method: 'HEAD' })
      .then((response) => resolve(response.ok))
      .catch(() => resolve(false))
  })
}

export async function deleteAgentImage(agentId: string, type: 'face' | 'fullbody'): Promise<void> {
  await fetch(`${getApiBase()}/api/agent/${agentId}/image?type=${type}`, {
    method: 'DELETE',
  })
}
