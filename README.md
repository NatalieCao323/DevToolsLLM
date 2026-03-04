# DevToolsLLM

## 项目简介

DevToolsLLM 是一个强大的开发工具，专注于帮助 AI / LLM 工具的开发者进行调试和错误分析。

## 特性
- **ToolCallTracer**：记录工具调用链。
- **ErrorInspector**：分析并提供工具调用的错误报告。
- **TraceVisualizer**：以 ASCII 图形可视化调用流程。

## 使用方法

### CLI 示例

```bash
# 记录工具调用链
$ devtools trace tool_log.json

# 分析工具调用错误
$ devtools inspect error.log

# 可视化调用流程
$ devtools visualize trace.json
```

## 示例

### Example

```bash
devtools trace tool_log.json
```

### Output

```
ToolCallChain
 ├─ LLM call
 ├─ tool: search
 ├─ tool: calculator
 └─ result
```