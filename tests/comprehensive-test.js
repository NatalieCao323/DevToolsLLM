/**
 * Comprehensive Test Suite for DevToolsLLM v0.3.0
 * Tests all core, ML, and advanced features
 */

const assert = require('assert');

// Import all modules
const {
  ErrorInspector,
  ToolCallTracer,
  TraceVisualizer,
  ParameterValidator,
  MLErrorInspector,
  ErrorClassifier,
  AnomalyDetector,
  SuggestionGenerator,
  AutoFixSuggester,
  CostOptimizer,
  TimeTravelDebugger
} = require('../src/index');

console.log('🧪 Starting Comprehensive Test Suite...\n');

let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    testsPassed++;
  } catch (error) {
    console.error(`❌ ${name}`);
    console.error(`   Error: ${error.message}`);
    testsFailed++;
  }
}

async function asyncTest(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    testsPassed++;
  } catch (error) {
    console.error(`❌ ${name}`);
    console.error(`   Error: ${error.message}`);
    testsFailed++;
  }
}

// ============================================================================
// Core Modules Tests
// ============================================================================

console.log('📦 Testing Core Modules\n');

test('ErrorInspector - Basic initialization', () => {
  const inspector = new ErrorInspector();
  assert(inspector !== null);
  assert(typeof inspector.inspect === 'function');
});

test('ErrorInspector - Timeout error detection', () => {
  const inspector = new ErrorInspector();
  const error = new Error('Request timeout after 30s');
  const result = inspector.classifyError(error);
  assert.strictEqual(result.type, 'TIMEOUT');
  assert(result.severity === 'HIGH' || result.severity === 'MEDIUM');
});

test('ErrorInspector - Rate limit error detection', () => {
  const inspector = new ErrorInspector();
  const error = new Error('Rate limit exceeded (429)');
  const result = inspector.classifyError(error);
  assert.strictEqual(result.type, 'API_ERROR');
});

test('ErrorInspector - Authentication error detection', () => {
  const inspector = new ErrorInspector();
  const error = new Error('Invalid API key');
  const result = inspector.classifyError(error);
  assert.strictEqual(result.type, 'AUTHENTICATION');
  assert.strictEqual(result.severity, 'CRITICAL');
});

test('ErrorInspector - Suggestions generation', () => {
  const inspector = new ErrorInspector();
  const error = new Error('Request timeout');
  const result = inspector.classifyError(error);
  assert(Array.isArray(result.suggestions));
  assert(result.suggestions.length > 0);
});

test('ToolCallTracer - Basic initialization', () => {
  const tracer = new ToolCallTracer();
  assert(tracer !== null);
  assert(typeof tracer.trace === 'function');
});

test('ToolCallTracer - Record tool call', () => {
  const tracer = new ToolCallTracer();
  const call = {
    id: 'call_1',
    name: 'search',
    parameters: { query: 'test' },
    timestamp: Date.now(),
    duration: 120,
    success: true
  };
  tracer.recordCall(call);
  const history = tracer.getHistory();
  assert.strictEqual(history.length, 1);
  assert.strictEqual(history[0].name, 'search');
});

test('ToolCallTracer - Build call tree', () => {
  const tracer = new ToolCallTracer();
  tracer.recordCall({ id: 'call_1', name: 'search', parentId: null, success: true });
  tracer.recordCall({ id: 'call_2', name: 'calculator', parentId: 'call_1', success: true });
  tracer.recordCall({ id: 'call_3', name: 'weather', parentId: 'call_1', success: true });
  
  const tree = tracer.buildTree();
  assert(Array.isArray(tree));
  assert.strictEqual(tree.length, 1);
  assert.strictEqual(tree[0].children.length, 2);
});

test('ToolCallTracer - Calculate statistics', () => {
  const tracer = new ToolCallTracer();
  tracer.recordCall({ name: 'search', duration: 100, success: true });
  tracer.recordCall({ name: 'search', duration: 200, success: true });
  tracer.recordCall({ name: 'search', duration: 150, success: false });
  
  const stats = tracer.getStatistics();
  assert.strictEqual(stats.totalCalls, 3);
  assert.strictEqual(stats.successfulCalls, 2);
  assert.strictEqual(stats.failedCalls, 1);
  assert(stats.averageDuration > 0);
});

test('TraceVisualizer - ASCII tree generation', () => {
  const visualizer = new TraceVisualizer();
  const tree = [
    {
      name: 'search',
      duration: 120,
      success: true,
      children: [
        { name: 'calculator', duration: 45, success: true, children: [] },
        { name: 'weather', duration: 80, success: true, children: [] }
      ]
    }
  ];
  
  const ascii = visualizer.generateASCIITree(tree);
  assert(typeof ascii === 'string');
  assert(ascii.includes('search'));
  assert(ascii.includes('calculator'));
  assert(ascii.includes('weather'));
});

test('ParameterValidator - Valid parameters', () => {
  const schema = {
    type: 'object',
    properties: {
      query: { type: 'string' },
      limit: { type: 'number' }
    },
    required: ['query']
  };
  
  const params = { query: 'test', limit: 10 };
  const result = ParameterValidator.validate(params, schema);
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.errors.length, 0);
});

test('ParameterValidator - Missing required parameter', () => {
  const schema = {
    type: 'object',
    properties: {
      query: { type: 'string' }
    },
    required: ['query']
  };
  
  const params = {};
  const result = ParameterValidator.validate(params, schema);
  assert.strictEqual(result.valid, false);
  assert(result.errors.length > 0);
});

test('ParameterValidator - Type mismatch', () => {
  const schema = {
    type: 'object',
    properties: {
      limit: { type: 'number' }
    }
  };
  
  const params = { limit: 'not a number' };
  const result = ParameterValidator.validate(params, schema);
  assert.strictEqual(result.valid, false);
});

// ============================================================================
// ML Modules Tests
// ============================================================================

console.log('\n🤖 Testing ML Modules\n');

test('ErrorClassifier - Initialization', () => {
  const classifier = new ErrorClassifier();
  assert(classifier !== null);
  assert(typeof classifier.classify === 'function');
});

test('ErrorClassifier - Classify timeout error', () => {
  const classifier = new ErrorClassifier();
  const error = { message: 'Request timeout after 30s' };
  const result = classifier.classify(error);
  
  assert.strictEqual(result.type, 'TIMEOUT');
  assert(result.confidence >= 0 && result.confidence <= 1);
  assert(result.confidence > 0.8); // Should be high confidence
});

test('ErrorClassifier - Classify with context', () => {
  const classifier = new ErrorClassifier();
  const error = { message: 'Connection refused' };
  const context = { tool: 'database', previousErrors: [] };
  const result = classifier.classify(error, context);
  
  assert.strictEqual(result.type, 'NETWORK');
  assert(result.subtype !== undefined);
});

test('AnomalyDetector - Initialization', () => {
  const detector = new AnomalyDetector({ windowSize: 10 });
  assert(detector !== null);
  assert(typeof detector.detect === 'function');
});

test('AnomalyDetector - Detect duration anomaly', () => {
  const detector = new AnomalyDetector({ windowSize: 5 });
  
  // Normal calls
  for (let i = 0; i < 5; i++) {
    detector.recordCall({ name: 'search', duration: 100, success: true });
  }
  
  // Anomalous call
  const anomaly = detector.detect({ name: 'search', duration: 1000, success: true });
  assert(anomaly.isAnomaly === true);
  assert(anomaly.type === 'duration');
});

test('AnomalyDetector - Detect error rate anomaly', () => {
  const detector = new AnomalyDetector({ windowSize: 10 });
  
  // Normal calls
  for (let i = 0; i < 8; i++) {
    detector.recordCall({ name: 'api', success: true });
  }
  
  // Many failures
  for (let i = 0; i < 5; i++) {
    detector.recordCall({ name: 'api', success: false });
  }
  
  const anomaly = detector.detect({ name: 'api', success: false });
  assert(anomaly.isAnomaly === true);
  assert(anomaly.type === 'error_rate');
});

test('SuggestionGenerator - Generate suggestions', () => {
  const generator = new SuggestionGenerator();
  const error = { type: 'TIMEOUT', message: 'Request timeout' };
  const context = { tool: 'search', duration: 30000 };
  
  const suggestions = generator.generate(error, context);
  assert(Array.isArray(suggestions));
  assert(suggestions.length > 0);
  assert(suggestions[0].title !== undefined);
  assert(suggestions[0].description !== undefined);
});

test('SuggestionGenerator - Confidence scoring', () => {
  const generator = new SuggestionGenerator();
  const error = { type: 'AUTHENTICATION', message: 'Invalid API key' };
  const context = { tool: 'openai' };
  
  const suggestions = generator.generate(error, context);
  assert(suggestions.every(s => s.confidence >= 0 && s.confidence <= 1));
});

test('MLErrorInspector - Integration', () => {
  const inspector = new MLErrorInspector({ enableML: true });
  assert(inspector !== null);
  assert(typeof inspector.inspect === 'function');
});

test('MLErrorInspector - Enhanced analysis', () => {
  const inspector = new MLErrorInspector({ enableML: true });
  const error = new Error('Rate limit exceeded');
  const toolCall = { name: 'openai', duration: 1000 };
  
  const result = inspector.analyzeWithML(error, toolCall, []);
  assert(result.classification !== undefined);
  assert(result.anomaly !== undefined);
  assert(result.suggestions !== undefined);
  assert(Array.isArray(result.suggestions));
});

// ============================================================================
// Advanced Features Tests
// ============================================================================

console.log('\n⚡ Testing Advanced Features\n');

test('AutoFixSuggester - Initialization', () => {
  const fixer = new AutoFixSuggester();
  assert(fixer !== null);
  assert(typeof fixer.suggestFix === 'function');
});

asyncTest('AutoFixSuggester - Timeout fix suggestions', async () => {
  const fixer = new AutoFixSuggester();
  const error = new Error('Request timeout after 30s');
  const toolCall = { name: 'api', duration: 30000 };
  
  const result = await fixer.suggestFix(error, toolCall, []);
  assert(result.fixes !== undefined);
  assert(Array.isArray(result.fixes));
  assert(result.fixes.length > 0);
  assert(result.fixes[0].title !== undefined);
  assert(result.fixes[0].code !== undefined);
  assert(result.fixes[0].confidence !== undefined);
});

asyncTest('AutoFixSuggester - Rate limit fix suggestions', async () => {
  const fixer = new AutoFixSuggester();
  const error = new Error('Rate limit exceeded (429)');
  const toolCall = { name: 'api' };
  
  const result = await fixer.suggestFix(error, toolCall, []);
  assert(result.fixes.length > 0);
  assert(result.fixes.some(f => f.title.toLowerCase().includes('rate')));
});

asyncTest('AutoFixSuggester - Root cause analysis', async () => {
  const fixer = new AutoFixSuggester();
  const error = new Error('ECONNREFUSED');
  const toolCall = { name: 'database' };
  
  const result = await fixer.suggestFix(error, toolCall, []);
  assert(result.analysis !== undefined);
  assert(result.analysis.errorType !== undefined);
  assert(result.analysis.rootCause !== undefined);
});

test('CostOptimizer - Initialization', () => {
  const optimizer = new CostOptimizer();
  assert(optimizer !== null);
  assert(typeof optimizer.analyzeCosts === 'function');
});

test('CostOptimizer - Cost calculation', () => {
  const optimizer = new CostOptimizer();
  const toolCalls = [
    {
      name: 'openai',
      model: 'gpt-4',
      tokens: { input: 1000, output: 500 },
      success: true
    },
    {
      name: 'openai',
      model: 'gpt-3.5-turbo',
      tokens: { input: 500, output: 200 },
      success: true
    }
  ];
  
  const analysis = optimizer.analyzeCosts(toolCalls);
  assert(analysis.totalCost > 0);
  assert(analysis.costByModel['gpt-4'] > 0);
  assert(analysis.costByModel['gpt-3.5-turbo'] > 0);
});

test('CostOptimizer - Optimization opportunities', () => {
  const optimizer = new CostOptimizer();
  const toolCalls = [
    {
      name: 'simple_task',
      model: 'gpt-4',
      tokens: { input: 100, output: 50 },
      success: true
    },
    {
      name: 'simple_task',
      model: 'gpt-4',
      tokens: { input: 100, output: 50 },
      success: true
    }
  ];
  
  const analysis = optimizer.analyzeCosts(toolCalls);
  assert(Array.isArray(analysis.optimizationOpportunities));
  assert(analysis.potentialSavings >= 0);
});

test('CostOptimizer - Caching opportunities', () => {
  const optimizer = new CostOptimizer();
  const toolCalls = [
    {
      name: 'search',
      parameters: { query: 'test' },
      model: 'gpt-3.5-turbo',
      tokens: { input: 100, output: 50 },
      timestamp: Date.now()
    },
    {
      name: 'search',
      parameters: { query: 'test' },
      model: 'gpt-3.5-turbo',
      tokens: { input: 100, output: 50 },
      timestamp: Date.now() + 1000
    }
  ];
  
  const analysis = optimizer.analyzeCosts(toolCalls);
  const cachingOpp = analysis.optimizationOpportunities.find(o => o.type === 'caching');
  assert(cachingOpp !== undefined);
  assert(cachingOpp.potentialSavings > 0);
});

test('TimeTravelDebugger - Initialization', () => {
  const timeDebugger = new TimeTravelDebugger();
  assert(timeDebugger !== null);
  assert(typeof timeDebugger.recordSnapshot === 'function');
});

test('TimeTravelDebugger - Record snapshot', () => {
  const timeDebugger = new TimeTravelDebugger();
  const toolCall = { name: 'search', parameters: { query: 'test' } };
  const context = { timestamp: Date.now() };
  
  const snapshotId = timeDebugger.recordSnapshot(toolCall, context);
  assert(typeof snapshotId === 'string');
  assert(snapshotId.startsWith('snapshot_'));
});

test('TimeTravelDebugger - Go back', () => {
  const timeDebugger = new TimeTravelDebugger();
  
  timeDebugger.recordSnapshot({ name: 'call1' }, {});
  timeDebugger.recordSnapshot({ name: 'call2' }, {});
  timeDebugger.recordSnapshot({ name: 'call3' }, {});
  
  const result = timeDebugger.goBack(2);
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.snapshot.toolCall.name, 'call1');
});

test('TimeTravelDebugger - Go forward', () => {
  const timeDebugger = new TimeTravelDebugger();
  
  timeDebugger.recordSnapshot({ name: 'call1' }, {});
  timeDebugger.recordSnapshot({ name: 'call2' }, {});
  timeDebugger.recordSnapshot({ name: 'call3' }, {});
  
  timeDebugger.goBack(2);
  const result = timeDebugger.goForward(1);
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.snapshot.toolCall.name, 'call2');
});

test('TimeTravelDebugger - Compare snapshots', () => {
  const timeDebugger = new TimeTravelDebugger();
  
  const id1 = timeDebugger.recordSnapshot({ name: 'search', param: 'old' }, {});
  const id2 = timeDebugger.recordSnapshot({ name: 'search', param: 'new' }, {});
  
  const comparison = timeDebugger.compareSnapshots(id1, id2);
  assert.strictEqual(comparison.success, true);
  assert(comparison.comparison !== undefined);
  assert(comparison.comparison.toolCallChanges !== undefined);
});

test('TimeTravelDebugger - Find snapshots by tool', () => {
  const timeDebugger = new TimeTravelDebugger();
  
  timeDebugger.recordSnapshot({ name: 'search' }, {});
  timeDebugger.recordSnapshot({ name: 'calculator' }, {});
  timeDebugger.recordSnapshot({ name: 'search' }, {});
  
  const searchSnapshots = timeDebugger.findSnapshotsByTool('search');
  assert.strictEqual(searchSnapshots.length, 2);
});

test('TimeTravelDebugger - Analyze call pattern', () => {
  const timeDebugger = new TimeTravelDebugger();
  
  for (let i = 0; i < 5; i++) {
    timeDebugger.recordSnapshot({
      name: 'api',
      duration: 100 + i * 10,
      success: i < 4,
      error: i === 4 ? new Error('timeout') : null
    }, {});
  }
  
  const analysis = timeDebugger.analyzeCallPattern('api');
  assert.strictEqual(analysis.success, true);
  assert(analysis.analysis.totalCalls === 5);
  assert(analysis.analysis.successRate === 80);
});

// ============================================================================
// Integration Tests
// ============================================================================

console.log('\n🔗 Testing Integration Scenarios\n');

asyncTest('Full workflow: Error detection -> Classification -> Fix suggestion', async () => {
  const inspector = new ErrorInspector();
  const fixer = new AutoFixSuggester();
  
  // 1. Detect error
  const error = new Error('Request timeout after 30s');
  const classification = inspector.classifyError(error);
  assert.strictEqual(classification.type, 'TIMEOUT');
  
  // 2. Get fix suggestions
  const toolCall = { name: 'api', duration: 30000 };
  const fixes = await fixer.suggestFix(error, toolCall, []);
  assert(fixes.fixes.length > 0);
  
  // 3. Verify fix quality
  const bestFix = fixes.fixes[0];
  assert(bestFix.confidence > 0.7);
  assert(bestFix.code.length > 0);
});

asyncTest('Full workflow: Trace -> Analyze -> Optimize', async () => {
  const tracer = new ToolCallTracer();
  const optimizer = new CostOptimizer();
  
  // 1. Record calls
  const calls = [
    { name: 'gpt4', model: 'gpt-4', tokens: { input: 1000, output: 500 }, success: true },
    { name: 'gpt4', model: 'gpt-4', tokens: { input: 1000, output: 500 }, success: true },
    { name: 'gpt35', model: 'gpt-3.5-turbo', tokens: { input: 500, output: 200 }, success: true }
  ];
  
  calls.forEach(call => tracer.recordCall(call));
  
  // 2. Get statistics
  const stats = tracer.getStatistics();
  assert.strictEqual(stats.totalCalls, 3);
  
  // 3. Analyze costs
  const costAnalysis = optimizer.analyzeCosts(calls);
  assert(costAnalysis.totalCost > 0);
  assert(costAnalysis.optimizationOpportunities.length > 0);
});

asyncTest('Full workflow: ML-enhanced error analysis', async () => {
  const mlInspector = new MLErrorInspector({ enableML: true });
  const timeDebugger = new TimeTravelDebugger();
  
  // 1. Record error scenario
  const error = new Error('Rate limit exceeded');
  const toolCall = { name: 'openai', duration: 1000, success: false };
  timeDebugger.recordSnapshot(toolCall, { error });
  
  // 2. ML analysis
  const analysis = mlInspector.analyzeWithML(error, toolCall, []);
  assert(analysis.classification !== undefined);
  assert(analysis.suggestions.length > 0);
  
  // 3. Time travel to analyze
  const snapshots = timeDebugger.findSnapshotsByError();
  assert(snapshots.length > 0);
});

// ============================================================================
// Summary
// ============================================================================

console.log('\n' + '='.repeat(60));
console.log('📊 Test Summary');
console.log('='.repeat(60));
console.log(`✅ Tests Passed: ${testsPassed}`);
console.log(`❌ Tests Failed: ${testsFailed}`);
console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
console.log('='.repeat(60));

if (testsFailed === 0) {
  console.log('\n🎉 All tests passed! Ready for production.');
  process.exit(0);
} else {
  console.log(`\n⚠️  ${testsFailed} test(s) failed. Please review and fix.`);
  process.exit(1);
}
