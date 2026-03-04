class CostOptimizer {
  constructor(options = {}) {
    this.pricingData = this._initializePricing();
    this.optimizationThreshold = options.threshold || 0.2; // 20% potential savings
    this.trackingEnabled = options.trackingEnabled !== false;
    this.costHistory = [];
  }

  _initializePricing() {
    return {
      'gpt-4': {
        input: 0.03 / 1000,    // per token
        output: 0.06 / 1000
      },
      'gpt-4-turbo': {
        input: 0.01 / 1000,
        output: 0.03 / 1000
      },
      'gpt-3.5-turbo': {
        input: 0.0005 / 1000,
        output: 0.0015 / 1000
      },
      'claude-3-opus': {
        input: 0.015 / 1000,
        output: 0.075 / 1000
      },
      'claude-3-sonnet': {
        input: 0.003 / 1000,
        output: 0.015 / 1000
      },
      'claude-3-haiku': {
        input: 0.00025 / 1000,
        output: 0.00125 / 1000
      }
    };
  }

  analyzeCosts(toolCalls, timeRange = '24h') {
    const analysis = {
      totalCost: 0,
      costByTool: {},
      costByModel: {},
      tokenUsage: { input: 0, output: 0 },
      callCount: toolCalls.length,
      timeRange,
      optimizationOpportunities: []
    };

    toolCalls.forEach(call => {
      const cost = this._calculateCallCost(call);
      analysis.totalCost += cost;

      const toolName = call.name || 'unknown';
      analysis.costByTool[toolName] = (analysis.costByTool[toolName] || 0) + cost;

      if (call.model) {
        analysis.costByModel[call.model] = (analysis.costByModel[call.model] || 0) + cost;
      }

      if (call.tokens) {
        analysis.tokenUsage.input += call.tokens.input || 0;
        analysis.tokenUsage.output += call.tokens.output || 0;
      }
    });

    analysis.optimizationOpportunities = this._findOptimizations(toolCalls, analysis);
    analysis.potentialSavings = this._calculatePotentialSavings(analysis.optimizationOpportunities);
    analysis.recommendations = this._generateRecommendations(analysis);

    if (this.trackingEnabled) {
      this.costHistory.push({
        timestamp: Date.now(),
        ...analysis
      });
    }

    return analysis;
  }

  _calculateCallCost(call) {
    if (!call.model || !call.tokens) {
      return 0;
    }

    const pricing = this.pricingData[call.model];
    if (!pricing) {
      return 0;
    }

    const inputCost = (call.tokens.input || 0) * pricing.input;
    const outputCost = (call.tokens.output || 0) * pricing.output;

    return inputCost + outputCost;
  }

  _findOptimizations(toolCalls, analysis) {
    const opportunities = [];

    opportunities.push(...this._findModelDowngradeOpportunities(toolCalls));
    opportunities.push(...this._findCachingOpportunities(toolCalls));
    opportunities.push(...this._findBatchingOpportunities(toolCalls));
    opportunities.push(...this._findPromptOptimizationOpportunities(toolCalls));
    opportunities.push(...this._findRedundantCallOpportunities(toolCalls));

    return opportunities.sort((a, b) => b.potentialSavings - a.potentialSavings);
  }

  _findModelDowngradeOpportunities(toolCalls) {
    const opportunities = [];
    const modelTiers = {
      'gpt-4': ['gpt-4-turbo', 'gpt-3.5-turbo'],
      'gpt-4-turbo': ['gpt-3.5-turbo'],
      'claude-3-opus': ['claude-3-sonnet', 'claude-3-haiku'],
      'claude-3-sonnet': ['claude-3-haiku']
    };

    const callsByModel = {};
    toolCalls.forEach(call => {
      if (call.model) {
        if (!callsByModel[call.model]) callsByModel[call.model] = [];
        callsByModel[call.model].push(call);
      }
    });

    Object.entries(callsByModel).forEach(([model, calls]) => {
      const alternatives = modelTiers[model];
      if (!alternatives) return;

      const simpleCalls = calls.filter(call => 
        this._isSimpleTask(call) && call.success
      );

      if (simpleCalls.length > 0) {
        const currentCost = simpleCalls.reduce((sum, call) => 
          sum + this._calculateCallCost(call), 0
        );

        alternatives.forEach(altModel => {
          const estimatedCost = simpleCalls.reduce((sum, call) => {
            const altCall = { ...call, model: altModel };
            return sum + this._calculateCallCost(altCall);
          }, 0);

          const savings = currentCost - estimatedCost;
          if (savings > 0) {
            opportunities.push({
              type: 'model_downgrade',
              title: `Switch simple tasks from ${model} to ${altModel}`,
              description: `${simpleCalls.length} calls could use a cheaper model`,
              currentCost,
              estimatedCost,
              potentialSavings: savings,
              savingsPercentage: (savings / currentCost) * 100,
              effort: 'low',
              risk: 'low',
              affectedCalls: simpleCalls.length
            });
          }
        });
      }
    });

    return opportunities;
  }

  _findCachingOpportunities(toolCalls) {
    const opportunities = [];
    const callSignatures = new Map();

    toolCalls.forEach(call => {
      const signature = this._generateCallSignature(call);
      if (!callSignatures.has(signature)) {
        callSignatures.set(signature, []);
      }
      callSignatures.get(signature).push(call);
    });

    callSignatures.forEach((calls, signature) => {
      if (calls.length > 1) {
        const totalCost = calls.reduce((sum, call) => 
          sum + this._calculateCallCost(call), 0
        );
        const cacheCost = this._calculateCallCost(calls[0]);
        const savings = totalCost - cacheCost;

        opportunities.push({
          type: 'caching',
          title: `Cache repeated calls`,
          description: `${calls.length} identical calls detected`,
          currentCost: totalCost,
          estimatedCost: cacheCost,
          potentialSavings: savings,
          savingsPercentage: (savings / totalCost) * 100,
          effort: 'medium',
          risk: 'low',
          affectedCalls: calls.length,
          implementation: 'Add response caching with TTL'
        });
      }
    });

    return opportunities;
  }

  _findBatchingOpportunities(toolCalls) {
    const opportunities = [];
    const timeWindow = 1000; // 1 second
    const batchableTools = new Map();

    toolCalls.forEach(call => {
      const key = call.name;
      if (!batchableTools.has(key)) {
        batchableTools.set(key, []);
      }
      batchableTools.get(key).push(call);
    });

    batchableTools.forEach((calls, toolName) => {
      const batches = this._groupByTimeWindow(calls, timeWindow);
      const batchableBatches = batches.filter(b => b.length > 1);

      if (batchableBatches.length > 0) {
        const totalCalls = batchableBatches.reduce((sum, b) => sum + b.length, 0);
        const currentCost = batchableBatches.flat().reduce((sum, call) => 
          sum + this._calculateCallCost(call), 0
        );
        const estimatedCost = currentCost * 0.7; // 30% savings from batching
        const savings = currentCost - estimatedCost;

        opportunities.push({
          type: 'batching',
          title: `Batch ${toolName} calls`,
          description: `${totalCalls} calls could be batched`,
          currentCost,
          estimatedCost,
          potentialSavings: savings,
          savingsPercentage: (savings / currentCost) * 100,
          effort: 'high',
          risk: 'medium',
          affectedCalls: totalCalls,
          implementation: 'Implement request batching with debounce'
        });
      }
    });

    return opportunities;
  }

  _findPromptOptimizationOpportunities(toolCalls) {
    const opportunities = [];
    
    const verboseCalls = toolCalls.filter(call => {
      if (!call.tokens || !call.tokens.input) return false;
      return call.tokens.input > 1000; // Threshold for verbose prompts
    });

    if (verboseCalls.length > 0) {
      const currentCost = verboseCalls.reduce((sum, call) => 
        sum + this._calculateCallCost(call), 0
      );
      const estimatedCost = currentCost * 0.6; // 40% reduction from optimization
      const savings = currentCost - estimatedCost;

      opportunities.push({
        type: 'prompt_optimization',
        title: 'Optimize verbose prompts',
        description: `${verboseCalls.length} calls with large input tokens`,
        currentCost,
        estimatedCost,
        potentialSavings: savings,
        savingsPercentage: (savings / currentCost) * 100,
        effort: 'medium',
        risk: 'medium',
        affectedCalls: verboseCalls.length,
        implementation: 'Reduce prompt length, use concise instructions'
      });
    }

    return opportunities;
  }

  _findRedundantCallOpportunities(toolCalls) {
    const opportunities = [];
    const failedCalls = toolCalls.filter(call => !call.success);
    
    const retriedCalls = failedCalls.filter(call => {
      const retries = toolCalls.filter(c => 
        c.name === call.name && 
        c.timestamp > call.timestamp &&
        c.timestamp - call.timestamp < 5000
      );
      return retries.length > 0;
    });

    if (retriedCalls.length > 0) {
      const wastedCost = retriedCalls.reduce((sum, call) => 
        sum + this._calculateCallCost(call), 0
      );

      opportunities.push({
        type: 'redundant_calls',
        title: 'Reduce failed call retries',
        description: `${retriedCalls.length} failed calls that were retried`,
        currentCost: wastedCost,
        estimatedCost: 0,
        potentialSavings: wastedCost,
        savingsPercentage: 100,
        effort: 'low',
        risk: 'low',
        affectedCalls: retriedCalls.length,
        implementation: 'Add exponential backoff and circuit breaker'
      });
    }

    return opportunities;
  }

  _calculatePotentialSavings(opportunities) {
    return opportunities.reduce((sum, opp) => sum + opp.potentialSavings, 0);
  }

  _generateRecommendations(analysis) {
    const recommendations = [];

    if (analysis.potentialSavings > analysis.totalCost * this.optimizationThreshold) {
      recommendations.push({
        priority: 'high',
        title: 'Significant cost optimization potential detected',
        description: `You could save $${analysis.potentialSavings.toFixed(4)} (${((analysis.potentialSavings / analysis.totalCost) * 100).toFixed(1)}%)`,
        action: 'Review optimization opportunities'
      });
    }

    const topCostTool = Object.entries(analysis.costByTool)
      .sort((a, b) => b[1] - a[1])[0];
    
    if (topCostTool && topCostTool[1] > analysis.totalCost * 0.5) {
      recommendations.push({
        priority: 'medium',
        title: `Tool "${topCostTool[0]}" accounts for ${((topCostTool[1] / analysis.totalCost) * 100).toFixed(1)}% of costs`,
        description: 'Consider optimizing this tool or finding alternatives',
        action: 'Analyze tool usage patterns'
      });
    }

    if (analysis.tokenUsage.output > analysis.tokenUsage.input * 2) {
      recommendations.push({
        priority: 'medium',
        title: 'High output token usage detected',
        description: 'Consider limiting response length or using streaming',
        action: 'Add max_tokens parameter to reduce output'
      });
    }

    return recommendations;
  }

  _isSimpleTask(call) {
    if (!call.tokens) return false;
    return call.tokens.input < 500 && call.tokens.output < 200;
  }

  _generateCallSignature(call) {
    return JSON.stringify({
      name: call.name,
      params: call.parameters
    });
  }

  _groupByTimeWindow(calls, windowMs) {
    const sorted = [...calls].sort((a, b) => a.timestamp - b.timestamp);
    const batches = [];
    let currentBatch = [];

    sorted.forEach(call => {
      if (currentBatch.length === 0) {
        currentBatch.push(call);
      } else {
        const lastCall = currentBatch[currentBatch.length - 1];
        if (call.timestamp - lastCall.timestamp <= windowMs) {
          currentBatch.push(call);
        } else {
          batches.push(currentBatch);
          currentBatch = [call];
        }
      }
    });

    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }

    return batches;
  }

  getCostTrends(days = 7) {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const trends = [];

    for (let i = 0; i < days; i++) {
      const dayStart = now - (i + 1) * dayMs;
      const dayEnd = now - i * dayMs;
      
      const dayCosts = this.costHistory.filter(entry => 
        entry.timestamp >= dayStart && entry.timestamp < dayEnd
      );

      const totalCost = dayCosts.reduce((sum, entry) => sum + entry.totalCost, 0);
      
      trends.unshift({
        date: new Date(dayStart).toISOString().split('T')[0],
        cost: totalCost,
        callCount: dayCosts.reduce((sum, entry) => sum + entry.callCount, 0)
      });
    }

    return trends;
  }

  exportReport(analysis) {
    return {
      summary: {
        totalCost: `$${analysis.totalCost.toFixed(4)}`,
        potentialSavings: `$${analysis.potentialSavings.toFixed(4)}`,
        savingsPercentage: `${((analysis.potentialSavings / analysis.totalCost) * 100).toFixed(1)}%`,
        callCount: analysis.callCount
      },
      breakdown: {
        byTool: analysis.costByTool,
        byModel: analysis.costByModel
      },
      opportunities: analysis.optimizationOpportunities,
      recommendations: analysis.recommendations,
      generatedAt: new Date().toISOString()
    };
  }
}

module.exports = CostOptimizer;
