// 测试 DevToolsLLM 的自动修复功能

const { AutoFixSuggester } = require('../src/index');

console.log('🔧 DevToolsLLM 自动修复功能演示\n');
console.log('='.repeat(70));

const fixer = new AutoFixSuggester({ enableAutoApply: false });

// 测试场景 1: 超时错误
console.log('\n📋 场景 1: API 请求超时');
console.log('-'.repeat(70));

const timeoutError = {
  message: 'Request timeout after 30000ms',
  code: 'TIMEOUT',
  stack: 'Error: Request timeout\n  at fetchUserData (timeout-bug.js:8:15)'
};

const timeoutToolCall = {
  name: 'fetchUserData',
  duration: 30500,
  timestamp: Date.now()
};

console.log('❌ 错误信息:', timeoutError.message);
console.log('🔍 分析中...\n');

const fix1 = fixer.suggestFix(timeoutError, timeoutToolCall, []);
console.log('💡 自动修复建议:');
console.log('   根因:', fix1.rootCause);
console.log('   严重程度:', fix1.severity);
console.log('   置信度:', fix1.confidence);

if (fix1.fixes && fix1.fixes.length > 0) {
  console.log('\n   推荐修复方案:');
  fix1.fixes.slice(0, 2).forEach((f, i) => {
    console.log(`\n   ${i + 1}. ${f.title}`);
    console.log(`      置信度: ${(f.confidence * 100).toFixed(0)}%`);
    console.log(`      工作量: ${f.effort}`);
    if (f.code) {
      console.log(`      代码示例:\n${f.code.split('\n').map(l => '      ' + l).join('\n')}`);
    }
  });
}

// 测试场景 2: 速率限制错误
console.log('\n\n📋 场景 2: API 速率限制');
console.log('-'.repeat(70));

const rateLimitError = {
  message: 'Rate limit exceeded. Please retry after 60 seconds',
  code: 'RATE_LIMIT',
  status: 429
};

const rateLimitToolCall = {
  name: 'generateManyResponses',
  duration: 150,
  timestamp: Date.now()
};

console.log('❌ 错误信息:', rateLimitError.message);
console.log('🔍 分析中...\n');

const fix2 = fixer.suggestFix(rateLimitError, rateLimitToolCall, []);
console.log('💡 自动修复建议:');
console.log('   根因:', fix2.rootCause);
console.log('   严重程度:', fix2.severity);

if (fix2.fixes && fix2.fixes.length > 0) {
  console.log('\n   推荐修复方案:');
  fix2.fixes.slice(0, 2).forEach((f, i) => {
    console.log(`\n   ${i + 1}. ${f.title}`);
    console.log(`      置信度: ${(f.confidence * 100).toFixed(0)}%`);
    if (f.code) {
      console.log(`      代码示例:\n${f.code.split('\n').map(l => '      ' + l).join('\n')}`);
    }
  });
}

// 测试场景 3: 认证错误
console.log('\n\n📋 场景 3: 认证失败');
console.log('-'.repeat(70));

const authError = {
  message: 'Invalid API key provided',
  code: 'AUTHENTICATION_ERROR',
  status: 401
};

const authToolCall = {
  name: 'authenticatedRequest',
  duration: 100,
  timestamp: Date.now()
};

console.log('❌ 错误信息:', authError.message);
console.log('🔍 分析中...\n');

const fix3 = fixer.suggestFix(authError, authToolCall, []);
console.log('💡 自动修复建议:');
console.log('   根因:', fix3.rootCause);
console.log('   严重程度:', fix3.severity);

if (fix3.fixes && fix3.fixes.length > 0) {
  console.log('\n   推荐修复方案:');
  fix3.fixes.slice(0, 2).forEach((f, i) => {
    console.log(`\n   ${i + 1}. ${f.title}`);
    console.log(`      置信度: ${(f.confidence * 100).toFixed(0)}%`);
    if (f.code) {
      console.log(`      代码示例:\n${f.code.split('\n').map(l => '      ' + l).join('\n')}`);
    }
  });
}

// 测试场景 4: 网络错误
console.log('\n\n📋 场景 4: 网络连接失败');
console.log('-'.repeat(70));

const networkError = {
  message: 'ECONNREFUSED: Connection refused',
  code: 'NETWORK_ERROR'
};

const networkToolCall = {
  name: 'searchDatabase',
  duration: 5000,
  timestamp: Date.now()
};

console.log('❌ 错误信息:', networkError.message);
console.log('🔍 分析中...\n');

const fix4 = fixer.suggestFix(networkError, networkToolCall, []);
console.log('💡 自动修复建议:');
console.log('   根因:', fix4.rootCause);
console.log('   严重程度:', fix4.severity);

if (fix4.fixes && fix4.fixes.length > 0) {
  console.log('\n   推荐修复方案:');
  fix4.fixes.slice(0, 2).forEach((f, i) => {
    console.log(`\n   ${i + 1}. ${f.title}`);
    console.log(`      置信度: ${(f.confidence * 100).toFixed(0)}%`);
    if (f.code) {
      console.log(`      代码示例:\n${f.code.split('\n').map(l => '      ' + l).join('\n')}`);
    }
  });
}

console.log('\n\n' + '='.repeat(70));
console.log('✅ 自动修复演示完成！');
console.log('='.repeat(70));
console.log('\n💡 提示: 查看 examples/buggy-code/ 目录中的完整 bug 示例');
console.log('📝 运行 "node examples/test-autofix.js" 查看更多修复建议\n');
