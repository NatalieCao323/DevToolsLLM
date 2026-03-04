/**
 * Anomaly Detection for Tool Calls
 * Uses statistical methods to detect unusual patterns
 * In production, this would use Isolation Forest or similar ML algorithms
 */

class AnomalyDetector {
  constructor(options = {}) {
    this.windowSize = options.windowSize || 100;
    this.threshold = options.threshold || 2.5; // Standard deviations
    this.history = [];
  }

  /**
   * Add a tool call to history
   */
  addCall(call) {
    this.history.push(call);
    
    // Keep only recent history
    if (this.history.length > this.windowSize) {
      this.history.shift();
    }
  }

  /**
   * Detect if a call is anomalous
   * @param {Object} call - Tool call to analyze
   * @returns {Object} Anomaly detection result
   */
  detectAnomaly(call) {
    if (this.history.length < 10) {
      return {
        isAnomaly: false,
        score: 0,
        reason: 'Insufficient data'
      };
    }

    const features = this.extractFeatures(call);
    const anomalyScore = this.calculateAnomalyScore(features);

    return {
      isAnomaly: anomalyScore > this.threshold,
      score: anomalyScore,
      features: features,
      reason: this.explainAnomaly(features, anomalyScore)
    };
  }

  /**
   * Extract features from a tool call
   */
  extractFeatures(call) {
    return {
      duration: call.duration || 0,
      hasError: call.status === 'error',
      toolName: call.tool,
      paramCount: Object.keys(call.input || {}).length,
      timestamp: new Date(call.timestamp).getTime()
    };
  }

  /**
   * Calculate anomaly score using statistical methods
   */
  calculateAnomalyScore(features) {
    let totalScore = 0;
    let scoreCount = 0;

    // Check duration anomaly
    const durationScore = this.checkDurationAnomaly(features.duration);
    if (durationScore !== null) {
      totalScore += durationScore;
      scoreCount++;
    }

    // Check error rate anomaly
    const errorScore = this.checkErrorRateAnomaly(features.hasError);
    if (errorScore !== null) {
      totalScore += errorScore;
      scoreCount++;
    }

    // Check frequency anomaly
    const frequencyScore = this.checkFrequencyAnomaly(features.toolName);
    if (frequencyScore !== null) {
      totalScore += frequencyScore;
      scoreCount++;
    }

    return scoreCount > 0 ? totalScore / scoreCount : 0;
  }

  /**
   * Check if duration is anomalous
   */
  checkDurationAnomaly(duration) {
    const durations = this.history
      .filter(c => c.duration)
      .map(c => c.duration);

    if (durations.length < 5) return null;

    const mean = durations.reduce((a, b) => a + b, 0) / durations.length;
    const variance = durations.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / durations.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return 0;

    return Math.abs(duration - mean) / stdDev;
  }

  /**
   * Check if error rate is anomalous
   */
  checkErrorRateAnomaly(hasError) {
    const recentErrors = this.history.filter(c => c.status === 'error').length;
    const errorRate = recentErrors / this.history.length;

    // If current call is error and error rate is low, it's anomalous
    if (hasError && errorRate < 0.1) {
      return 2.0;
    }

    // If current call is success but error rate is high, it's also notable
    if (!hasError && errorRate > 0.5) {
      return 1.5;
    }

    return 0;
  }

  /**
   * Check if tool call frequency is anomalous
   */
  checkFrequencyAnomaly(toolName) {
    const toolCalls = this.history.filter(c => c.tool === toolName);
    const frequency = toolCalls.length / this.history.length;

    // Very rare tool usage might be anomalous
    if (frequency < 0.05 && toolCalls.length > 0) {
      return 1.5;
    }

    return 0;
  }

  /**
   * Explain why something is anomalous
   */
  explainAnomaly(features, score) {
    if (score <= this.threshold) {
      return 'Normal behavior';
    }

    const reasons = [];

    // Check duration
    const durations = this.history.filter(c => c.duration).map(c => c.duration);
    if (durations.length > 0) {
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      if (features.duration > avgDuration * 3) {
        reasons.push(`Duration (${features.duration}ms) is ${Math.round(features.duration / avgDuration)}x higher than average`);
      }
    }

    // Check error
    if (features.hasError) {
      const errorRate = this.history.filter(c => c.status === 'error').length / this.history.length;
      if (errorRate < 0.1) {
        reasons.push('Unexpected error in normally stable tool');
      }
    }

    // Check tool usage
    const toolFreq = this.history.filter(c => c.tool === features.toolName).length / this.history.length;
    if (toolFreq < 0.05) {
      reasons.push('Rare tool usage detected');
    }

    return reasons.length > 0 ? reasons.join('; ') : 'Statistical anomaly detected';
  }

  /**
   * Get anomaly statistics
   */
  getStats() {
    const anomalies = this.history.filter(call => {
      const result = this.detectAnomaly(call);
      return result.isAnomaly;
    });

    return {
      totalCalls: this.history.length,
      anomalyCount: anomalies.length,
      anomalyRate: this.history.length > 0 ? anomalies.length / this.history.length : 0,
      recentAnomalies: anomalies.slice(-5)
    };
  }
}

module.exports = AnomalyDetector;
