/**
 * DevToolsLLM - Main entry point
 * Debugging and monitoring tools for LLM applications
 */

const ErrorInspector = require('./ErrorInspector');
const ToolCallTracer = require('./ToolCallTracer');
const TraceVisualizer = require('./TraceVisualizer');
const RealtimeMonitor = require('./RealtimeMonitor');
const { ParameterValidator } = require('./ParameterValidator');
const { LangChainTracer } = require('./integrations/langchain');
const { VercelAITracer } = require('./integrations/vercel-ai');

module.exports = {
  // Core modules
  ErrorInspector,
  ToolCallTracer,
  TraceVisualizer,
  RealtimeMonitor,
  ParameterValidator,
  
  // Framework integrations
  LangChainTracer,
  VercelAITracer,
  
  // Convenience exports
  inspect: ErrorInspector.inspect,
  trace: ToolCallTracer.trace,
  visualize: TraceVisualizer.visualize,
  monitor: RealtimeMonitor.start
};
