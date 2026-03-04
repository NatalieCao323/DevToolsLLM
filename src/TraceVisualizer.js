const fs = require('fs');

/**
 * Visualize tool call trace as ASCII tree
 */
async function visualize(traceFile) {
  try {
    const traceData = JSON.parse(fs.readFileSync(traceFile, 'utf-8'));
    
    console.log('\n🌳 Tool Call Chain Visualization\n');
    console.log('='.repeat(60));
    
    if (traceData.chain && traceData.chain.length > 0) {
      // Visualize hierarchical chain
      traceData.chain.forEach((root, index) => {
        if (index > 0) console.log('');
        visualizeNode(root, '', true);
      });
    } else if (traceData.calls && traceData.calls.length > 0) {
      // Visualize flat list
      console.log('\n📋 Call Sequence:\n');
      traceData.calls.forEach((call, index) => {
        const status = call.status === 'success' ? '✅' : '❌';
        const duration = call.duration ? ` (${call.duration}ms)` : '';
        console.log(`${index + 1}. ${status} ${call.tool}${duration}`);
        if (call.error) {
          console.log(`   └─ Error: ${call.error.message || call.error}`);
        }
      });
    } else {
      console.log('\nNo trace data found');
    }
    
    console.log('\n' + '='.repeat(60));
    
    return traceData;
  } catch (error) {
    console.error('Error visualizing trace:', error.message);
    throw error;
  }
}

/**
 * Visualize a single node in the tree
 */
function visualizeNode(node, prefix = '', isLast = true) {
  const connector = isLast ? '└─' : '├─';
  const status = node.status === 'success' ? '✅' : '❌';
  const duration = node.duration ? ` (${node.duration}ms)` : '';
  
  console.log(`${prefix}${connector} ${status} ${node.tool}${duration}`);
  
  if (node.error) {
    const errorPrefix = prefix + (isLast ? '   ' : '│  ');
    console.log(`${errorPrefix}└─ ❌ ${node.error.message || node.error}`);
  }
  
  if (node.children && node.children.length > 0) {
    const childPrefix = prefix + (isLast ? '   ' : '│  ');
    node.children.forEach((child, index) => {
      const isLastChild = index === node.children.length - 1;
      visualizeNode(child, childPrefix, isLastChild);
    });
  }
}

/**
 * Generate timeline visualization
 */
function visualizeTimeline(traceData) {
  if (!traceData.calls || traceData.calls.length === 0) {
    console.log('No calls to visualize');
    return;
  }
  
  console.log('\n⏱️  Timeline:\n');
  
  const calls = traceData.calls.filter(c => c.timestamp);
  if (calls.length === 0) {
    console.log('No timestamp data available');
    return;
  }
  
  // Sort by timestamp
  calls.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  const startTime = new Date(calls[0].timestamp);
  
  calls.forEach(call => {
    const timestamp = new Date(call.timestamp);
    const offset = timestamp - startTime;
    const status = call.status === 'success' ? '✅' : '❌';
    const duration = call.duration ? ` [${call.duration}ms]` : '';
    
    console.log(`+${offset}ms ${status} ${call.tool}${duration}`);
  });
}

/**
 * Generate performance heatmap
 */
function visualizePerformance(traceData) {
  if (!traceData.calls || traceData.calls.length === 0) {
    console.log('No calls to analyze');
    return;
  }
  
  console.log('\n🔥 Performance Heatmap:\n');
  
  const callsWithDuration = traceData.calls.filter(c => c.duration);
  if (callsWithDuration.length === 0) {
    console.log('No duration data available');
    return;
  }
  
  // Group by tool
  const toolPerformance = {};
  callsWithDuration.forEach(call => {
    if (!toolPerformance[call.tool]) {
      toolPerformance[call.tool] = {
        calls: [],
        total: 0,
        min: Infinity,
        max: 0
      };
    }
    const perf = toolPerformance[call.tool];
    perf.calls.push(call.duration);
    perf.total += call.duration;
    perf.min = Math.min(perf.min, call.duration);
    perf.max = Math.max(perf.max, call.duration);
  });
  
  // Calculate averages and display
  Object.entries(toolPerformance)
    .sort((a, b) => b[1].total - a[1].total)
    .forEach(([tool, perf]) => {
      const avg = Math.round(perf.total / perf.calls.length);
      const bar = generateBar(avg, 1000, 30);
      console.log(`${tool.padEnd(20)} ${bar} ${avg}ms (min: ${perf.min}ms, max: ${perf.max}ms)`);
    });
}

/**
 * Generate ASCII bar for visualization
 */
function generateBar(value, maxValue, maxLength) {
  const length = Math.min(Math.round((value / maxValue) * maxLength), maxLength);
  const filled = '█'.repeat(length);
  const empty = '░'.repeat(maxLength - length);
  return filled + empty;
}

module.exports = {
  visualize,
  visualizeTimeline,
  visualizePerformance
};
