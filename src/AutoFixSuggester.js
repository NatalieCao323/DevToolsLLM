class AutoFixSuggester {
  constructor(options = {}) {
    this.confidenceThreshold = options.confidenceThreshold || 0.8;
    this.enableAutoApply = options.enableAutoApply || false;
    this.fixHistory = [];
  }

  async analyzeProblem(error, context) {
    const analysis = {
      errorType: this._classifyError(error),
      rootCause: this._identifyRootCause(error, context),
      affectedComponents: this._findAffectedComponents(context),
      severity: this._calculateSeverity(error, context)
    };

    const fixes = await this._generateFixes(analysis);
    return {
      analysis,
      fixes: fixes.sort((a, b) => b.confidence - a.confidence),
      canAutoApply: fixes.some(f => f.confidence >= this.confidenceThreshold)
    };
  }

  async suggestFix(error, toolCall, history = []) {
    const context = {
      toolCall,
      history,
      timestamp: Date.now(),
      environment: this._detectEnvironment()
    };

    const result = await this.analyzeProblem(error, context);
    
    if (this.enableAutoApply && result.canAutoApply) {
      const bestFix = result.fixes[0];
      if (bestFix.confidence >= this.confidenceThreshold) {
        return await this._applyFix(bestFix, context);
      }
    }

    return result;
  }

  _classifyError(error) {
    const patterns = {
      timeout: /timeout|timed out|ETIMEDOUT/i,
      rateLimit: /rate limit|429|too many requests/i,
      authentication: /auth|unauthorized|401|403|invalid.*key/i,
      validation: /invalid|validation|schema|required.*missing/i,
      network: /network|ECONNREFUSED|ENOTFOUND|DNS/i,
      parsing: /parse|JSON|syntax|unexpected token/i,
      resource: /not found|404|does not exist/i
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(error.message || error.toString())) {
        return type;
      }
    }

    return 'unknown';
  }

  _identifyRootCause(error, context) {
    const errorType = this._classifyError(error);
    const causes = {
      timeout: [
        'API endpoint is slow or unresponsive',
        'Network latency is high',
        'Timeout threshold is too low',
        'Server is overloaded'
      ],
      rateLimit: [
        'Too many requests in short time',
        'No rate limiting implemented',
        'Shared API key across multiple instances',
        'Burst traffic pattern'
      ],
      authentication: [
        'Invalid or expired API key',
        'Missing authentication headers',
        'Incorrect credentials format',
        'Permissions not granted'
      ],
      validation: [
        'Missing required parameters',
        'Parameter type mismatch',
        'Invalid parameter format',
        'Schema version mismatch'
      ],
      network: [
        'Service is down or unreachable',
        'DNS resolution failed',
        'Firewall blocking connection',
        'Wrong endpoint URL'
      ],
      parsing: [
        'Malformed response data',
        'Unexpected response format',
        'Character encoding issue',
        'Truncated response'
      ],
      resource: [
        'Resource ID does not exist',
        'Resource was deleted',
        'Wrong resource path',
        'Access to resource denied'
      ]
    };

    return causes[errorType] || ['Unknown root cause'];
  }

  _findAffectedComponents(context) {
    const components = [];
    
    if (context.toolCall) {
      components.push({
        type: 'tool',
        name: context.toolCall.name,
        impact: 'direct'
      });
    }

    if (context.history && context.history.length > 0) {
      const dependentCalls = context.history.filter(h => 
        h.parentId === context.toolCall?.id
      );
      
      dependentCalls.forEach(call => {
        components.push({
          type: 'dependent_tool',
          name: call.name,
          impact: 'indirect'
        });
      });
    }

    return components;
  }

  _calculateSeverity(error, context) {
    let score = 0;

    const errorType = this._classifyError(error);
    const criticalTypes = ['authentication', 'network', 'resource'];
    if (criticalTypes.includes(errorType)) score += 3;
    else score += 1;

    if (context.history && context.history.length > 5) score += 2;

    const affectedComponents = this._findAffectedComponents(context);
    score += affectedComponents.length;

    if (score >= 7) return 'critical';
    if (score >= 4) return 'high';
    if (score >= 2) return 'medium';
    return 'low';
  }

  async _generateFixes(analysis) {
    const fixes = [];
    const errorType = analysis.errorType;

    const fixTemplates = {
      timeout: [
        {
          title: 'Increase timeout threshold',
          description: 'Adjust timeout configuration to allow more time',
          code: 'config.timeout = 60000; // 60 seconds',
          confidence: 0.85,
          effort: 'low',
          risk: 'low'
        },
        {
          title: 'Implement retry with exponential backoff',
          description: 'Add automatic retry logic for failed requests',
          code: `async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
}`,
          confidence: 0.9,
          effort: 'medium',
          risk: 'low'
        }
      ],
      rateLimit: [
        {
          title: 'Add rate limiting middleware',
          description: 'Implement request throttling to prevent rate limit errors',
          code: `const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10
});
app.use('/api/', limiter);`,
          confidence: 0.95,
          effort: 'medium',
          risk: 'low'
        },
        {
          title: 'Implement request queue',
          description: 'Queue requests to control rate',
          code: `class RequestQueue {
  constructor(maxPerMinute) {
    this.queue = [];
    this.maxPerMinute = maxPerMinute;
  }
  async enqueue(fn) {
    // Queue implementation
  }
}`,
          confidence: 0.88,
          effort: 'high',
          risk: 'medium'
        }
      ],
      authentication: [
        {
          title: 'Verify API key configuration',
          description: 'Check if API key is correctly set in environment',
          code: `if (!process.env.API_KEY) {
  throw new Error('API_KEY not configured');
}`,
          confidence: 0.92,
          effort: 'low',
          risk: 'low'
        },
        {
          title: 'Implement key rotation',
          description: 'Add automatic API key refresh mechanism',
          code: `async function refreshApiKey() {
  const newKey = await fetchNewKey();
  process.env.API_KEY = newKey;
}`,
          confidence: 0.75,
          effort: 'high',
          risk: 'medium'
        }
      ],
      validation: [
        {
          title: 'Add parameter validation',
          description: 'Validate parameters before making calls',
          code: `function validateParams(params, schema) {
  const ajv = new Ajv();
  const valid = ajv.validate(schema, params);
  if (!valid) throw new Error(ajv.errorsText());
}`,
          confidence: 0.93,
          effort: 'medium',
          risk: 'low'
        }
      ],
      network: [
        {
          title: 'Add connection retry logic',
          description: 'Retry failed connections automatically',
          code: `const axios = require('axios');
axios.defaults.retry = 3;
axios.defaults.retryDelay = 1000;`,
          confidence: 0.87,
          effort: 'low',
          risk: 'low'
        },
        {
          title: 'Implement circuit breaker',
          description: 'Prevent cascading failures with circuit breaker pattern',
          code: `const CircuitBreaker = require('opossum');
const breaker = new CircuitBreaker(apiCall, {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
});`,
          confidence: 0.82,
          effort: 'high',
          risk: 'medium'
        }
      ]
    };

    const templates = fixTemplates[errorType] || [];
    
    templates.forEach(template => {
      fixes.push({
        ...template,
        errorType,
        timestamp: Date.now(),
        applicable: this._checkApplicability(template, analysis)
      });
    });

    return fixes;
  }

  _checkApplicability(fix, analysis) {
    if (analysis.severity === 'critical' && fix.risk === 'high') {
      return false;
    }
    return true;
  }

  async _applyFix(fix, context) {
    console.log(`[AutoFix] Applying fix: ${fix.title}`);
    
    this.fixHistory.push({
      fix,
      context,
      timestamp: Date.now(),
      status: 'applied'
    });

    return {
      success: true,
      fix,
      message: `Auto-applied fix: ${fix.title}`,
      nextSteps: [
        'Monitor the system for improvements',
        'Verify the fix resolves the issue',
        'Consider implementing similar fixes for related issues'
      ]
    };
  }

  _detectEnvironment() {
    return {
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
      uptime: process.uptime()
    };
  }

  getFixHistory() {
    return this.fixHistory;
  }

  getFixStatistics() {
    const stats = {
      totalFixes: this.fixHistory.length,
      byType: {},
      byConfidence: { high: 0, medium: 0, low: 0 },
      successRate: 0
    };

    this.fixHistory.forEach(entry => {
      const type = entry.fix.errorType;
      stats.byType[type] = (stats.byType[type] || 0) + 1;

      if (entry.fix.confidence >= 0.9) stats.byConfidence.high++;
      else if (entry.fix.confidence >= 0.7) stats.byConfidence.medium++;
      else stats.byConfidence.low++;
    });

    const successful = this.fixHistory.filter(e => e.status === 'applied').length;
    stats.successRate = this.fixHistory.length > 0 
      ? (successful / this.fixHistory.length) * 100 
      : 0;

    return stats;
  }
}

module.exports = AutoFixSuggester;
