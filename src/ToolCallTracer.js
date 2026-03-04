const fs = require('fs');
const path = require('path');

/**
 * Trace tool calls from log file
 */
async function trace(logFile) {
  try {
    const logData = fs.readFileSync(logFile, 'utf-8');
    const traceData = createTrace(logData);
    
    // Generate output filename
    const outputFile = logFile.replace(/\.[^.]+$/, '_trace.json');
    fs.writeFileSync(outputFile, JSON.stringify(traceData, null, 2));
    
    console.log('\n🔗 Tool Call Trace Generated\n');
    console.log('=' .repeat(60));
    printTraceSummary(traceData);
    console.log('\n📄 Trace file saved to:', outputFile);
    console.log('=' .repeat(60));
    
    return traceData;
  } catch (error) {
    console.error('Error tracing tool calls:', error.message);
    throw error;
  }
}

/**
 * Create trace structure from log data
 */
function createTrace(logData) {
  let calls = [];
  
  try {
    // Try to parse as JSON array
    const parsed = JSON.parse(logData);
    if (Array.isArray(parsed)) {
      calls = parsed.map((call, index) => enrichCall(call, index));
    } else {
      calls = [enrichCall(parsed, 0)];
    }
  } catch (e) {
    // Parse as line-delimited JSON
    const lines = logData.split('\n').filter(line => line.trim());
    calls = lines.map((line, index) => {
      try {
        const call = JSON.parse(line);
        return enrichCall(call, index);
      } catch (err) {
        return {
          id: `call_${index}`,
          index,
          raw: line,
          parseError: err.message,
          timestamp: new Date().toISOString()
        };
      }
    });
  }
  
  // Build call chain
  const chain = buildCallChain(calls);
  
  // Calculate statistics
  const stats = calculateStats(calls);
  
  return {
    metadata: {
      totalCalls: calls.length,
      timestamp: new Date().toISOString(),
      stats
    },
    calls,
    chain
  };
}

/**
 * Enrich call data with additional metadata
 */
function enrichCall(call, index) {
  const enriched = {
    id: call.id || `call_${index}`,
    index,
    tool: call.tool || call.function || call.name || 'unknown',
    input: call.input || call.arguments || call.params || {},
    output: call.output || call.result || null,
    timestamp: call.timestamp || new Date().toISOString(),
    duration: call.duration || null,
    status: call.status || (call.error ? 'error' : 'success'),
    error: call.error || null,
    parentId: call.parentId || null
  };
  
  // Calculate duration if start and end times are available
  if (call.startTime && call.endTime) {
    const start = new Date(call.startTime);
    const end = new Date(call.endTime);
    enriched.duration = end - start;
  }
  
  return enriched;
}

/**
 * Build hierarchical call chain
 */
function buildCallChain(calls) {
  const callMap = new Map();
  const rootCalls = [];
  
  // First pass: create map
  calls.forEach(call => {
    callMap.set(call.id, { ...call, children: [] });
  });
  
  // Second pass: build hierarchy
  calls.forEach(call => {
    const node = callMap.get(call.id);
    if (call.parentId && callMap.has(call.parentId)) {
      const parent = callMap.get(call.parentId);
      parent.children.push(node);
    } else {
      rootCalls.push(node);
    }
  });
  
  return rootCalls;
}

/**
 * Calculate statistics from calls
 */
function calculateStats(calls) {
  const stats = {
    totalCalls: calls.length,
    successfulCalls: 0,
    failedCalls: 0,
    averageDuration: 0,
    toolUsage: {},
    errorTypes: {}
  };
  
  let totalDuration = 0;
  let callsWithDuration = 0;
  
  calls.forEach(call => {
    // Status counts
    if (call.status === 'success') {
      stats.successfulCalls++;
    } else if (call.status === 'error') {
      stats.failedCalls++;
    }
    
    // Duration
    if (call.duration) {
      totalDuration += call.duration;
      callsWithDuration++;
    }
    
    // Tool usage
    stats.toolUsage[call.tool] = (stats.toolUsage[call.tool] || 0) + 1;
    
    // Error types
    if (call.error) {
      const errorType = call.error.type || 'unknown';
      stats.errorTypes[errorType] = (stats.errorTypes[errorType] || 0) + 1;
    }
  });
  
  if (callsWithDuration > 0) {
    stats.averageDuration = Math.round(totalDuration / callsWithDuration);
  }
  
  return stats;
}

/**
 * Print trace summary to console
 */
function printTraceSummary(traceData) {
  const { metadata, calls } = traceData;
  
  console.log('\n📊 Summary:');
  console.log(`  Total Calls: ${metadata.totalCalls}`);
  console.log(`  Successful: ${metadata.stats.successfulCalls}`);
  console.log(`  Failed: ${metadata.stats.failedCalls}`);
  
  if (metadata.stats.averageDuration > 0) {
    console.log(`  Average Duration: ${metadata.stats.averageDuration}ms`);
  }
  
  console.log('\n🔧 Tool Usage:');
  Object.entries(metadata.stats.toolUsage)
    .sort((a, b) => b[1] - a[1])
    .forEach(([tool, count]) => {
      console.log(`  ${tool}: ${count}`);
    });
  
  if (Object.keys(metadata.stats.errorTypes).length > 0) {
    console.log('\n❌ Error Types:');
    Object.entries(metadata.stats.errorTypes).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
  }
  
  console.log('\n📝 Recent Calls (last 5):');
  calls.slice(-5).forEach(call => {
    const status = call.status === 'success' ? '✅' : '❌';
    const duration = call.duration ? ` (${call.duration}ms)` : '';
    console.log(`  ${status} ${call.tool}${duration}`);
    if (call.error) {
      console.log(`     Error: ${call.error.message || call.error}`);
    }
  });
}

module.exports = {
  trace,
  createTrace,
  buildCallChain
};