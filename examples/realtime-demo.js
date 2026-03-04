#!/usr/bin/env node

/**
 * 实时 Web UI 演示
 * 启动 WebSocket 服务器并模拟真实的工具调用
 */

const RealtimeMonitor = require('../src/RealtimeMonitor');
const AutoFixSuggester = require('../src/AutoFixSuggester');
const CostOptimizer = require('../src/CostOptimizer');

console.log('🚀 启动 DevToolsLLM 实时演示...\n');

// 创建监控器
const monitor = new RealtimeMonitor(3000);

// 启动服务器
monitor.start().then(() => {
  console.log('\n✅ 服务器已启动！');
  console.log('\n📱 打开浏览器访问: http://localhost:3000');
  console.log('   或运行前端: npm run dev:frontend\n');
  
  // 模拟真实的工具调用
  startSimulation();
});

function startSimulation() {
  console.log('🎬 开始模拟工具调用...\n');
  
  const tools = ['search', 'analyze', 'summarize', 'translate', 'classify'];
  const models = ['gpt-4', 'gpt-3.5-turbo', 'claude-2'];
  
  let callCount = 0;
  
  // 每 2-5 秒发送一个工具调用
  function sendRandomCall() {
    const tool = tools[Math.floor(Math.random() * tools.length)];
    const model = models[Math.floor(Math.random() * models.length)];
    const success = Math.random() > 0.15; // 85% 成功率
    const duration = success 
      ? Math.floor(Math.random() * 3000) + 500 
      : Math.floor(Math.random() * 10000) + 5000;
    
    const call = {
      id: `call-${++callCount}`,
      tool: tool,
      model: model,
      status: success ? 'success' : 'error',
      duration: duration,
      timestamp: new Date().toISOString(),
      input: { query: `Sample query ${callCount}` },
      output: success ? { result: 'Success' } : null,
      error: success ? null : {
        message: getRandomError(),
        code: getRandomErrorCode()
      },
      tokens: Math.floor(Math.random() * 2000) + 100
    };
    
    // 发送到所有连接的客户端
    monitor.recordCall(call);
    
    // 控制台输出
    const statusIcon = success ? '✅' : '❌';
    console.log(`${statusIcon} [${callCount}] ${tool} (${model}) - ${duration}ms`);
    
    // 如果失败，显示错误
    if (!success) {
      console.log(`   错误: ${call.error.message}`);
      
      // 生成修复建议
      const fixer = new AutoFixSuggester();
      const fix = fixer.suggestFix(call.error, call, []);
      if (fix && fix.fixes && fix.fixes.length > 0) {
        console.log(`   💡 建议: ${fix.fixes[0].title}`);
      }
    }
    
    // 每 10 次调用显示成本分析
    if (callCount % 10 === 0) {
      const optimizer = new CostOptimizer();
      const recentCalls = monitor.getRecentCalls(10);
      const analysis = optimizer.analyzeCosts(recentCalls);
      console.log(`\n💰 成本分析 (最近 10 次调用):`);
      console.log(`   总成本: $${analysis.totalCost.toFixed(4)}`);
      if (analysis.potentialSavings > 0) {
        console.log(`   可节省: $${analysis.potentialSavings.toFixed(4)}`);
      }
      console.log('');
    }
    
    // 随机间隔 2-5 秒
    const nextDelay = Math.floor(Math.random() * 3000) + 2000;
    setTimeout(sendRandomCall, nextDelay);
  }
  
  // 开始发送
  setTimeout(sendRandomCall, 1000);
}

function getRandomError() {
  const errors = [
    'Request timeout after 30000ms',
    'Rate limit exceeded. Please retry after 60 seconds',
    'Invalid API key provided',
    'Connection refused',
    'Maximum retries exceeded',
    'Out of memory',
    'Parse error: Invalid JSON',
    'Network error: ECONNRESET'
  ];
  return errors[Math.floor(Math.random() * errors.length)];
}

function getRandomErrorCode() {
  const codes = [
    'TIMEOUT',
    'RATE_LIMIT',
    'AUTH_ERROR',
    'NETWORK_ERROR',
    'PARSE_ERROR',
    'MEMORY_ERROR'
  ];
  return codes[Math.floor(Math.random() * codes.length)];
}

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n\n👋 停止演示...');
  console.log(`📊 总共处理了 ${callCount} 次调用`);
  process.exit(0);
});
