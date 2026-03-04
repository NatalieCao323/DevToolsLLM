const fs = require('fs');
const path = require('path');
const { ErrorInspector, ToolCallTracer, TraceVisualizer, ParameterValidator } = require('../src');

// Test data
const testDir = __dirname;

async function runTests() {
  console.log('🧪 Running DevToolsLLM Tests\n');
  let passed = 0;
  let failed = 0;

  // Test 1: Error Inspector
  try {
    console.log('Test 1: Error Inspector...');
    const errorLog = path.join(testDir, '../error.log');
    const analysis = await ErrorInspector.inspect(errorLog);
    
    if (analysis.summary && analysis.errors && analysis.suggestions) {
      console.log('✅ Error Inspector works');
      passed++;
    } else {
      throw new Error('Invalid analysis structure');
    }
  } catch (error) {
    console.log('❌ Error Inspector failed:', error.message);
    failed++;
  }

  // Test 2: Tool Call Tracer
  try {
    console.log('Test 2: Tool Call Tracer...');
    const toolLog = path.join(testDir, '../tool_log.json');
    const trace = await ToolCallTracer.trace(toolLog);
    
    if (trace.metadata && trace.calls && trace.chain) {
      console.log('✅ Tool Call Tracer works');
      passed++;
    } else {
      throw new Error('Invalid trace structure');
    }
  } catch (error) {
    console.log('❌ Tool Call Tracer failed:', error.message);
    failed++;
  }

  // Test 3: Trace Visualizer
  try {
    console.log('Test 3: Trace Visualizer...');
    const traceFile = path.join(testDir, '../trace.json');
    await TraceVisualizer.visualize(traceFile);
    console.log('✅ Trace Visualizer works');
    passed++;
  } catch (error) {
    console.log('❌ Trace Visualizer failed:', error.message);
    failed++;
  }

  // Test 4: Parameter Validator
  try {
    console.log('Test 4: Parameter Validator...');
    const validator = new ParameterValidator({
      testTool: {
        required: ['param1'],
        properties: {
          param1: { type: 'string' },
          param2: { type: 'number' }
        }
      }
    });
    
    const validResult = validator.validate({ param1: 'test', param2: 123 }, 'testTool');
    const invalidResult = validator.validate({ param2: 'wrong' }, 'testTool');
    
    if (validResult.valid && !invalidResult.valid) {
      console.log('✅ Parameter Validator works');
      passed++;
    } else {
      throw new Error('Validation logic incorrect');
    }
  } catch (error) {
    console.log('❌ Parameter Validator failed:', error.message);
    failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed\n`);
  
  if (failed === 0) {
    console.log('✅ All tests passed!\n');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed\n');
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});