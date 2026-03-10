# OpenClaw Office Next - 使用指南OpenClaw Office Next - User Guide

## 目录结构

```
openclaw-office-next/   openclaw 办公套件 Next 版/openclaw-office-next/ OpenClaw Office Suite Next Edition/openclaw-office-next/ OpenClaw Office Suite Next Edition/
├── bin/                 # 服务管理脚本
│   ├── start.sh        # 启动服务│   ├── start.sh        # Start the service
│   ├── stop.sh         # 停止服务│   ├── stop.sh         # Stop the service
│   └── restart.sh       # 重启服务│   └── restart.sh       # Restart the service
├── conf/                # 配置文件
│   └── config.json      # 主配置文件│   └── config.json      # Main configuration file
├── logs/                # 日志目录
│   ├── server.log       # 图片服务器日志│   ├── server.log       # Log file of the image server│   ├── server.log       # Log file of the image server
│   └── frontend.log     # 前端服务日志│   └── frontend.log     # Frontend service log│   └── frontend.log     # Frontend service log
├── public/              # 静态资源├── public/              # Static resources├── public/              # Static resources
│   ├── agents/          # Agent 自定义图片│   ├── agents/          # Custom images for Agents│   ├── agents/          # 代理自定义图片│   ├── agents/          # 代理的自定义图片
│   │   └── {agentId}/│└
│   │       ├── face.jpg      # 自定义头像│   │       ├── face.jpg      # Custom avatar│   │       ├── face.jpg      # Custom avatar││├──face.jpg #自定义头像││├──face.jpg #葬礼而化身││├──face.jpg #葬礼而化身。
│   │       └── fullbody.jpg  # 自定义全身照│   │       └── fullbody.jpg  # Custom full-body photo│   │       └── fullbody.jpg  # Custom full-body photo
│   ├── avatars/         # 默认头像库│   ├── avatars/         # Default avatar library│   ├── avatars/         # Default avatar library
│   └── config.json      # 前端配置（从 conf/ 复制）│   └── config.json      # Front-end configuration (copied from conf/)
└── src/                # 源代码
```

## 效果展示
<img width   宽度="2860" height="1504" alt="dbc6a17c695ff6596ef1b06e4671b3fe" src="https://github.com/user-attachments/assets/14e6fb34-66bb-46ac-bae1-4b0b7ca54c98" />




## 快速开始

### 1. 启动服务

```bash   ”“bash   “bash”;“bashBash ”&ldquo```bash   ”“bash   “bash”;“bash
./bin/start.sh   / bin / start.sh
```

服务将在以下端口启动：
- 前端服务：http://localhost:8088Front-end service: http://localhost:8088—服务：http://localhost:8088—服务：http://localhost:8088
- 图片服务：http://localhost:3001- Image service: http://localhost:3001-图片服务：http://localhost:3001

### 2. 停止服务

```bash   ”“bash   “bash”;“bash```bash   ”“bash   “bash”;“bash
./bin/stop.sh   / bin / stop.sh
```

### 3. 重启服务

```bash   ”“bash   “bash”;“bash
./bin/restart.sh   / bin / restart.sh
```

## 配置说明

### 配置文件 (conf/config.json)Configuration File (conf/config.json)

所有端口和服务配置都集中在 `conf/config.json` 文件中：

```json   ' ' ' json```json
   ' ' '
```
{
  "server": {   "server": {"server": {   "server": {
    "port": 3001,           // 图片服务器端口
    "host": "localhost"     // 图片服务器主机" host" : " localhost"     // Image server host
  },
  "frontend": {   "frontend": {
    "port": 8088,           // 前端端口
    "host": "0.0.0.0"       // 前端主机 (0.0.0.0 表示允许外部访问)
  },
  "openclaw": {   "openclaw": {
    "gatewayUrl": "http://127.0.0.1:8089",  // OpenClaw Gateway 地址"网关地址"： "http://127.0.0.1:8089"，  // OpenClaw 网关地址
    "pollInterval": 3000,   // 数据刷新间隔（毫秒）" pollInterval" 3000, // Data refresh interval (milliseconds)
    "reconnectInterval": 5000,"reconnectInterval": 5000,
    "logDir": "/tmp/openclaw","logDir": "/tmp/openclaw",
    "logPollInterval": 600000"logPollInterval": 600000
  },
  "logging": {   "logging": {
    "level": "info",        // 日志级别" level" : " info" // Log level
    "dir": "./logs"         // 日志目录" dir" : " ./logs"         // Log directory
  },
  "storage": {   "storage": {
    "agentsDir": "./public/agents",    // Agent 图片存储目录" agentsDir" : " ./public/agents" // Directory for storing Agent images
    "avatarsDir": "./public/avatars"   // 默认头像目录
  }
}
```

### 配置项说明

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `server.port` | 图片服务器端口 | 3001 |
| `server.host` | 图片服务器监听地址 | localhost |
| `frontend.port` | 前端开发服务器端口 | 8088 |
| `frontend.host` | 前端监听地址 | 0.0.0.0 |
| `openclaw.gatewayUrl` | OpenClaw Gateway 地址 | http://127.0.0.1:8089 |
| `openclaw.pollInterval` | Agent 数据刷新间隔(ms) | 3000 |
| `openclaw.logDir` | OpenClaw 日志目录 | /tmp/openclaw |
| `logging.level` | 日志级别 | info |
| `logging.dir` | 日志存储目录 | ./logs |

### 修改配置

1. 编辑 `conf/config.json` 文件
2. 运行 `./bin/restart.sh` 使配置生效

**注意**：修改端口后需要确保新端口未被占用：

```bash   ”“bash
# 检查端口占用
lsof -i :8088
lsof -i :3001
```

### 自定义端口示例

将前端改为 9000 端口，图片服务器改为 4000 端口：

```json
{
  "server": {
    "port": 4000,
    "host": "localhost"
  },
  "frontend": {
    "port": 9000,
    "host": "0.0.0.0"
  },
  ...
}
```

然后重启服务：
```bash
./bin/restart.sh
```

访问地址变为：http://localhost:9000

## OpenClaw Gateway 集成

### 连接到 OpenClaw Gateway

1. 确保 OpenClaw Gateway 已启动（默认端口 8089）
2. 应用会自动连接并获取真实的 Agent 数据
3. 连接状态显示在右上角：
   - **已连接 N** - 已连接，显示当前 Agent 数量
   - **未连接** - 无法连接到 Gateway

### 数据同步

- 每 3 秒自动从 Gateway 获取最新 Agent 数据（可通过 `openclaw.pollInterval` 配置）
- **手动刷新**：点击右上角的"刷新"按钮立即获取最新 Agent 列表

### 添加新 Agent

当你在 OpenClaw 中添加新 Agent 后：

1. **方法 1：自动发现**
   - 新 Agent 会被自动扫描并显示在列表中
   
2. **方法 2：手动刷新**
   - 点击右上角的"刷新"按钮
   - 立即获取最新的 Agent 列表

3. **Agent 数据来源**
   - 优先从 `~/.openclaw/openclaw.json` 配置文件读取
   - 自动扫描 `~/.openclaw/agents/` 目录发现新 Agent
   - 从 Agent 的 `agent/profile.json` 读取名称等信息

## Agent 形象设置

### 设置自定义头像/全身照

1. 点击 Agent 头像打开详情
2. 点击"设置形象"按钮
3. 选择"头像"或"全身"标签
4. 使用左右箭头切换图片
5. 调整缩放和位置
6. 点击"确认选择"保存

### 图片存储位置

自定义图片保存在：
```
public/agents/{agentId}/face.jpg      # 头像
public/agents/{agentId}/fullbody.jpg  # 全身照
```

## 日志查看

```bash
# 查看服务器日志
tail -f logs/server.log

# 查看前端日志
tail -f logs/frontend.log
```

## 故障排除

### 无法启动服务

1. 检查端口是否被占用：
   ```bash
   lsof -i :8088
   lsof -i :3001
   ```

2. 检查配置文件格式是否正确：
   ```bash
   cat conf/config.json | jq .
   ```

3. 检查日志文件中的错误信息

### 无法连接到 OpenClaw Gateway

1. 确认 Gateway 已启动
2. 检查 `conf/config.json` 中的 `gatewayUrl` 配置
3. 检查网络连接

### 图片上传失败

1. 检查图片服务器是否运行（默认端口 3001）
2. 检查 `public/agents` 目录权限
3. 查看服务器日志

## 开发命令

```bash
# 开发模式（需要手动启动图片服务器）
npm run server   # 启动图片服务器
npm run dev       # 启动前端开发服务器

# 同时启动两者
npm run dev:all

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 代码检查
npm run lint
```

## 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite 7
- **样式**: Tailwind CSS 4
- **状态管理**: Zustand
- **动画**: Framer Motion
- **图片裁剪**: react-image-crop
- **服务端**: Express (图片服务器)

## 许可证

MIT
