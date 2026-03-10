# 监控区功能实现文档

## 实现日期
2026-03-09

## 功能概述
将原来的"会议室"区域改为"监控区"，用于实时展示 OpenClaw 的错误日志，帮助监控系统运行状态。

## 主要改动

### 1. 配置文件更新 (`conf/config.json`)

添加了日志相关配置：

```json
{
  "openclaw": {
    "gatewayUrl": "http://127.0.0.1:8089",
    "pollInterval": 3000,
    "reconnectInterval": 5000,
    "logDir": "/tmp/openclaw",           // 日志文件目录
    "logPollInterval": 600000            // 日志轮询间隔（10分钟）
  }
}
```

### 2. 后端 API 实现 (`scripts/agent-image-server.ts`)

#### 新增 API 端点
- **路径**: `GET /api/openclaw/logs`
- **功能**: 读取 OpenClaw 日志文件，过滤最近 10 分钟的错误日志
- **返回格式**:
  ```json
  {
    "logs": [
      {
        "time": "2026-03-09 17:30:20",
        "file": "test.log",
        "level": "error",
        "message": "[2026-03-09 17:30:20] ERROR: Failed to connect to database",
        "timestamp": 1773048620000
      }
    ],
    "total": 6,
    "logDir": "/tmp/openclaw"
  }
  ```

#### 实现细节
1. **日志文件扫描**: 扫描 `/tmp/openclaw/` 目录下所有 `.log` 和 `.txt` 文件
2. **错误过滤**: 过滤包含以下关键词的日志行（不区分大小写）:
   - `error`
   - `exception`
   - `fail`
3. **时间过滤**: 只返回最近 10 分钟的日志
4. **排序**: 按时间倒序排列，最多返回 100 条

### 3. 前端组件实现

#### 日志监控组件 (`src/components/monitor/LogMonitor.tsx`)

**功能特性**:
- 每 10 分钟自动轮询获取最新日志
- 滚动展示日志，新日志在顶部
- 根据错误级别显示不同颜色:
  - `critical`/`fatal`: 红色背景，深红边框
  - `error`: 红色背景，红色边框
  - `exception`: 橙色背景，橙色边框
  - `fail`: 黄色背景，黄色边框

**展示样式**:
```
┌─────────────────────────────────────────┐
│ ⚠️ 最近 10 分钟错误日志  🕐 17:30:20   │
├─────────────────────────────────────────┤
│ 🕐 17:30:20          📄 test.log        │
│ [2026-03-09 17:30:20] ERROR: Failed... │
├─────────────────────────────────────────┤
│ 🕐 17:30:15          📄 test.log        │
│ [2026-03-09 17:30:15] ERROR: Connect...│
└─────────────────────────────────────────┘
         共 6 条错误日志
```

#### OfficeScene 修改 (`src/components/office/OfficeScene.tsx`)

- 将"会议室"改为"监控区"
- 图标颜色从紫色改为红色
- 集成 LogMonitor 组件

### 4. 自动轮询机制

**实现方式**:
- 使用 React `useEffect` 和 `setInterval`
- 默认每 10 分钟（600000ms）轮询一次
- 可通过 `pollInterval` 属性配置

**优势**:
- 无需手动刷新
- 自动更新监控数据
- 减少服务器压力（相比高频轮询）

## 日志文件要求

### 文件位置
- 默认: `/tmp/openclaw/`
- 可在配置文件中修改 `openclaw.logDir`

### 文件格式
- 支持扩展名: `.log`, `.txt`
- 建议格式: `[YYYY-MM-DD HH:MM:SS] LEVEL: Message`

### 示例日志
```
[2026-03-09 17:30:20] ERROR: Failed to connect to database
[2026-03-09 17:30:25] WARNING: Retrying connection...
[2026-03-09 17:30:45] EXCEPTION: NullPointerException in AgentManager
```

## 测试方法

### 1. 创建测试日志
```bash
mkdir -p /tmp/openclaw
cat > /tmp/openclaw/test.log << 'EOF'
[2026-03-09 17:30:20] ERROR: Failed to connect to database
[2026-03-09 17:30:45] EXCEPTION: NullPointerException in AgentManager
EOF
```

### 2. 测试 API
```bash
curl http://localhost:3001/api/openclaw/logs
```

### 3. 查看前端
访问 http://localhost:8088，在右侧监控区查看日志展示

## 配置选项

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `openclaw.logDir` | 日志文件目录 | `/tmp/openclaw` |
| `openclaw.logPollInterval` | 轮询间隔（毫秒） | 600000 (10分钟) |
| `LogMonitor` 组件的 `pollInterval` | 组件轮询间隔 | 600000 |

## 性能考虑

1. **日志文件大小**: 建议单个日志文件不超过 10MB
2. **日志数量**: 最多返回最近 100 条错误日志
3. **轮询频率**: 10 分钟轮询一次，平衡实时性和性能
4. **内存使用**: 只保留最近 10 分钟的日志，避免内存溢出

## 后续改进建议

1. **实时推送**: 使用 WebSocket 实现日志实时推送
2. **日志级别过滤**: 允许用户选择显示哪些级别的日志
3. **日志搜索**: 添加关键词搜索功能
4. **日志详情**: 点击日志查看完整堆栈信息
5. **日志导出**: 支持导出日志到文件
6. **多文件支持**: 同时监控多个日志目录

## 相关文件

- 配置: `/home/bdcp/openclaw-office-next/conf/config.json`
- 后端: `/home/bdcp/openclaw-office-next/scripts/agent-image-server.ts`
- 前端组件: `/home/bdcp/openclaw-office-next/src/components/monitor/LogMonitor.tsx`
- 集成: `/home/bdcp/openclaw-office-next/src/components/office/OfficeScene.tsx`
