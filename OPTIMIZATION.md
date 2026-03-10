# Agent 状态优化总结

## 优化日期
2026-03-09

## 问题描述
参考 `/home/bdcp/Star-Office-UI-master` 项目，发现 `openclaw-office-next` 的 agent 状态显示不够准确。

## 主要问题

### 1. 状态判断逻辑过于简单
- **原实现**: 只检查会话的最后更新时间（5分钟内活跃就认为是 working）
- **问题**: 缺少细粒度的状态判断，无法区分 researching、executing、syncing 等状态

### 2. 缺少定时轮询机制
- **原实现**: 前端只在初始化时调用一次 `connectToGateway`
- **问题**: 状态不会自动更新，用户需要手动刷新

### 3. 状态类型映射不完整
- **原实现**: 只支持基本状态映射
- **问题**: 无法兼容 Star-Office-UI 使用的多种状态表示

## 优化方案

### 1. 后端状态判断优化 (`scripts/agent-image-server.ts`)

**参考 Star-Office-UI 的实现**，添加多维度状态判断：

#### 基于 memory 文件活动判断
```typescript
// 检查 memory 目录的最近活动
const memoryDir = path.join(workspacePath, 'memory')
if (fs.existsSync(memoryDir)) {
  const mdFiles = fs.readdirSync(memoryDir)
    .filter(f => f.endsWith('.md'))
    .sort((a, b) => b.mtime - a.mtime)
  
  if (mdFiles.length > 0) {
    const latestFile = mdFiles[0]
    const timeDiff = now.getTime() - latestFile.mtime
    
    // 根据文件名和修改时间判断状态
    if (timeDiff < 5 * 60 * 1000) { // 5分钟内
      if (latestFile.name.includes('research')) {
        status = 'researching'
      } else if (latestFile.name.includes('execute')) {
        status = 'executing'
      } else {
        status = 'working'
      }
    } else if (timeDiff < 60 * 60 * 1000) { // 1小时内
      status = 'idle'
      currentTask = '短暂休息中'
    }
  }
}
```

#### 基于会话活动补充判断
- 如果 memory 没有活动，检查会话状态
- 会话在 5 分钟内活跃则认为在对话中 (`speaking`)

### 2. 前端定时轮询机制 (`src/store/office-store.ts`)

添加定时轮询支持：

```typescript
interface OfficeStore {
  pollInterval: number  // 轮询间隔（默认 3 秒）
  startPolling: () => void
  stopPolling: () => void
}

// 在 App.tsx 中启用
useEffect(() => {
  connectToGateway()
  startPolling()  // 启动 3 秒轮询
  return () => stopPolling()
}, [])
```

**优势**：
- 状态每 3 秒自动更新
- 用户无需手动刷新
- 可配置轮询间隔

### 3. 完善状态类型映射

扩展状态映射，兼容多种表示：

```typescript
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
```

## 对比 Star-Office-UI

### Star-Office-UI 的优势
1. **Python 监控脚本** (`agent_monitor.py`)
   - 每 30 秒推送一次状态
   - 基于 memory 文件修改时间判断
   - 有自动超时机制（25秒无更新自动回到 idle）

2. **完善的授权机制**
   - 支持多 agent 管理
   - 有离线检测（5分钟无推送自动离线）

3. **主动推送机制**
   - agent 通过 HTTP API 主动推送状态到 `/agent-push` 端点

### 本次优化借鉴点
1. ✅ 基于 memory 文件活动的状态判断
2. ✅ 细粒度的状态区分（researching、executing、syncing）
3. ✅ 定时轮询机制（前端主动获取）
4. ✅ 完善的状态映射兼容性

## 效果对比

### 优化前
- 状态更新不及时（需要手动刷新）
- 状态判断不准确（只能判断 working/idle）
- 缺少细粒度状态显示

### 优化后
- 每 3 秒自动更新状态
- 基于 memory 文件活动的智能判断
- 支持 8 种状态：idle, working, researching, executing, syncing, error, speaking, tool_calling
- 更准确的 agent 活动描述

## 配置说明

在 `conf/config.json` 中：

```json
{
  "openclaw": {
    "pollInterval": 3000,  // 前端轮询间隔（毫秒）
    "reconnectInterval": 5000
  }
}
```

## 使用方法

1. 启动服务：
   ```bash
   ./bin/start.sh
   ```

2. 访问应用：
   ```
   http://localhost:8088
   ```

3. 状态会每 3 秒自动更新，无需手动刷新

## 后续改进建议

1. **WebSocket 支持**：实现实时推送，减少轮询开销
2. **状态历史记录**：记录 agent 状态变化历史
3. **更智能的状态判断**：结合更多指标（CPU、内存、网络等）
4. **离线检测**：参考 Star-Office-UI 的 5 分钟离线检测机制
