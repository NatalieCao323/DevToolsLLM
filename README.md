# DevToolsLLM

Debugging and monitoring toolkit for LLM applications.
Makes AI tool calls transparent, traceable, and optimizable.

[![npm version](https://badge.fury.io/js/devtools-llm.svg)](https://www.npmjs.com/package/devtools-llm)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)

---

## Table of Contents

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

## Overview

DevToolsLLM is a debugging and monitoring platform designed for LLM application developers. It addresses the black-box nature of tool calls in AI applications.

### Why DevToolsLLM?

Common challenges when developing LLM applications:

- Tool calls fail without clear error messages
- Parameter errors are difficult to diagnose
- Performance bottlenecks are hard to identify
- Complex call chains are difficult to trace
- Production environments lack real-time monitoring

DevToolsLLM helps solve these issues.

---

## Core Goals

### 1. Transparency
- Record complete input, output, and timing for each tool call
- Visualize call chains to understand complex execution flows
- Real-time monitoring of application state

### 2. Traceability
- Intelligent error analysis with automatic classification
- Actionable debugging suggestions
- Historical playback to reproduce issues

### 3. Optimization
- Performance statistics to identify bottlenecks
- Success rate tracking to find unstable tools
- Parameter validation to prevent errors

---

## Main Features

### Core Modules

| Module | Function | Features |
|--------|----------|----------|
| **ErrorInspector** | Error analysis | 7+ error type detection, severity grading, debugging suggestions |
| **ToolCallTracer** | Call chain tracing | Hierarchy building, performance stats, success rate tracking |
| **TraceVisualizer** | Visualization | ASCII tree diagrams, timeline views, performance heatmaps |
| **RealtimeMonitor** | Real-time monitoring | WebSocket push, web dashboard, live statistics |
| **ParameterValidator** | Parameter validation | JSON Schema validation, type checking, required field validation |

### Advanced Features

| Module | Function | Description |
|--------|----------|-------------|
| **AutoFixSuggester** | Automatic fix suggestions | Generates executable code fixes with confidence scores (rule-based, free) |
| **LLMAutoFixSuggester** | LLM-enhanced suggestions | Optional Ollama (free) or OpenAI (paid) integration for smarter suggestions |
| **CostOptimizer** | Cost optimization | Real-time cost tracking, identifies optimization opportunities |
| **TimeTravelDebugger** | Time-travel debugging | Replay any point in time, compare snapshots, analyze patterns |
| **MLErrorInspector** | ML-enhanced analysis | Anomaly detection, intelligent classification, historical case matching |

### Web UI Features

- Real-time dashboard with clear statistics
- Call chain visualization
- Error highlighting for failed calls
- Performance monitoring with average timing
- Trend analysis for success rates and call volumes

### Framework Support

- **LangChain** - Full integration
- **Vercel AI SDK** - Middleware support
-  **OpenAI SDK** - 拦截器支持（计划中）
-  **通用 Node.js** - 灵活的 API

---

##  快速开始

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

##  详细使用指南

###  CLI 工具

#### 错误分析

分析错误日志，获取智能调试建议：

```bash
devtools inspect error.log
```

**输出示例：**
```
 Error Analysis Report

 Summary:
  Total Errors: 15
  Critical: 2
  High: 5

📋 Error Types:
  TIMEOUT: 3
  API_ERROR: 5
  INVALID_PARAMS: 7

 Debugging Suggestions:

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
 Tool Call Trace Generated

 Summary:
  Total Calls: 25
  Successful: 22
  Failed: 3
  Average Duration: 245ms

 Tool Usage:
  search: 10
  calculator: 8
  weather: 7

📝 Recent Calls (last 5):
   search (120ms)
   calculator (45ms)
   weather
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
 Tool Call Chain Visualization

└─  search (120ms)
   ├─  calculator (45ms)
   └─  weather (80ms)
      └─  Error: API timeout
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

###  Web UI 实时监控

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

####  Dashboard（仪表盘）

**实时统计卡片：**
- **总调用次数** - 累计工具调用数量
- **成功率** - 成功调用的百分比
- **平均耗时** - 所有调用的平均执行时间
- **活跃客户端** - 当前连接的客户端数量

**最近调用列表：**
- 实时显示最新的 10 次工具调用
- 状态图标（ 成功 /  失败）
- 工具名称、耗时、时间戳
- 错误信息高亮显示

**调用链可视化：**
- ASCII 树形图展示调用关系
- 支持嵌套调用展示
- 错误节点特殊标记

####  Error Analysis（错误分析页面）

*即将推出：*
- 错误趋势图表
- 错误类型分布
- 智能调试建议
- 错误详情查看

####  Trace Viewer（追踪查看器）

*即将推出：*
- 交互式调用链图
- 时间线视图
- 性能瓶颈分析
- 调用详情面板

####  Settings（设置）

*即将推出：*
- 监控配置
- 告警规则设置
- 数据保留策略
- 导出设置

---

###  编程 API

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

##  框架集成

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

##  实时监控功能

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

##  高级特性

### 1. 性能分析

```javascript
const { TraceVisualizer } = require('devtools-llm');

// 生成性能热图
const trace = await ToolCallTracer.trace('tool_log.json');
TraceVisualizer.visualizePerformance(trace);
```

**输出：**
```
 Performance Heatmap:

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
  Timeline:

+0ms     search [120ms]
+120ms   calculator [45ms]
+165ms   weather [80ms]
+245ms   api_call [timeout]
```

### 3. 自定义错误模式

```javascript
const { ErrorInspector } = require('devtools-llm');

// 添加自定义错误模式
ErrorInspector.addPattern('CUSTOM_ERROR', /my custom error/i);
```

---

##  为什么选择 DevToolsLLM？竞争优势分析

### 与主流工具对比

| 特性 | DevToolsLLM | Langfuse | OpenLLMetry | AgentNeo | PostHog |
|------|-------------|----------|-------------|----------|---------|
| **本地优先** | ✅ 完全本地运行 | ❌ 需要云服务 | ⚠️ 需配置后端 | ✅ 本地支持 | ❌ 主要云服务 |
| **零配置启动** | ✅ npm install 即用 | ❌ 复杂部署 | ❌ 需配置 | ⚠️ 需配置 | ❌ 需注册 |
| **Tool Call 专注** | ✅ 核心功能 | ⚠️ 通用追踪 | ⚠️ 通用追踪 | ✅ Agent 专注 | ❌ 通用分析 |
| **AI 自动修复** | ✅ 独家功能 | ❌ 无 | ❌ 无 | ❌ 无 | ❌ 无 |
| **成本优化** | ✅ 内置分析器 | ⚠️ 基础统计 | ❌ 无 | ❌ 无 | ⚠️ 付费功能 |
| **时间旅行调试** | ✅ 独家功能 | ❌ 无 | ❌ 无 | ⚠️ 基础回放 | ❌ 无 |
| **实时 Web UI** | ✅ 内置完整 UI | ✅ 功能丰富 | ❌ 需第三方 | ✅ 有 UI | ✅ 功能丰富 |
| **免费额度** | ✅ 完全免费 | ⚠️ 50k/月 | ⚠️ 50k/月 | ✅ 开源免费 | ⚠️ 100k/月 |
| **学习曲线** | ✅ 简单易用 | ⚠️ 中等 | ⚠️ 较陡 | ⚠️ 中等 | ⚠️ 较陡 |

### 独特价值主张

#### 1. **本地优先，隐私至上**
- 所有数据存储在本地
- 无需注册账号或 API Key
- 完全离线可用
- 企业级数据安全

#### 2. **AI 驱动的智能调试**

**基础模式（完全免费，推荐）：**
```javascript
const { AutoFixSuggester } = require('devtools-llm');

const fixer = new AutoFixSuggester({ enableAutoApply: true });
const result = await fixer.suggestFix(error, toolCall, history);

// 输出：基于规则引擎的修复建议
// {
//   fixes: [
//     {
//       title: "Implement retry with exponential backoff",
//       code: "async function retry(fn, maxRetries = 3) {...}",
//       confidence: 0.9,
//       effort: "medium"
//     }
//   ],
//   canAutoApply: true
// }
```

**LLM 增强模式（可选，使用 Ollama 免费或 OpenAI 付费）：**
```javascript
const { LLMAutoFixSuggester } = require('devtools-llm');

// 方案 1：Ollama（完全免费，需本地安装）
const fixer = new LLMAutoFixSuggester({
  llmEnabled: true,
  provider: 'ollama',
  model: 'codellama',
  fallbackToRules: true  // 失败时用规则引擎
});

// 方案 2：OpenAI（付费，约 $0.001/次）
const fixer = new LLMAutoFixSuggester({
  llmEnabled: true,
  provider: 'openai',
  model: 'gpt-3.5-turbo',
  apiKey: process.env.OPENAI_API_KEY,
  fallbackToRules: true
});

const result = await fixer.suggestFix(error, toolCall, history);
// 获得更智能、更具体的修复建议
```

详见：[LLM 集成指南](docs/LLM_INTEGRATION_GUIDE.md)

#### 3. **成本优化，节省真金白银**
```javascript
const { CostOptimizer } = require('devtools-llm');

const optimizer = new CostOptimizer();
const analysis = optimizer.analyzeCosts(toolCalls);

// 发现优化机会：
// - 切换简单任务到 gpt-3.5-turbo: 节省 $0.0234 (45%)
// - 缓存重复调用: 节省 $0.0156 (30%)
// - 批量处理请求: 节省 $0.0089 (17%)
// 总潜在节省: $0.0479 (92%)
```

#### 4. **时间旅行调试，重现任意状态**
```javascript
const { TimeTravelDebugger } = require('devtools-llm');

const debugger = new TimeTravelDebugger();

// 记录每次调用
debugger.recordSnapshot(toolCall, context);

// 回到 5 步之前
debugger.goBack(5);

// 对比两个时间点的差异
const diff = debugger.compareSnapshots(id1, id2);

// 分析调用模式
const pattern = debugger.analyzeCallPattern('search');
```

#### 5. **零配置，开箱即用**
```bash
# 安装
npm install devtools-llm

# 启动 Web UI
npx devtools-llm monitor

# 完成！访问 http://localhost:3001
```

### 适用场景

✅ **最适合 DevToolsLLM 的场景：**
- 开发阶段快速调试工具调用问题
- 本地开发环境，注重隐私安全
- 需要深入分析 Tool Call 行为
- 希望优化 LLM 调用成本
- 小团队或个人开发者

⚠️ **可能需要其他工具的场景：**
- 大规模生产环境监控（考虑 Langfuse + DevToolsLLM 组合）
- 需要 Prompt 版本管理（Langfuse 更强）
- 需要 LLM-as-a-judge 评估（Langfuse/Opik 更强）
- 需要与现有 APM 工具集成（OpenLLMetry 更强）

---

##  开发路线图

###  已完成（v0.1.0）
- [x] CLI 工具（trace, inspect, visualize, monitor）
- [x] 错误分析与智能建议
- [x] 调用链追踪与可视化
- [x] 实时监控服务器
- [x] Web UI 仪表盘
- [x] WebSocket 实时推送
- [x] LangChain 集成
- [x] Vercel AI SDK 集成
- [x] 参数验证

###  进行中（v0.2.0）
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

###  计划中（v0.3.0+）
- [ ] OpenAI SDK 集成
- [ ] Anthropic SDK 集成
- [ ] 告警系统（邮件、Slack、钉钉）
- [ ] 数据持久化（数据库支持）
- [ ] 多租户支持
- [ ] 云服务版本
- [ ] VS Code 插件
- [ ] Chrome DevTools 扩展

---

##  贡献指南

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

##  许可证

MIT © 2026

---

##  致谢

感谢所有为这个项目做出贡献的开发者！

特别感谢：
- LangChain 社区
- Vercel AI SDK 团队
- 所有提供反馈和建议的用户

---

##  联系我们

- **GitHub Issues**: [提交问题](https://github.com/yourusername/devtools-llm/issues)
- **Discussions**: [参与讨论](https://github.com/yourusername/devtools-llm/discussions)
- **Email**: devtools-llm@example.com

---

##  Star History

如果这个项目对你有帮助，请给我们一个 Star！

---

**让 LLM 应用开发更透明、更高效！** 