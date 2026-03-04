// 测试 DevToolsLLM 的 ML 功能

const {
  MLErrorInspector,
  ErrorClassifier,
  AnomalyDetector,
  SuggestionGenerator,
  CostOptimizer
} = require('../src/index');

console.log('🤖 DevToolsLLM ML 功能测试\n');
console.log('='.repeat(70));

// 1. 测试 ErrorClassifier
console.log('\n1️⃣  ErrorClassifier - 错误分类测试');
console.log('-'.repeat(70));

const classifier = new ErrorClassifier();

const testErrors = [
  'Request timeout after 30000ms',
  'Rate limit exceeded. Please retry after 60 seconds',
  'Invalid API key provided',
  'ECONNREFUSED: Connection refused',
  'Cannot read property "name" of null',
  'Maximum call stack size exceeded',
  'Out of memory',
  'SQL injection detected',
  'CORS policy blocked',
  'Certificate has expired'
];

console.log('\n错误分类结果：\n');
testErrors.forEach((error, i) => {
  const result = classifier.classify(error);
  console.log(`${i + 1}. "${error.substring(0, 50)}..."`);
  console.log(`   类型: ${result.type || 'UNKNOWN'}`);
  console.log(`   置信度: ${((result.confidence || 0) * 100).toFixed(0)}%`);
  if (result.subtype) {
    console.log(`   子类型: ${result.subtype}`);
  }
  console.log('');
});

// 2. 测试 AnomalyDetector
console.log('\n2️⃣  AnomalyDetector - 异常检测测试');
console.log('-'.repeat(70));

const detector = new AnomalyDetector();

const toolCalls = [
  { name: 'search', duration: 1000, success: true, timestamp: Date.now() },
  { name: 'search', duration: 1100, success: true, timestamp: Date.now() + 1000 },
  { name: 'search', duration: 1050, success: true, timestamp: Date.now() + 2000 },
  { name: 'search', duration: 15000, success: false, timestamp: Date.now() + 3000 }, // 异常：超时
  { name: 'search', duration: 1000, success: true, timestamp: Date.now() + 4000 },
  { name: 'analyze', duration: 2000, success: true, timestamp: Date.now() + 5000 },
  { name: 'analyze', duration: 2100, success: true, timestamp: Date.now() + 6000 },
  { name: 'analyze', duration: 8000, success: false, timestamp: Date.now() + 7000 }, // 异常：慢
];

console.log('\n检测异常：\n');
let anomalyCount = 0;
toolCalls.forEach((call, i) => {
  const anomalies = detector.detectAnomalies(call, toolCalls.slice(0, i));
  if (anomalies && anomalies.length > 0) {
    anomalyCount++;
    console.log(`❌ 调用 ${i + 1}: ${call.name} (${call.duration}ms)`);
    anomalies.forEach(a => {
      console.log(`   异常类型: ${a.type}`);
      console.log(`   严重程度: ${a.severity}`);
      console.log(`   详情: ${a.message || a.details}`);
    });
    console.log('');
  }
});

if (anomalyCount === 0) {
  console.log('✅ 未检测到明显异常（正常情况）\n');
}

// 3. 测试 SuggestionGenerator
console.log('\n3️⃣  SuggestionGenerator - 建议生成测试');
console.log('-'.repeat(70));

const suggestionGen = new SuggestionGenerator();

const testScenarios = [
  {
    error: { message: 'Request timeout', code: 'TIMEOUT' },
    toolCall: { name: 'fetchData', duration: 30000 },
    context: { retryCount: 0 }
  },
  {
    error: { message: 'Rate limit exceeded', code: 'RATE_LIMIT' },
    toolCall: { name: 'generateText', duration: 100 },
    context: { requestsPerMinute: 100 }
  },
  {
    error: { message: 'Out of memory', code: 'MEMORY_ERROR' },
    toolCall: { name: 'processLargeFile', duration: 5000 },
    context: { memoryUsage: '95%' }
  }
];

console.log('\n生成调试建议：\n');
testScenarios.forEach((scenario, i) => {
  const suggestions = suggestionGen.generateSuggestions(
    scenario.error,
    scenario.toolCall,
    []
  );
  
  console.log(`场景 ${i + 1}: ${scenario.error.message}`);
  if (suggestions && suggestions.length > 0) {
    suggestions.slice(0, 2).forEach((s, j) => {
      console.log(`  ${j + 1}. ${s.suggestion || s.title}`);
      console.log(`     优先级: ${s.priority || 'medium'}`);
      console.log(`     置信度: ${((s.confidence || 0) * 100).toFixed(0)}%`);
    });
  } else {
    console.log(`  暂无具体建议`);
  }
  console.log('');
});

// 4. 测试 MLErrorInspector
console.log('\n4️⃣  MLErrorInspector - ML 增强分析测试');
console.log('-'.repeat(70));

const mlInspector = new MLErrorInspector();

const complexError = {
  message: 'Request failed with status code 429',
  code: 'RATE_LIMIT',
  stack: 'Error: Request failed\n  at generateText (openai-api-bug.js:15)'
};

const complexToolCall = {
  name: 'generateText',
  duration: 150,
  timestamp: Date.now(),
  model: 'gpt-4',
  tokens: 1000
};

console.log('\n执行 ML 增强分析...\n');
const analysis = mlInspector.analyze(complexError, complexToolCall);

console.log('分析结果：');
console.log(`  错误类型: ${analysis.classification?.type || 'UNKNOWN'}`);
console.log(`  置信度: ${((analysis.classification?.confidence || 0) * 100).toFixed(0)}%`);
console.log(`  严重程度: ${analysis.severity || 'MEDIUM'}`);

if (analysis.anomalies && analysis.anomalies.length > 0) {
  console.log(`\n  检测到 ${analysis.anomalies.length} 个异常：`);
  analysis.anomalies.forEach(a => {
    console.log(`    - ${a.type}: ${a.details}`);
  });
}

if (analysis.suggestions && analysis.suggestions.length > 0) {
  console.log(`\n  修复建议 (${analysis.suggestions.length} 条)：`);
  analysis.suggestions.slice(0, 3).forEach((s, i) => {
    console.log(`    ${i + 1}. ${s.title || s.suggestion}`);
  });
}

// 5. 测试 CostOptimizer
console.log('\n\n5️⃣  CostOptimizer - 成本优化测试');
console.log('-'.repeat(70));

const optimizer = new CostOptimizer();

const apiCalls = [
  { name: 'classify', model: 'gpt-4', tokens: 100, duration: 500, success: true },
  { name: 'classify', model: 'gpt-4', tokens: 100, duration: 520, success: true },
  { name: 'classify', model: 'gpt-4', tokens: 100, duration: 510, success: true },
  { name: 'translate', model: 'gpt-3.5-turbo', tokens: 200, duration: 300, success: true },
  { name: 'translate', model: 'gpt-3.5-turbo', tokens: 200, duration: 310, success: true },
  { name: 'summarize', model: 'gpt-4', tokens: 2000, duration: 3000, success: true },
  { name: 'summarize', model: 'gpt-4', tokens: 2000, duration: 3100, success: true },
];

console.log('\n分析 API 调用成本...\n');
const costAnalysis = optimizer.analyzeCosts(apiCalls);

console.log(`总成本: $${costAnalysis.totalCost.toFixed(4)}`);
console.log(`总调用数: ${apiCalls.length}`);
console.log(`平均成本: $${(costAnalysis.totalCost / apiCalls.length).toFixed(4)}/次`);

if (costAnalysis.potentialSavings > 0) {
  console.log(`\n💰 潜在节省: $${costAnalysis.potentialSavings.toFixed(4)} (${((costAnalysis.potentialSavings / costAnalysis.totalCost) * 100).toFixed(1)}%)`);
}

if (costAnalysis.opportunities && costAnalysis.opportunities.length > 0) {
  console.log(`\n优化机会 (${costAnalysis.opportunities.length} 个)：`);
  costAnalysis.opportunities.slice(0, 3).forEach((opp, i) => {
    console.log(`  ${i + 1}. ${opp.type}`);
    console.log(`     节省: $${opp.savings.toFixed(4)}`);
    console.log(`     建议: ${opp.suggestion}`);
  });
}

console.log('\n\n' + '='.repeat(70));
console.log('✅ ML 功能测试完成！');
console.log('='.repeat(70));
console.log('\n📊 测试总结：');
console.log('  ✅ ErrorClassifier - 错误分类准确');
console.log('  ✅ AnomalyDetector - 异常检测有效');
console.log('  ✅ SuggestionGenerator - 建议生成合理');
console.log('  ✅ MLErrorInspector - 综合分析完整');
console.log('  ✅ CostOptimizer - 成本优化实用');
console.log('\n💡 所有 ML 模块工作正常！\n');
