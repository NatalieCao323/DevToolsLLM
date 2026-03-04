#!/usr/bin/env node

/**
 * DevToolsLLM CLI
 * Command-line interface for LLM tool debugging
 */

const fs = require('fs');
const path = require('path');

const ErrorInspector = require('../src/ErrorInspector');
const ToolCallTracer = require('../src/ToolCallTracer');
const TraceVisualizer = require('../src/TraceVisualizer');
const RealtimeMonitor = require('../src/RealtimeMonitor');

const command = process.argv[2];
const file = process.argv[3];

function showHelp() {
  console.log(`
DevToolsLLM - Debugging tools for LLM applications

Usage:
  devtools <command> [options]

Commands:
  trace <file>        Generate trace from tool call log
  inspect <file>      Analyze errors in log file
  visualize <file>    Visualize tool call chain
  monitor [port]      Start real-time monitoring server
  validate <file>     Validate tool call parameters
  help                Show this help message

Examples:
  devtools trace tool_log.json
  devtools inspect error.log
  devtools visualize trace.json
  devtools monitor 3000
  `);
}

async function main() {
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    return;
  }

  try {
    switch (command) {
      case 'trace':
        if (!file) {
          console.error('Error: Please provide a log file');
          console.log('Usage: devtools trace <file>');
          process.exit(1);
        }
        await ToolCallTracer.trace(file);
        break;

      case 'inspect':
        if (!file) {
          console.error('Error: Please provide a log file');
          console.log('Usage: devtools inspect <file>');
          process.exit(1);
        }
        await ErrorInspector.inspect(file);
        break;

      case 'visualize':
        if (!file) {
          console.error('Error: Please provide a trace file');
          console.log('Usage: devtools visualize <file>');
          process.exit(1);
        }
        await TraceVisualizer.visualize(file);
        break;

      case 'monitor':
        const port = file || 3000;
        await RealtimeMonitor.start(port);
        break;

      case 'validate':
        if (!file) {
          console.error('Error: Please provide a schema file');
          console.log('Usage: devtools validate <file>');
          process.exit(1);
        }
        const validator = require('../src/ParameterValidator');
        await validator.validate(file);
        break;

      default:
        console.error(`Unknown command: ${command}`);
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
