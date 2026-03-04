const fs = require('fs');

/**
 * Error types and their patterns
 */
const ERROR_PATTERNS = {
  TIMEOUT: /timeout|timed out|ETIMEDOUT/i,
  INVALID_PARAMS: /invalid parameter|invalid argument|validation failed/i,
  API_ERROR: /API error|rate limit|quota exceeded|401|403|429|500|502|503/i,
  NETWORK: /network error|ECONNREFUSED|ENOTFOUND|socket hang up/i,
  PARSE_ERROR: /parse error|JSON\.parse|unexpected token/i,
  TOOL_NOT_FOUND: /tool not found|function not found|undefined function/i,
  SCHEMA_MISMATCH: /schema|type mismatch|expected.*got/i
};

/**
 * Error severity levels
 */
const SEVERITY = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW'
};

/**
 * Inspect and analyze errors from log file
 */
async function inspect(logFile) {
  try {
    const errorData = fs.readFileSync(logFile, 'utf-8');
    const analysis = analyzeErrors(errorData);
    
    printAnalysis(analysis);
    
    // Save detailed report
    const reportPath = logFile.replace(/\.[^.]+$/, '_analysis.json');
    fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    return analysis;
  } catch (error) {
    console.error('Error reading log file:', error.message);
    throw error;
  }
}

/**
 * Analyze error data and categorize errors
 */
function analyzeErrors(errorData) {
  const lines = errorData.split('\n').filter(line => line.trim());
  const errors = [];
  const errorCounts = {};
  const suggestions = [];

  lines.forEach((line, index) => {
    const error = parseErrorLine(line, index + 1);
    if (error) {
      errors.push(error);
      errorCounts[error.type] = (errorCounts[error.type] || 0) + 1;
    }
  });

  // Generate suggestions based on error patterns
  Object.entries(errorCounts).forEach(([type, count]) => {
    const suggestion = generateSuggestion(type, count);
    if (suggestion) {
      suggestions.push(suggestion);
    }
  });

  return {
    summary: {
      totalErrors: errors.length,
      errorTypes: errorCounts,
      criticalCount: errors.filter(e => e.severity === SEVERITY.CRITICAL).length,
      highCount: errors.filter(e => e.severity === SEVERITY.HIGH).length
    },
    errors: errors,
    suggestions: suggestions,
    timestamp: new Date().toISOString()
  };
}

/**
 * Parse a single error line
 */
function parseErrorLine(line, lineNumber) {
  // Check each error pattern
  for (const [type, pattern] of Object.entries(ERROR_PATTERNS)) {
    if (pattern.test(line)) {
      return {
        lineNumber,
        type,
        severity: getSeverity(type),
        message: line.trim(),
        timestamp: extractTimestamp(line)
      };
    }
  }

  // Generic error detection
  if (/error|failed|exception/i.test(line)) {
    return {
      lineNumber,
      type: 'UNKNOWN',
      severity: SEVERITY.MEDIUM,
      message: line.trim(),
      timestamp: extractTimestamp(line)
    };
  }

  return null;
}

/**
 * Determine severity based on error type
 */
function getSeverity(errorType) {
  const severityMap = {
    TIMEOUT: SEVERITY.HIGH,
    INVALID_PARAMS: SEVERITY.MEDIUM,
    API_ERROR: SEVERITY.HIGH,
    NETWORK: SEVERITY.HIGH,
    PARSE_ERROR: SEVERITY.MEDIUM,
    TOOL_NOT_FOUND: SEVERITY.CRITICAL,
    SCHEMA_MISMATCH: SEVERITY.HIGH
  };
  return severityMap[errorType] || SEVERITY.LOW;
}

/**
 * Extract timestamp from log line if present
 */
function extractTimestamp(line) {
  const timestampPattern = /\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/;
  const match = line.match(timestampPattern);
  return match ? match[0] : null;
}

/**
 * Generate debugging suggestions based on error type
 */
function generateSuggestion(errorType, count) {
  const suggestions = {
    TIMEOUT: {
      problem: `${count} timeout error(s) detected`,
      solutions: [
        'Increase timeout threshold in your LLM configuration',
        'Check if the API endpoint is responding slowly',
        'Consider implementing retry logic with exponential backoff',
        'Monitor network latency'
      ]
    },
    INVALID_PARAMS: {
      problem: `${count} invalid parameter error(s) detected`,
      solutions: [
        'Validate tool parameters before calling',
        'Check parameter types match the schema',
        'Review required vs optional parameters',
        'Use TypeScript or JSON Schema for validation'
      ]
    },
    API_ERROR: {
      problem: `${count} API error(s) detected`,
      solutions: [
        'Check API key validity and permissions',
        'Verify rate limits and quota',
        'Implement exponential backoff for retries',
        'Monitor API status page for outages'
      ]
    },
    NETWORK: {
      problem: `${count} network error(s) detected`,
      solutions: [
        'Check internet connectivity',
        'Verify firewall and proxy settings',
        'Test DNS resolution',
        'Implement connection pooling'
      ]
    },
    PARSE_ERROR: {
      problem: `${count} parse error(s) detected`,
      solutions: [
        'Validate JSON structure before parsing',
        'Check for malformed responses',
        'Add error handling for parse failures',
        'Log raw response for debugging'
      ]
    },
    TOOL_NOT_FOUND: {
      problem: `${count} tool not found error(s) - CRITICAL`,
      solutions: [
        'Verify tool is registered in your LLM configuration',
        'Check tool name spelling',
        'Ensure tool definition is loaded before use',
        'Review tool availability in current context'
      ]
    },
    SCHEMA_MISMATCH: {
      problem: `${count} schema mismatch error(s) detected`,
      solutions: [
        'Validate tool schema matches implementation',
        'Check parameter types and required fields',
        'Update schema documentation',
        'Use schema validation library'
      ]
    }
  };

  return suggestions[errorType] || null;
}

/**
 * Print formatted analysis to console
 */
function printAnalysis(analysis) {
  console.log('\n🔍 Error Analysis Report\n');
  console.log('=' .repeat(60));
  
  // Summary
  console.log('\n📊 Summary:');
  console.log(`  Total Errors: ${analysis.summary.totalErrors}`);
  console.log(`  Critical: ${analysis.summary.criticalCount}`);
  console.log(`  High: ${analysis.summary.highCount}`);
  
  // Error types
  console.log('\n📋 Error Types:');
  Object.entries(analysis.summary.errorTypes).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
  
  // Suggestions
  if (analysis.suggestions.length > 0) {
    console.log('\n💡 Debugging Suggestions:\n');
    analysis.suggestions.forEach((suggestion, index) => {
      console.log(`${index + 1}. ${suggestion.problem}`);
      console.log('   Solutions:');
      suggestion.solutions.forEach(solution => {
        console.log(`   - ${solution}`);
      });
      console.log('');
    });
  }
  
  // Recent errors
  if (analysis.errors.length > 0) {
    console.log('\n🚨 Recent Errors (last 5):\n');
    analysis.errors.slice(-5).forEach(error => {
      const severityIcon = {
        CRITICAL: '🔴',
        HIGH: '🟠',
        MEDIUM: '🟡',
        LOW: '🟢'
      }[error.severity];
      console.log(`${severityIcon} [${error.severity}] Line ${error.lineNumber}: ${error.type}`);
      console.log(`   ${error.message.substring(0, 80)}...`);
      console.log('');
    });
  }
  
  console.log('=' .repeat(60));
}

module.exports = {
  inspect,
  analyzeErrors
};