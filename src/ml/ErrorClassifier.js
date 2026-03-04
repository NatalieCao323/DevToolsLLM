/**
 * ML-based Error Classification
 * Uses a simple rule-based classifier with confidence scores
 * In production, this would use a trained ML model (e.g., DistilBERT)
 */

class ErrorClassifier {
  constructor() {
    // Error patterns with weights for classification
    this.patterns = {
      TIMEOUT: {
        keywords: ['timeout', 'timed out', 'ETIMEDOUT', 'exceeded', 'deadline'],
        weight: 1.0
      },
      API_ERROR: {
        keywords: ['API error', 'rate limit', 'quota', '401', '403', '429', '500', '502', '503'],
        weight: 0.9
      },
      NETWORK: {
        keywords: ['network', 'ECONNREFUSED', 'ENOTFOUND', 'socket', 'connection'],
        weight: 0.95
      },
      INVALID_PARAMS: {
        keywords: ['invalid parameter', 'invalid argument', 'validation failed', 'required'],
        weight: 0.85
      },
      PARSE_ERROR: {
        keywords: ['parse', 'JSON.parse', 'unexpected token', 'syntax error'],
        weight: 0.9
      },
      TOOL_NOT_FOUND: {
        keywords: ['not found', 'undefined function', 'missing tool', 'unknown tool'],
        weight: 1.0
      },
      SCHEMA_MISMATCH: {
        keywords: ['schema', 'type mismatch', 'expected', 'got', 'type error'],
        weight: 0.8
      }
    };
  }

  /**
   * Classify error with confidence score
   * @param {string} errorMessage - The error message to classify
   * @returns {Object} Classification result with type and confidence
   */
  classify(errorMessage) {
    const message = errorMessage.toLowerCase();
    const scores = {};

    // Calculate scores for each error type
    for (const [type, config] of Object.entries(this.patterns)) {
      let score = 0;
      let matchCount = 0;

      for (const keyword of config.keywords) {
        if (message.includes(keyword.toLowerCase())) {
          matchCount++;
          score += config.weight;
        }
      }

      if (matchCount > 0) {
        // Normalize score based on number of matches
        scores[type] = (score / config.keywords.length) * (1 + Math.log(matchCount + 1));
      }
    }

    // Find the type with highest score
    let bestType = 'UNKNOWN';
    let bestScore = 0;

    for (const [type, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score;
        bestType = type;
      }
    }

    // Calculate confidence (0-1 scale)
    const confidence = Math.min(bestScore / 2, 1.0);

    return {
      type: bestType,
      confidence: confidence,
      subtype: this.detectSubtype(message, bestType),
      allScores: scores
    };
  }

  /**
   * Detect error subtype for more specific classification
   */
  detectSubtype(message, mainType) {
    const subtypes = {
      API_ERROR: {
        'rate limit': 'RATE_LIMIT',
        'quota': 'QUOTA_EXCEEDED',
        '401': 'UNAUTHORIZED',
        '403': 'FORBIDDEN',
        '429': 'TOO_MANY_REQUESTS',
        '500': 'INTERNAL_SERVER_ERROR',
        '502': 'BAD_GATEWAY',
        '503': 'SERVICE_UNAVAILABLE'
      },
      NETWORK: {
        'ECONNREFUSED': 'CONNECTION_REFUSED',
        'ENOTFOUND': 'HOST_NOT_FOUND',
        'socket hang up': 'SOCKET_HANGUP'
      },
      TIMEOUT: {
        'read timeout': 'READ_TIMEOUT',
        'connect timeout': 'CONNECT_TIMEOUT'
      }
    };

    if (subtypes[mainType]) {
      for (const [keyword, subtype] of Object.entries(subtypes[mainType])) {
        if (message.includes(keyword.toLowerCase())) {
          return subtype;
        }
      }
    }

    return null;
  }

  /**
   * Batch classify multiple errors
   */
  classifyBatch(errors) {
    return errors.map(error => ({
      ...error,
      mlClassification: this.classify(error.message)
    }));
  }
}

module.exports = ErrorClassifier;
