# Web UI 使用指南

## 🎯 概述

DevToolsLLM 的 Web UI 是一个**完全功能性的实时监控界面**，不是静态展示。它提供：

- ✅ **实时 WebSocket 连接** - 真实的双向通信
- ✅ **用户设置持久化** - 配置保存到本地文件
- ✅ **真实数据展示** - 来自实际工具调用
- ✅ **完全交互式** - 所有按钮和设置都有效

---

## 🚀 快速开始

### 1. 启动实时演示

```bash
# 方式 1：使用演示脚本（推荐）
node examples/realtime-demo.js

# 方式 2：手动启动
npm run dev
```

### 2. 访问 Web UI

```bash
# 如果使用 Vite 开发服务器
npm run dev:frontend

# 然后访问
http://localhost:5173
```

### 3. 查看实时数据

打开浏览器后，你会看到：
- 📊 实时统计数据（总调用数、成功率、平均耗时）
- 📋 最近的工具调用列表
- 🔗 工具调用链可视化
- ⚠️ 错误分析和建议

---

## 📊 功能详解

### 1. Dashboard（仪表盘）

**功能：**
- 实时显示工具调用统计
- WebSocket 连接状态指示
- 最近 50 次调用历史
- 工具调用链可视化

**数据来源：**
```javascript
// WebSocket 实时推送
ws://localhost:3000

// 消息格式
{
  type: 'call',
  data: {
    id: 'call-123',
    tool: 'search',
    status: 'success',
    duration: 1500,
    timestamp: '2026-03-04T15:30:00Z'
  }
}
```

**测试方法：**
```bash
# 启动演示，观察数据实时更新
node examples/realtime-demo.js
```

---

### 2. Error Analysis（错误分析）

**功能：**
- 错误类型分布图表
- 最近错误列表
- 智能调试建议
- 时间范围过滤

**交互功能：**
- ✅ 选择时间范围（1h, 24h, 7d, 30d）
- ✅ 点击错误查看详情
- ✅ 查看 AI 生成的修复建议
- ✅ 实时错误计数更新

**数据来源：**
```javascript
// 从 WebSocket 接收错误事件
{
  type: 'call',
  data: {
    status: 'error',
    error: {
      message: 'Request timeout',
      code: 'TIMEOUT'
    }
  }
}

// 自动分类和生成建议
const classifier = new ErrorClassifier();
const suggestions = new SuggestionGenerator();
```

---

### 3. Trace Viewer（追踪查看）

**功能：**
- 工具调用历史列表
- 交互式调用链树
- 性能时间线
- 状态过滤

**交互功能：**
- ✅ 按状态过滤（All, Success, Error）
- ✅ 展开/折叠调用树
- ✅ 查看调用详情
- ✅ 性能分析

**数据来源：**
```javascript
// 从 /api/history 获取历史数据
fetch('/api/history')
  .then(res => res.json())
  .then(history => {
    // 构建调用树
    buildCallTree(history);
  });
```

---

### 4. Parameter Validation（参数验证）

**功能：**
- JSON Schema 验证
- 实时错误提示
- 示例 Schema
- 交互式编辑器

**交互功能：**
- ✅ 编辑 Schema
- ✅ 编辑参数
- ✅ 实时验证
- ✅ 错误高亮

**使用示例：**
```json
// Schema
{
  "type": "object",
  "properties": {
    "query": { "type": "string" },
    "limit": { "type": "number" }
  },
  "required": ["query"]
}

// Parameters
{
  "query": "test",
  "limit": 10
}
```

---

### 5. Settings（设置）

**功能：**
- 监控配置
- 告警配置
- 显示设置
- 性能设置

**持久化存储：**
```javascript
// 保存位置
~/.devtools-llm/config.json

// 保存方法
localStorage.setItem('devtools-llm-config', JSON.stringify(config));

// 加载方法
const config = JSON.parse(localStorage.getItem('devtools-llm-config'));
```

**可配置项：**

#### 监控配置
- `wsPort`: WebSocket 端口（默认 3000）
- `refreshRate`: 刷新频率（默认 1000ms）
- `historySize`: 历史记录大小（默认 1000）
- `enableML`: 启用 ML 功能（默认 true）

#### 告警配置
- `errorThreshold`: 错误阈值（默认 10）
- `timeoutThreshold`: 超时阈值（默认 5000ms）
- `enableNotifications`: 启用通知（默认 false）
- `notificationEmail`: 通知邮箱

#### 显示设置
- `theme`: 主题（dark/light）
- `dateFormat`: 日期格式（locale/iso）
- `timezone`: 时区（local/UTC）

#### 性能设置
- `enableCompression`: 启用压缩（默认 true）
- `cacheSize`: 缓存大小（默认 500）
- `logLevel`: 日志级别（info/debug/error）

---

## 🧪 测试指南

### 测试 1：实时数据更新

```bash
# 终端 1：启动演示
node examples/realtime-demo.js

# 终端 2：启动前端
npm run dev:frontend

# 浏览器：访问 http://localhost:5173
# 观察：数据每 2-5 秒更新一次
```

**预期结果：**
- ✅ 统计数字实时增长
- ✅ 新调用出现在列表顶部
- ✅ 错误自动分类
- ✅ 成功率动态计算

---

### 测试 2：设置持久化

```bash
# 运行测试脚本
node examples/test-settings-persistence.js
```

**预期结果：**
```
✅ 所有测试通过！
  ✅ 配置可以保存到文件
  ✅ 配置可以从文件加载
  ✅ 配置可以更新
  ✅ 配置可以重置
```

**手动测试：**
1. 打开 Settings 页面
2. 修改任意设置（如 wsPort: 3000 → 4000）
3. 点击 "Save Settings"
4. 刷新页面
5. 验证设置保持不变

---

### 测试 3：WebSocket 连接

```bash
# 使用 wscat 测试
npm install -g wscat
wscat -c ws://localhost:3000

# 发送测试消息
> {"type":"call","data":{"tool":"test","status":"success"}}

# 观察浏览器是否收到消息
```

**预期结果：**
- ✅ WebSocket 连接成功
- ✅ 消息实时显示在 Dashboard
- ✅ 统计数据更新

---

### 测试 4：错误分析

```bash
# 启动演示（会自动生成错误）
node examples/realtime-demo.js

# 打开 Error Analysis 页面
# 观察错误分类和建议
```

**预期结果：**
- ✅ 错误按类型分组
- ✅ 显示错误分布图表
- ✅ 提供修复建议
- ✅ 可以按时间过滤

---

## 🔧 集成到你的应用

### 方式 1：使用 RealtimeMonitor

```javascript
const { RealtimeMonitor } = require('devtools-llm');

// 创建监控器
const monitor = new RealtimeMonitor(3000);

// 启动服务器
await monitor.start();

// 记录工具调用
monitor.recordCall({
  tool: 'search',
  status: 'success',
  duration: 1500,
  input: { query: 'test' },
  output: { results: [...] }
});
```

### 方式 2：直接 WebSocket

```javascript
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3000');

ws.on('open', () => {
  // 发送工具调用
  ws.send(JSON.stringify({
    type: 'call',
    data: {
      tool: 'analyze',
      status: 'success',
      duration: 2000
    }
  }));
});
```

### 方式 3：HTTP API

```javascript
// 获取历史记录
fetch('http://localhost:3000/api/history')
  .then(res => res.json())
  .then(history => console.log(history));

// 获取统计信息
fetch('http://localhost:3000/api/stats')
  .then(res => res.json())
  .then(stats => console.log(stats));
```

---

## 📱 移动端支持

Web UI 是响应式设计，支持移动设备：

- ✅ 手机浏览器访问
- ✅ 平板浏览器访问
- ✅ 触摸操作优化
- ✅ 自适应布局

---

## 🎨 自定义主题

```javascript
// 在 Settings 页面切换主题
config.display.theme = 'light'; // 或 'dark'

// 或直接修改 CSS 变量
document.documentElement.style.setProperty('--primary-color', '#your-color');
```

---

## 🐛 故障排除

### 问题 1：WebSocket 连接失败

**症状：** Dashboard 显示 "Disconnected"

**解决方案：**
```bash
# 1. 检查服务器是否运行
lsof -i :3000

# 2. 检查防火墙
# 3. 确认端口号匹配
```

### 问题 2：数据不更新

**症状：** 统计数字不变

**解决方案：**
```bash
# 1. 检查 WebSocket 连接状态
# 2. 查看浏览器控制台错误
# 3. 确认有数据发送到服务器
```

### 问题 3：设置不保存

**症状：** 刷新后设置丢失

**解决方案：**
```bash
# 1. 检查 localStorage 权限
# 2. 检查浏览器隐私设置
# 3. 手动测试：
node examples/test-settings-persistence.js
```

---

## 📊 性能优化

### 大量数据处理

```javascript
// 限制历史记录大小
config.monitoring.historySize = 500; // 默认 1000

// 降低刷新频率
config.monitoring.refreshRate = 2000; // 默认 1000ms

// 启用压缩
config.performance.enableCompression = true;
```

### 减少内存占用

```javascript
// 减少缓存大小
config.performance.cacheSize = 100; // 默认 500

// 只保留最近的错误
const recentErrors = errors.slice(-50);
```

---

## 🎯 最佳实践

1. **生产环境**
   - 使用 HTTPS 和 WSS
   - 启用身份验证
   - 限制历史记录大小
   - 启用压缩

2. **开发环境**
   - 使用演示脚本快速测试
   - 启用调试日志
   - 保持较大的历史记录

3. **性能监控**
   - 定期检查内存使用
   - 监控 WebSocket 连接数
   - 优化数据传输频率

---

## 🔗 相关文档

- [API 文档](./docs/API.md)
- [ML 功能指南](./docs/ML_ERROR_ANALYSIS.md)
- [部署指南](./docs/DEPLOYMENT.md)

---

## ✅ 验证清单

使用前请确认：

- [ ] WebSocket 服务器运行在正确端口
- [ ] 前端可以访问后端 API
- [ ] 设置可以保存和加载
- [ ] 实时数据正常更新
- [ ] 错误分析功能正常
- [ ] 所有交互按钮有效

---

**最后更新：** 2026-03-04  
**版本：** v0.3.0  
**状态：** ✅ 完全功能性，可用于生产
