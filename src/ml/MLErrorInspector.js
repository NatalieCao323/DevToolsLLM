/**
 * ML-Enhanced Error Inspector
 * Integrates ML models for improved error analysis
 */

const ErrorClassifier = require('./ErrorClassifier');
const AnomalyDetector = require('./AnomalyDetector');
const SuggestionGenerator = require('./SuggestionGenerator');
const { ErrorInspector } = require('../ErrorInspector');

class MLErrorInspector {
  constructor(options = {}) {
    this.enableML = options.enableML !== false;
    this.classifier = new ErrorClassifier();
    this.anomalyDetector = new AnomalyDetector(options.anomalyOptions);
    this.suggestionGenerator = new SuggestionGenerator();
    this.confidenceThreshold = options.confidenceThreshold || 0.7;
  }

  /**
   * Inspect errors with ML enhancement
   */
  async inspect(logFile) {
    // Get base analysis from traditional ErrorInspector
    const baseAnalysis = await ErrorInspector.inspect(logFile);

    if (!this.enableML) {
      return baseAnalysis;
    }

    // Enhance with ML
    const mlEnhanced = this.enhanceWithML(baseAnalysis);

    return {
      ...baseAnalysis,
      mlInsights: mlEnhanced,
      mlEnabled: true
    };
  }

  /**
   * Enhance analysis with ML models
   */
  enhanceWithML(analysis) {
    const mlInsights = {
      classifications: [],
      anomalies: [],
      intelligentSuggestions: [],
      similarCases: []
    };

    // Classify each error with ML
    analysis.errors.forEach(error => {
      const classification = this.classifier.classify(error.message);
      
      if (classification.confidence >= this.confidenceThreshold) {
        mlInsights.classifications.push({
          lineNumber: error.lineNumber,
          originalType: error.type,
          mlType: classification.type,
          confidence: classification.confidence,
          subtype: classification.subtype,
          improved: classification.type !== error.type
        });

        // Generate intelligent suggestions
        const suggestions = this.suggestionGenerator.generateSuggestions({
          type: classification.type,
          subtype: classification.subtype,
          message: error.message
        });

        mlInsights.intelligentSuggestions.push({
          errorLine: error.lineNumber,
          errorType: classification.type,
          suggestions: suggestions,
          explanation: this.suggestionGenerator.generateExplanation({
            type: classification.type
          })
        });

        // Get similar historical cases
        const similarCases = this.suggestionGenerator.getSimilarCases({
          type: classification.type
        });

        if (similarCases.length > 0) {
          mlInsights.similarCases.push({
            errorLine: error.lineNumber,
            cases: similarCases
          });
        }
      }
    });

    // Detect anomalies in error patterns
    const errorFrequency = {};
    analysis.errors.forEach(error => {
      errorFrequency[error.type] = (errorFrequency[error.type] || 0) + 1;
    });

    Object.entries(errorFrequency).forEach(([type, count]) => {
      const anomalyResult = this.anomalyDetector.detectAnomaly({
        tool: 'error_analysis',
        duration: count * 100,
        status: 'error',
        timestamp: new Date().toISOString()
      });

      if (anomalyResult.isAnomaly) {
        mlInsights.anomalies.push({
          errorType: type,
          count: count,
          anomalyScore: anomalyResult.score,
          reason: anomalyResult.reason
        });
      }
    });

    // Calculate overall accuracy improvement
    const improvedCount = mlInsights.classifications.filter(c => c.improved).length;
    mlInsights.accuracyImprovement = analysis.errors.length > 0
      ? (improvedCount / analysis.errors.length) * 100
      : 0;

    return mlInsights;
  }

  /**
   * Analyze a single error with ML
   */
  analyzeError(errorMessage) {
    const classification = this.classifier.classify(errorMessage);
    const suggestions = this.suggestionGenerator.generateSuggestions({
      type: classification.type,
      subtype: classification.subtype,
      message: errorMessage
    });

    return {
      classification,
      suggestions,
      explanation: this.suggestionGenerator.generateExplanation({
        type: classification.type
      })
    };
  }

  /**
   * Get ML model statistics
   */
  getMLStats() {
    return {
      classifierReady: true,
      anomalyDetectorStats: this.anomalyDetector.getStats(),
      confidenceThreshold: this.confidenceThreshold
    };
  }
}

module.exports = MLErrorInspector;
