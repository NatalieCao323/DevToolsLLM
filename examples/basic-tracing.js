/**
 * Basic Tool Call Tracing Example
 */

const { ToolCallTracer } = require('../src');
const fs = require('fs');

async function main() {
  // Create sample log data
  const sampleCalls = [
    {
      tool: 'search',
      input: { query: 'weather in Tokyo' },
      output: { result: 'Sunny, 25°C' },
      duration: 120,
      status: 'success',
      timestamp: new Date().toISOString()
    },
    {
      tool: 'calculator',
      input: { expression: '2 + 2' },
      output: { result: 4 },
      duration: 5,
      status: 'success',
      timestamp: new Date().toISOString()
    },
    {
      tool: 'weather',
      input: { city: 'Tokyo' },
      error: { message: 'API timeout', type: 'TIMEOUT' },
      duration: 5000,
      status: 'error',
      timestamp: new Date().toISOString()
    }
  ];

  // Save to file
  fs.writeFileSync('sample_log.json', JSON.stringify(sampleCalls, null, 2));

  // Trace the calls
  console.log('Tracing tool calls...\n');
  const trace = await ToolCallTracer.trace('sample_log.json');

  console.log('\n✅ Trace complete!');
  console.log(`Generated: sample_log_trace.json`);
}

main().catch(console.error);
