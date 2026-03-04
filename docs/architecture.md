# Architecture Overview

## Project Structure

```
DevToolsLLM/
  ├── src/
  │   ├── ToolCallTracer.js
  │   ├── ErrorInspector.js
  │   ├── Visualizer.js
  ├── bin/
  │   └── devtools
  ├── tests/
  │   └── test.js
  ├── docs/
  │   └── architecture.md
  ├── README.md
  └── package.json
```

### Modules

- **ToolCallTracer**: Handles tool call tracing and generates trace.json.
- **ErrorInspector**: Analyzes errors from logs and suggests debugging steps.
- **Visualizer**: Provides an ASCII visualization of the tool call chain.

### CLI Usage

- **Commands**: `trace`, `inspect`, `visualize`
- **Input/Output**: Files processed to present or store results, visualizations displayed in terminal.