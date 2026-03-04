/**
 * Intelligent Suggestion Generator
 * Generates personalized debugging suggestions based on error patterns
 * In production, this would use GPT or similar LLM for generation
 */

class SuggestionGenerator {
  constructor() {
    // Knowledge base of solutions for different error types
    this.solutionDatabase = {
      TIMEOUT: [
        {
          solution: 'Increase timeout threshold in your LLM configuration',
          confidence: 0.9,
          context: 'general'
        },
        {
          solution: 'Check if the API endpoint is responding slowly',
          confidence: 0.85,
          context: 'api'
        },
        {
          solution: 'Implement retry logic with exponential backoff',
          confidence: 0.8,
          context: 'reliability'
        },
        {
          solution: 'Monitor network latency and consider using a CDN',
          confidence: 0.7,
          context: 'network'
        }
      ],
      API_ERROR: [
        {
          solution: 'Verify API key validity and permissions',
          confidence: 0.95,
          context: 'authentication'
        },
        {
          solution: 'Check rate limits and quota usage',
          confidence: 0.9,
          context: 'rate_limit'
        },
        {
          solution: 'Implement exponential backoff for retries',
          confidence: 0.85,
          context: 'reliability'
        },
        {
          solution: 'Monitor API status page for outages',
          confidence: 0.75,
          context: 'monitoring'
        }
      ],
      INVALID_PARAMS: [
        {
          solution: 'Add parameter validation before tool calls',
          confidence: 0.95,
          context: 'validation'
        },
        {
          solution: 'Check parameter types match the schema',
          confidence: 0.9,
          context: 'types'
        },
        {
          solution: 'Review required vs optional parameters',
          confidence: 0.85,
          context: 'schema'
        },
        {
          solution: 'Use TypeScript or JSON Schema for compile-time validation',
          confidence: 0.8,
          context: 'prevention'
        }
      ],
      NETWORK: [
        {
          solution: 'Check internet connectivity and DNS resolution',
          confidence: 0.9,
          context: 'connectivity'
        },
        {
          solution: 'Verify firewall and proxy settings',
          confidence: 0.85,
          context: 'security'
        },
        {
          solution: 'Implement connection pooling and keep-alive',
          confidence: 0.8,
          context: 'optimization'
        },
        {
          solution: 'Add circuit breaker pattern for failing endpoints',
          confidence: 0.75,
          context: 'reliability'
        }
      ],
      PARSE_ERROR: [
        {
          solution: 'Validate JSON structure before parsing',
          confidence: 0.95,
          context: 'validation'
        },
        {
          solution: 'Check for malformed responses from API',
          confidence: 0.9,
          context: 'api'
        },
        {
          solution: 'Add error handling for parse failures',
          confidence: 0.85,
          context: 'error_handling'
        },
        {
          solution: 'Log raw response for debugging',
          confidence: 0.8,
          context: 'debugging'
        }
      ],
      TOOL_NOT_FOUND: [
        {
          solution: 'Verify tool is registered in your LLM configuration',
          confidence: 0.95,
          context: 'configuration'
        },
        {
          solution: 'Check tool name spelling and case sensitivity',
          confidence: 0.9,
          context: 'naming'
        },
        {
          solution: 'Ensure tool definition is loaded before use',
          confidence: 0.85,
          context: 'initialization'
        },
        {
          solution: 'Review tool availability in current context',
          confidence: 0.8,
          context: 'context'
        }
      ],
      SCHEMA_MISMATCH: [
        {
          solution: 'Update tool schema to match implementation',
          confidence: 0.9,
          context: 'schema'
        },
        {
          solution: 'Check parameter types and required fields',
          confidence: 0.85,
          context: 'types'
        },
        {
          solution: 'Use schema validation library (e.g., Zod, Joi)',
          confidence: 0.8,
          context: 'validation'
        },
        {
          solution: 'Generate TypeScript types from schema',
          confidence: 0.75,
          context: 'types'
        }
      ]
    };

    // Historical success patterns (simulated)
    this.historicalPatterns = new Map();
  }

  /**
   * Generate suggestions for an error
   * @param {Object} error - Error object with type and context
   * @param {Object} options - Additional context for personalization
   * @returns {Array} Array of suggestions with confidence scores
   */
  generateSuggestions(error, options = {}) {
    const errorType = error.type || 'UNKNOWN';
    const subtype = error.subtype;
    const context = options.context || {};

    // Get base suggestions for error type
    let suggestions = this.solutionDatabase[errorType] || [];

    // Filter by subtype if available
    if (subtype) {
      suggestions = this.filterBySubtype(suggestions, subtype);
    }

    // Personalize based on context
    suggestions = this.personalizesuggestions(suggestions, context);

    // Add historical insights
    const historicalSuggestions = this.getHistoricalSuggestions(errorType);
    if (historicalSuggestions.length > 0) {
      suggestions = [...suggestions, ...historicalSuggestions];
    }

    // Sort by confidence
    suggestions.sort((a, b) => b.confidence - a.confidence);

    // Return top 5 suggestions
    return suggestions.slice(0, 5).map((s, index) => ({
      ...s,
      rank: index + 1,
      source: s.source || 'knowledge_base'
    }));
  }

  /**
   * Filter suggestions by error subtype
   */
  filterBySubtype(suggestions, subtype) {
    const subtypeKeywords = {
      RATE_LIMIT: ['rate limit', 'quota', 'backoff'],
      UNAUTHORIZED: ['API key', 'authentication', 'permissions'],
      CONNECTION_REFUSED: ['connectivity', 'firewall', 'port']
    };

    const keywords = subtypeKeywords[subtype];
    if (!keywords) return suggestions;

    return suggestions.filter(s => 
      keywords.some(keyword => s.solution.toLowerCase().includes(keyword))
    );
  }

  /**
   * Personalize suggestions based on user context
   */
  personalizesuggestions(suggestions, context) {
    return suggestions.map(s => {
      let confidence = s.confidence;

      // Boost confidence if context matches
      if (context.framework === 'langchain' && s.context === 'reliability') {
        confidence *= 1.1;
      }

      if (context.environment === 'production' && s.context === 'monitoring') {
        confidence *= 1.15;
      }

      return {
        ...s,
        confidence: Math.min(confidence, 1.0)
      };
    });
  }

  /**
   * Get suggestions based on historical success patterns
   */
  getHistoricalSuggestions(errorType) {
    const pattern = this.historicalPatterns.get(errorType);
    if (!pattern) return [];

    return [{
      solution: `Based on similar cases, ${pattern.solution} reduced errors by ${pattern.improvement}%`,
      confidence: pattern.confidence,
      context: 'historical',
      source: 'historical_data',
      caseCount: pattern.caseCount
    }];
  }

  /**
   * Record a successful resolution
   * This would be used to build the historical patterns database
   */
  recordResolution(errorType, solution, improvement) {
    const existing = this.historicalPatterns.get(errorType);
    
    if (existing) {
      // Update with weighted average
      existing.caseCount++;
      existing.improvement = (existing.improvement + improvement) / 2;
      existing.confidence = Math.min(0.9, existing.confidence + 0.05);
    } else {
      this.historicalPatterns.set(errorType, {
        solution,
        improvement,
        confidence: 0.7,
        caseCount: 1
      });
    }
  }

  /**
   * Generate a detailed explanation for an error
   */
  generateExplanation(error) {
    const errorType = error.type || 'UNKNOWN';
    
    const explanations = {
      TIMEOUT: 'The operation exceeded the maximum allowed time. This usually indicates slow API responses, network issues, or insufficient timeout settings.',
      API_ERROR: 'The API returned an error response. This could be due to authentication issues, rate limiting, or server problems.',
      INVALID_PARAMS: 'The tool was called with invalid parameters. Check that all required parameters are provided and match the expected types.',
      NETWORK: 'A network-level error occurred. This could be due to connectivity issues, DNS problems, or firewall restrictions.',
      PARSE_ERROR: 'Failed to parse the response data. The API may have returned malformed JSON or unexpected data format.',
      TOOL_NOT_FOUND: 'The requested tool could not be found. Verify that the tool is properly registered and the name is correct.',
      SCHEMA_MISMATCH: 'The parameters do not match the tool schema. Check that parameter types and required fields are correct.'
    };

    return explanations[errorType] || 'An unknown error occurred. Review the error message for more details.';
  }

  /**
   * Get similar historical cases
   */
  getSimilarCases(error, limit = 3) {
    // In production, this would query a database of historical errors
    // For now, return simulated data
    return [
      {
        id: 'case_001',
        similarity: 0.92,
        errorType: error.type,
        resolution: 'Increased timeout from 5s to 30s',
        outcome: 'Resolved',
        timestamp: new Date(Date.now() - 86400000 * 7).toISOString()
      },
      {
        id: 'case_002',
        similarity: 0.85,
        errorType: error.type,
        resolution: 'Added retry logic with exponential backoff',
        outcome: 'Resolved',
        timestamp: new Date(Date.now() - 86400000 * 14).toISOString()
      }
    ].slice(0, limit);
  }
}

module.exports = SuggestionGenerator;
