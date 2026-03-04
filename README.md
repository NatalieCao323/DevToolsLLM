# DevToolsLLM 🔍

> **全栈 LLM 应用调试与监控平台**  
> 让 AI 工具调用透明化、可追踪、可优化

[![npm version](https://badge.fury.io/js/devtools-llm.svg)](https://www.npmjs.com/package/devtools-llm)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)

---

## 📖 目录

- [项目简介](#项目简介)
- [核心目标](#核心目标)
- [主要功能](#主要功能)
- [快速开始](#快速开始)
- [详细使用指南](#详细使用指南)
  - [CLI 工具](#cli-工具)
  - [Web UI 实时监控](#web-ui-实时监控)
  - [编程 API](#编程-api)
- [框架集成](#框架集成)
- [实时监控功能](#实时监控功能)
- [高级特性](#高级特性)
- [开发路线图](#开发路线图)
- [贡献指南](#贡献指南)

---

## 🎯 项目简介

**DevToolsLLM** 是一个专为 LLM（大语言模型）应用开发者设计的全栈调试与监控平台。它解决了 AI 应用开发中最痛的问题：**工具调用的黑盒性**。

### 为什么需要 DevToolsLLM？

在开发 LLM 应用时，你是否遇到过这些问题：

- ❌ **工具调用失败，但不知道为什么？**
- ❌ **参数传递错误，但错误信息不清晰？**
- ❌ **性能瓶颈在哪里？哪个工具最慢？**
- ❌ **调用链复杂，无法追踪完整流程？**
- ❌ **生产环境出错，缺乏实时监控？**

**DevToolsLLM 一站式解决这些问题！**

---

## 🎯 核心目标

### 1. **透明化** - 让每一次工具调用都清晰可见
- 完整记录工具调用的输入、输出、耗时
- 可视化调用链，理解复杂的执行流程
- 实时监控，掌握应用运行状态

### 2. **可追踪** - 快速定位问题根源
- 智能错误分析，自动分类错误类型
- 提供可操作的调试建议
- 支持历史回溯，重现问题场景

### 3. **可优化** - 数据驱动的性能提升
- 性能统计，识别瓶颈
- 成功率追踪，发现不稳定的工具
- 参数验证，避免低级错误

---

## ✨ 主要功能

### 🔧 核心模块

| 模块 | 功能 | 特点 |
|------|------|------|
| **ErrorInspector** | 智能错误分析 | 7+ 种错误类型检测、严重程度分级、调试建议生成 |
| **ToolCallTracer** | 调用链追踪 | 层级关系构建、性能统计、成功率追踪 |
| **TraceVisualizer** | 可视化展示 | ASCII 树形图、时间线视图、性能热图 |
| **RealtimeMonitor** | 实时监控 | WebSocket 推送、Web 仪表盘、实时统计 |
| **ParameterValidator** | 参数验证 | JSON Schema 验证、类型检查、必填字段检查 |

### 🌐 Web UI 功能

- **📊 实时仪表盘** - 一目了然的统计数据
- **🔗 调用链可视化** - 清晰展示工具调用关系
- **🐛 错误高亮** - 快速识别失败的调用
- **⏱️ 性能监控** - 实时追踪平均耗时
- **📈 趋势分析** - 成功率、调用量趋势

### 🔌 框架支持

- ✅ **LangChain** - 完整集成
- ✅ **Vercel AI SDK** - 中间件支持
- ✅ **OpenAI SDK** - 拦截器支持（计划中）
- ✅ **通用 Node.js** - 灵活的 API

---

## 🚀 快速开始

### 安装

```bash
# 全局安装 CLI 工具
npm install -g devtools-llm

# 或作为项目依赖
npm install devtools-llm
```

### 30 秒体验

```bash
# 1. 启动实时监控服务器
devtools monitor 3000

# 2. 在另一个终端启动 Web UI
cd /path/to/devtools-llm
npm run dev:frontend

# 3. 打开浏览器访问 http://localhost:3001
# 4. 开始使用你的 LLM 应用，实时查看工具调用！
```

---

## 📚 详细使用指南

### 1️⃣ CLI 工具

#### 错误分析

分析错误日志，获取智能调试建议：

```bash
devtools inspect error.log
```

**输出示例：**
```
🔍 Error Analysis Report

📊 Summary:
  Total Errors: 15
  Critical: 2
  High: 5

📋 Error Types:
  TIMEOUT: 3
  API_ERROR: 5
  INVALID_PARAMS: 7

💡 Debugging Suggestions:

1. 3 timeout error(s) detected
   Solutions:
   - Increase timeout threshold in your LLM configuration
   - Check if the API endpoint is responding slowly
   - Consider implementing retry logic with exponential backoff
   - Monitor network latency

2. 5 API error(s) detected
   Solutions:
   - Check API key validity and permissions
   - Verify rate limits and quota
   - Implement exponential backoff for retries
```

**支持的错误类型：**
- `TIMEOUT` - 超时错误
- `INVALID_PARAMS` - 参数错误
- `API_ERROR` - API 调用错误
- `NETWORK` - 网络错误
- `PARSE_ERROR` - 解析错误
- `TOOL_NOT_FOUND` - 工具未找到（严重）
- `SCHEMA_MISMATCH` - 参数类型不匹配

#### 调用链追踪

追踪工具调用，生成详细报告：

```bash
devtools trace tool_log.json
```

**输出示例：**
```
🔗 Tool Call Trace Generated

📊 Summary:
  Total Calls: 25
  Successful: 22
  Failed: 3
  Average Duration: 245ms

🔧 Tool Usage:
  search: 10
  calculator: 8
  weather: 7

📝 Recent Calls (last 5):
  ✅ search (120ms)
  ✅ calculator (45ms)
  ❌ weather
     Error: API timeout
```

**日志格式支持：**

1. **JSON 数组：**
```json
[
  {
    "tool": "search",
    "input": {"query": "weather"},
    "output": {"result": "sunny"},
    "duration": 120,
    "status": "success",
    "timestamp": "2026-03-04T14:30:00Z"
  }
]
```

2. **行分隔 JSON (NDJSON)：**
```json
{"tool":"search","input":{"query":"weather"},"status":"success"}
{"tool":"calculator","input":{"expr":"2+2"},"status":"success"}
```

3. **层级调用（支持父子关系）：**
```json
{"id":"call_1","tool":"search","parentId":null}
{"id":"call_2","tool":"calculator","parentId":"call_1"}
```

#### 可视化调用链

生成 ASCII 树形图：

```bash
devtools visualize trace.json
```

**输出示例：**
```
🌳 Tool Call Chain Visualization

└─ ✅ search (120ms)
   ├─ ✅ calculator (45ms)
   └─ ✅ weather (80ms)
      └─ ❌ Error: API timeout
```

#### 参数验证

验证工具参数是否符合 Schema：

```bash
devtools validate schema.json
```

**Schema 示例：**
```json
{
  "searchTool": {
    "required": ["query"],
    "properties": {
      "query": {
        "type": "string",
        "minLength": 1,
        "maxLength": 200
      },
      "limit": {
        "type": "number",
        "minimum": 1,
        "maximum": 100
      }
    }
  }
}
```

---

### 2️⃣ Web UI 实时监控

#### 启动监控系统

**步骤 1：启动后端服务器**
```bash
devtools monitor 3000
```

这将启动：
- HTTP 服务器（端口 3000）
- WebSocket 服务器（实时推送）
- API 端点（/api/history, /api/stats）

**步骤 2：启动前端界面**
```bash
cd /path/to/devtools-llm
npm run dev:frontend
```

前端将运行在 `http://localhost:3001`

**步骤 3：访问仪表盘**

打开浏览器访问 `http://localhost:3001`，你将看到：

#### 📊 Dashboard（仪表盘）

**实时统计卡片：**
- **总调用次数** - 累计工具调用数量
- **成功率** - 成功调用的百分比
- **平均耗时** - 所有调用的平均执行时间
- **活跃客户端** - 当前连接的客户端数量

**最近调用列表：**
- 实时显示最新的 10 次工具调用
- 状态图标（✅ 成功 / ❌ 失败）
- 工具名称、耗时、时间戳
- 错误信息高亮显示

**调用链可视化：**
- ASCII 树形图展示调用关系
- 支持嵌套调用展示
- 错误节点特殊标记

#### 🐛 Error Analysis（错误分析页面）

*即将推出：*
- 错误趋势图表
- 错误类型分布
- 智能调试建议
- 错误详情查看

#### 🔗 Trace Viewer（追踪查看器）

*即将推出：*
- 交互式调用链图
- 时间线视图
- 性能瓶颈分析
- 调用详情面板

#### ⚙️ Settings（设置）

*即将推出：*
- 监控配置
- 告警规则设置
- 数据保留策略
- 导出设置

---

### 3️⃣ 编程 API

#### 基础用法

```javascript
const { ErrorInspector, ToolCallTracer, RealtimeMonitor } = require('devtools-llm');

// 分析错误
const analysis = await ErrorInspector.inspect('error.log');
console.log(analysis.suggestions);

// 追踪调用
const trace = await ToolCallTracer.trace('tool_log.json');
console.log(trace.metadata.stats);

// 启动监控服务器
const monitor = await RealtimeMonitor.start(3000);

// 记录工具调用
monitor.recordCall({
  tool: 'search',
  input: { query: 'weather' },
  output: { result: 'sunny' },
  duration: 120,
  status: 'success'
});
```

#### 参数验证

```javascript
const { ParameterValidator } = require('devtools-llm');

// 加载 Schema
const validator = ParameterValidator.loadSchema('schema.json');

// 验证参数
const result = validator.validate(
  { query: 'weather', limit: 10 },
  'searchTool'
);

if (!result.valid) {
  console.error('Validation errors:', result.errors);
  // ["Missing required parameter: query"]
}
```

---

## 🔌 框架集成

### LangChain 集成

```javascript
const { LangChainTracer } = require('devtools-llm');
const { RealtimeMonitor } = require('devtools-llm');

// 启动监控服务器
const monitor = await RealtimeMonitor.start(3000);

// 创建追踪器
const tracer = new LangChainTracer({
  logFile: 'langchain_calls.json',
  monitor: monitor  // 连接到实时监控
});

// 包装你的工具
const tracedTool = tracer.wrapTool(myLangChainTool);

// 正常使用
const result = await tracedTool.call(input);

// 导出追踪数据
tracer.export('trace.json');
```

### Vercel AI SDK 集成

```javascript
const { VercelAITracer } = require('devtools-llm');
const { streamText } = require('ai');

const tracer = new VercelAITracer({
  logFile: 'vercel_ai_calls.json'
});

// 方式 1：使用中间件
const result = await streamText({
  model: openai('gpt-4'),
  prompt: 'Hello',
  experimental_telemetry: tracer.createMiddleware()
});

// 方式 2：包装工具函数
const tracedFunction = tracer.wrapTool(myToolFunction, 'myTool');
```

---

## 🎯 实时监控功能

### WebSocket 实时推送

**客户端连接：**
```javascript
const ws = new WebSocket('ws://localhost:3000');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'call') {
    // 新的工具调用
    console.log('New call:', message.data);
  } else if (message.type === 'history') {
    // 历史数据
    console.log('History:', message.data);
  }
};
```

**消息格式：**
```json
{
  "type": "call",
  "data": {
    "id": "call_123",
    "tool": "search",
    "input": {"query": "weather"},
    "output": {"result": "sunny"},
    "duration": 120,
    "status": "success",
    "timestamp": "2026-03-04T14:30:00Z"
  }
}
```

### HTTP API 端点

**获取历史记录：**
```bash
curl http://localhost:3000/api/history
```

**获取统计数据：**
```bash
curl http://localhost:3000/api/stats
```

**响应示例：**
```json
{
  "totalCalls": 150,
  "successRate": 92,
  "averageDuration": 245,
  "toolUsage": {
    "search": 50,
    "calculator": 40,
    "weather": 60
  },
  "recentErrors": [
    {
      "tool": "weather",
      "error": {"message": "API timeout"},
      "timestamp": "2026-03-04T14:30:00Z"
    }
  ]
}
```

---

## 🚀 高级特性

### 1. 性能分析

```javascript
const { TraceVisualizer } = require('devtools-llm');

// 生成性能热图
const trace = await ToolCallTracer.trace('tool_log.json');
TraceVisualizer.visualizePerformance(trace);
```

**输出：**
```
🔥 Performance Heatmap:

search              ████████████████░░░░░░░░░░░░░░ 245ms (min: 100ms, max: 500ms)
calculator          ████░░░░░░░░░░░░░░░░░░░░░░░░░░ 45ms  (min: 20ms, max: 80ms)
weather             ██████████████████████░░░░░░░░ 380ms (min: 200ms, max: 600ms)
```

### 2. 时间线视图

```javascript
TraceVisualizer.visualizeTimeline(trace);
```

**输出：**
```
⏱️  Timeline:

+0ms    ✅ search [120ms]
+120ms  ✅ calculator [45ms]
+165ms  ✅ weather [80ms]
+245ms  ❌ api_call [timeout]
```

### 3. 自定义错误模式

```javascript
const { ErrorInspector } = require('devtools-llm');

// 添加自定义错误模式
ErrorInspector.addPattern('CUSTOM_ERROR', /my custom error/i);
```

---

## 🗺️ 开发路线图

### ✅ 已完成（v0.1.0）
- [x] CLI 工具（trace, inspect, visualize, monitor）
- [x] 错误分析与智能建议
- [x] 调用链追踪与可视化
- [x] 实时监控服务器
- [x] Web UI 仪表盘
- [x] WebSocket 实时推送
- [x] LangChain 集成
- [x] Vercel AI SDK 集成
- [x] 参数验证

### 🚧 进行中（v0.2.0）
- [ ] **机器学习增强错误分析**
  - 使用 ML 模型提升错误分类准确度
  - 基于历史数据的智能建议
  - 异常检测与预警
- [ ] **Web UI 功能完善**
  - 错误分析页面
  - 追踪查看器
  - 设置页面
  - 数据导出功能
- [ ] **性能优化**
  - 大规模数据处理优化
  - 内存使用优化
  - 数据压缩与归档

### 📅 计划中（v0.3.0+）
- [ ] OpenAI SDK 集成
- [ ] Anthropic SDK 集成
- [ ] 告警系统（邮件、Slack、钉钉）
- [ ] 数据持久化（数据库支持）
- [ ] 多租户支持
- [ ] 云服务版本
- [ ] VS Code 插件
- [ ] Chrome DevTools 扩展

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 如何贡献

1. **Fork 项目**
2. **创建特性分支** (`git checkout -b feature/AmazingFeature`)
3. **提交更改** (`git commit -m 'Add some AmazingFeature'`)
4. **推送到分支** (`git push origin feature/AmazingFeature`)
5. **开启 Pull Request**

### 开发设置

```bash
# 克隆仓库
git clone https://github.com/yourusername/devtools-llm.git
cd devtools-llm

# 安装依赖
npm install

# 运行测试
npm test

# 启动开发服务器
npm run dev:frontend
```

### 代码规范

- 使用 ESLint 进行代码检查
- 遵循 Airbnb JavaScript 风格指南
- 为新功能添加测试
- 更新相关文档

---

## 📄 许可证

MIT © 2026

---

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

特别感谢：
- LangChain 社区
- Vercel AI SDK 团队
- 所有提供反馈和建议的用户

---

## 📞 联系我们

- **GitHub Issues**: [提交问题](https://github.com/yourusername/devtools-llm/issues)
- **Discussions**: [参与讨论](https://github.com/yourusername/devtools-llm/discussions)
- **Email**: devtools-llm@example.com

---

## ⭐ Star History

如果这个项目对你有帮助，请给我们一个 Star！⭐

---

**让 LLM 应用开发更透明、更高效！** 🚀