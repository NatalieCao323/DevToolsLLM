# DevToolsLLM v0.3.0 Release

## Installation

```bash
npm install devtools-llm
```

npm: https://www.npmjs.com/package/devtools-llm

---

## What is DevToolsLLM?

DevToolsLLM is a debugging and monitoring toolkit designed for LLM applications. It provides:

- AI-powered automatic fix suggestions
- Cost optimization analysis
- Time-travel debugging capabilities
- Real-time Web UI monitoring
- Free and runs locally

---

## Core Features

### 1. Automatic Fix Suggestions
```javascript
const { AutoFixSuggester } = require('devtools-llm');

const fixer = new AutoFixSuggester();
const result = await fixer.suggestFix(error, toolCall, history);

// Returns:
// - Root cause analysis
// - Executable fix code
// - Confidence scores
// - Applicable solutions
```

### 2. Cost Optimizer
```javascript
const { CostOptimizer } = require('devtools-llm');

const optimizer = new CostOptimizer();
const analysis = optimizer.analyzeCosts(toolCalls);

// Identifies:
// - Model calls that can use cheaper alternatives
// - Duplicate calls that can be cached
// - Requests that can be batched
```

### 3. Time-Travel Debugger
```javascript
const { TimeTravelDebugger } = require('devtools-llm');

const debugger = new TimeTravelDebugger();
debugger.recordSnapshot(toolCall, context);
debugger.goBack(5);  // Go back 5 steps
debugger.compareSnapshots(id1, id2);  // Compare states
```

### 4. Real-time Web UI
```bash
npm run dev:frontend
# Visit http://localhost:5173
```

Includes 5 pages:
- Dashboard - Real-time monitoring
- Error Analysis - AI-powered error analysis
- Trace Viewer - Call tracing
- Parameter Validation - Schema validation
- Settings - Configuration management

---

## Feature Comparison

| Feature | DevToolsLLM | Langfuse | OpenLLMetry | AgentNeo |
|---------|-------------|----------|-------------|----------|
| Auto-fix suggestions | Yes | No | No | No |
| Cost optimization | Yes | Basic | No | No |
| Time-travel debugging | Yes | No | No | No |
| Local execution | Yes | No | No | Yes |
| Zero configuration | Yes | No | No | Yes |
| Free | Yes | Limited | Yes | Yes |
| Built-in UI | Yes | Yes | No | Yes |

---

## Performance

- Average response time: 0.025ms
- Throughput: 2,793,380 ops/sec
- Package size: 85.5 kB
- All modules: < 1ms response time

---

## Usage Examples

### Debugging LangChain Applications
```javascript
const { LangChainTracer } = require('devtools-llm');

const tracer = new LangChainTracer();
const chain = new LLMChain({ llm, prompt, callbacks: [tracer] });
```

### Monitoring OpenAI Calls
```javascript
const { RealtimeMonitor } = require('devtools-llm');

const monitor = new RealtimeMonitor();
await monitor.start();

// Record each call
monitor.recordCall({
  tool: 'chat',
  model: 'gpt-4',
  tokens: 1000,
  duration: 2000
});
```

### Optimizing Costs
```javascript
const { CostOptimizer } = require('devtools-llm');

const optimizer = new CostOptimizer();
const analysis = optimizer.analyzeCosts(recentCalls);

console.log(`Potential savings: $${analysis.potentialSavings}`);
```

---

## Complete Feature List

### Core Modules (5)
- ErrorInspector - 错误分析
- ToolCallTracer - 调用追踪
- TraceVisualizer - 可视化
- RealtimeMonitor - 实时监控
- ParameterValidator - 参数验证

### ML Modules (4)
- MLErrorInspector - ML 增强分析
- ErrorClassifier - 错误分类
- AnomalyDetector - 异常检测
- SuggestionGenerator - 建议生成

### Advanced Features (4)
- AutoFixSuggester - 自动修复
- LLMAutoFixSuggester - LLM 增强修复
- CostOptimizer - 成本优化
- TimeTravelDebugger - 时间旅行

### Framework Integrations (2)
- LangChainTracer
- VercelAITracer

---

## Test Coverage

- Core tests: 4/4 passing (100%)
- Feature tests: 13/14 passing (92.9%)
- ML tests: 5/5 passing (100%)
- Performance tests: All modules < 1ms
- Web UI: Fully functional with real interactions

---

## Documentation

- [README](https://github.com/yourusername/DevToolsLLM)
- [API 文档](https://github.com/yourusername/DevToolsLLM/tree/main/docs)
- [Web UI 使用指南](./WEB_UI_USAGE_GUIDE.md)
- [性能报告](./PERFORMANCE_REPORT.md)
- [LLM 集成指南](./docs/LLM_INTEGRATION_GUIDE.md)
- [竞品分析](./docs/COMPETITIVE_ANALYSIS.md)

---

## Quick Start

```bash
# 1. Install
npm install devtools-llm

# 2. Run demo
npx devtools-llm

# 3. Start Web UI
npm run dev:frontend

# 4. Visit
http://localhost:5173
```

---

## Why DevToolsLLM?

### AI-Powered Auto-Fix
Generates executable fix code, not just error messages.

### Cost Optimization
Identifies optimization opportunities to reduce LLM API costs.

### Time-Travel Debugging
Replay any point in execution history to locate issues quickly.

### Local Execution
Runs entirely on your machine. No registration required, data stays local.

### Free and Open
All features are free with no usage limits.

---

## Example Code

### Complete Error Handling Workflow
```javascript
const {
  AutoFixSuggester,
  CostOptimizer,
  TimeTravelDebugger,
  RealtimeMonitor
} = require('devtools-llm');

// 1. Start monitoring
const monitor = new RealtimeMonitor();
await monitor.start();

// 2. Record calls
const debugger = new TimeTravelDebugger();
debugger.recordSnapshot(toolCall, context);

// 3. Auto-fix on error
if (error) {
  const fixer = new AutoFixSuggester();
  const fixes = await fixer.suggestFix(error, toolCall, history);
  
  console.log('Fix suggestion:', fixes.fixes[0].title);
  console.log('Code:', fixes.fixes[0].code);
}

// 4. Optimize costs
const optimizer = new CostOptimizer();
const analysis = optimizer.analyzeCosts(recentCalls);
console.log(`Potential savings: $${analysis.potentialSavings}`);
```

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

---

## License

MIT License

---

## Links

- npm: https://www.npmjs.com/package/devtools-llm
- GitHub: https://github.com/yourusername/DevToolsLLM
- Documentation: https://github.com/yourusername/DevToolsLLM/tree/main/docs

---

## Contact

- Issues: https://github.com/yourusername/DevToolsLLM/issues
- Email: caoqt2000@outlook.com
- Maintainer: nataliecao323

---

Get started:

```bash
npm install devtools-llm
```
