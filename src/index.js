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

// ML modules
const MLErrorInspector = require('./ml/MLErrorInspector');
const ErrorClassifier = require('./ml/ErrorClassifier');
const AnomalyDetector = require('./ml/AnomalyDetector');
const SuggestionGenerator = require('./ml/SuggestionGenerator');

// Advanced features
const AutoFixSuggester = require('./AutoFixSuggester');
const CostOptimizer = require('./CostOptimizer');
const TimeTravelDebugger = require('./TimeTravelDebugger');

module.exports = {
  // Core modules
  ErrorInspector,
  ToolCallTracer,
  TraceVisualizer,
  RealtimeMonitor,
  ParameterValidator,
  
  // ML modules
  MLErrorInspector,
  ErrorClassifier,
  AnomalyDetector,
  SuggestionGenerator,
  
  // Advanced features
  AutoFixSuggester,
  CostOptimizer,
  TimeTravelDebugger,
  
  // Framework integrations
  LangChainTracer,
  VercelAITracer,
  
  // Convenience exports
  inspect: ErrorInspector.inspect,
  trace: ToolCallTracer.trace,
  visualize: TraceVisualizer.visualize,
  monitor: RealtimeMonitor.start
};
