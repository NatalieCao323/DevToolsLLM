class TimeTravelDebugger {
  constructor(options = {}) {
    this.maxSnapshots = options.maxSnapshots || 100;
    this.snapshots = [];
    this.currentIndex = -1;
    this.recordingEnabled = true;
  }

  recordSnapshot(toolCall, context = {}) {
    if (!this.recordingEnabled) return;

    const snapshot = {
      id: `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      toolCall: this._deepClone(toolCall),
      context: this._deepClone(context),
      state: {
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        environment: { ...process.env }
      },
      stackTrace: this._captureStackTrace()
    };

    if (this.currentIndex < this.snapshots.length - 1) {
      this.snapshots = this.snapshots.slice(0, this.currentIndex + 1);
    }

    this.snapshots.push(snapshot);
    this.currentIndex = this.snapshots.length - 1;

    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
      this.currentIndex--;
    }

    return snapshot.id;
  }

  goBack(steps = 1) {
    if (this.currentIndex - steps < 0) {
      return {
        success: false,
        message: 'Cannot go back further',
        currentIndex: this.currentIndex
      };
    }

    this.currentIndex -= steps;
    return {
      success: true,
      snapshot: this.snapshots[this.currentIndex],
      currentIndex: this.currentIndex,
      totalSnapshots: this.snapshots.length
    };
  }

  goForward(steps = 1) {
    if (this.currentIndex + steps >= this.snapshots.length) {
      return {
        success: false,
        message: 'Cannot go forward further',
        currentIndex: this.currentIndex
      };
    }

    this.currentIndex += steps;
    return {
      success: true,
      snapshot: this.snapshots[this.currentIndex],
      currentIndex: this.currentIndex,
      totalSnapshots: this.snapshots.length
    };
  }

  goToSnapshot(snapshotId) {
    const index = this.snapshots.findIndex(s => s.id === snapshotId);
    if (index === -1) {
      return {
        success: false,
        message: 'Snapshot not found'
      };
    }

    this.currentIndex = index;
    return {
      success: true,
      snapshot: this.snapshots[this.currentIndex],
      currentIndex: this.currentIndex
    };
  }

  goToTimestamp(timestamp) {
    let closestIndex = 0;
    let minDiff = Math.abs(this.snapshots[0].timestamp - timestamp);

    for (let i = 1; i < this.snapshots.length; i++) {
      const diff = Math.abs(this.snapshots[i].timestamp - timestamp);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }

    this.currentIndex = closestIndex;
    return {
      success: true,
      snapshot: this.snapshots[this.currentIndex],
      currentIndex: this.currentIndex,
      timeDifference: minDiff
    };
  }

  getCurrentSnapshot() {
    if (this.currentIndex < 0 || this.currentIndex >= this.snapshots.length) {
      return null;
    }
    return this.snapshots[this.currentIndex];
  }

  compareSnapshots(snapshotId1, snapshotId2) {
    const snapshot1 = this.snapshots.find(s => s.id === snapshotId1);
    const snapshot2 = this.snapshots.find(s => s.id === snapshotId2);

    if (!snapshot1 || !snapshot2) {
      return { success: false, message: 'One or both snapshots not found' };
    }

    return {
      success: true,
      comparison: {
        timeDifference: snapshot2.timestamp - snapshot1.timestamp,
        toolCallChanges: this._compareObjects(snapshot1.toolCall, snapshot2.toolCall),
        contextChanges: this._compareObjects(snapshot1.context, snapshot2.context),
        stateChanges: this._compareObjects(snapshot1.state, snapshot2.state)
      }
    };
  }

  findSnapshotsByTool(toolName) {
    return this.snapshots.filter(s => s.toolCall.name === toolName);
  }

  findSnapshotsByError() {
    return this.snapshots.filter(s => s.toolCall.error || !s.toolCall.success);
  }

  findSnapshotsByTimeRange(startTime, endTime) {
    return this.snapshots.filter(s => 
      s.timestamp >= startTime && s.timestamp <= endTime
    );
  }

  replaySequence(startIndex, endIndex) {
    if (startIndex < 0 || endIndex >= this.snapshots.length || startIndex > endIndex) {
      return {
        success: false,
        message: 'Invalid index range'
      };
    }

    const sequence = this.snapshots.slice(startIndex, endIndex + 1);
    const replay = {
      success: true,
      sequence: sequence.map(s => ({
        id: s.id,
        timestamp: s.timestamp,
        toolName: s.toolCall.name,
        duration: s.toolCall.duration,
        success: s.toolCall.success,
        error: s.toolCall.error
      })),
      summary: {
        totalCalls: sequence.length,
        successfulCalls: sequence.filter(s => s.toolCall.success).length,
        failedCalls: sequence.filter(s => !s.toolCall.success).length,
        totalDuration: sequence.reduce((sum, s) => sum + (s.toolCall.duration || 0), 0),
        timeSpan: sequence[sequence.length - 1].timestamp - sequence[0].timestamp
      }
    };

    return replay;
  }

  analyzeCallPattern(toolName) {
    const toolSnapshots = this.findSnapshotsByTool(toolName);
    if (toolSnapshots.length === 0) {
      return { success: false, message: 'No snapshots found for this tool' };
    }

    const analysis = {
      toolName,
      totalCalls: toolSnapshots.length,
      successRate: (toolSnapshots.filter(s => s.toolCall.success).length / toolSnapshots.length) * 100,
      averageDuration: toolSnapshots.reduce((sum, s) => sum + (s.toolCall.duration || 0), 0) / toolSnapshots.length,
      errorPatterns: this._analyzeErrorPatterns(toolSnapshots),
      parameterPatterns: this._analyzeParameterPatterns(toolSnapshots),
      temporalPattern: this._analyzeTemporalPattern(toolSnapshots)
    };

    return { success: true, analysis };
  }

  _analyzeErrorPatterns(snapshots) {
    const errors = snapshots.filter(s => s.toolCall.error);
    const errorTypes = {};

    errors.forEach(s => {
      const errorType = this._classifyError(s.toolCall.error);
      errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
    });

    return {
      totalErrors: errors.length,
      errorTypes,
      mostCommonError: Object.entries(errorTypes).sort((a, b) => b[1] - a[1])[0]
    };
  }

  _analyzeParameterPatterns(snapshots) {
    const parameterUsage = {};

    snapshots.forEach(s => {
      if (s.toolCall.parameters) {
        Object.keys(s.toolCall.parameters).forEach(key => {
          parameterUsage[key] = (parameterUsage[key] || 0) + 1;
        });
      }
    });

    return {
      totalParameters: Object.keys(parameterUsage).length,
      usage: parameterUsage,
      mostUsedParameter: Object.entries(parameterUsage).sort((a, b) => b[1] - a[1])[0]
    };
  }

  _analyzeTemporalPattern(snapshots) {
    if (snapshots.length < 2) {
      return { pattern: 'insufficient_data' };
    }

    const intervals = [];
    for (let i = 1; i < snapshots.length; i++) {
      intervals.push(snapshots[i].timestamp - snapshots[i - 1].timestamp);
    }

    const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
    const maxInterval = Math.max(...intervals);
    const minInterval = Math.min(...intervals);

    return {
      averageInterval: avgInterval,
      maxInterval,
      minInterval,
      pattern: this._detectPattern(intervals)
    };
  }

  _detectPattern(intervals) {
    const variance = this._calculateVariance(intervals);
    const mean = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;
    const cv = Math.sqrt(variance) / mean; // Coefficient of variation

    if (cv < 0.2) return 'regular';
    if (cv < 0.5) return 'somewhat_regular';
    return 'irregular';
  }

  _calculateVariance(values) {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  }

  _classifyError(error) {
    if (!error) return 'unknown';
    const errorStr = error.message || error.toString();
    
    if (/timeout/i.test(errorStr)) return 'timeout';
    if (/rate limit/i.test(errorStr)) return 'rate_limit';
    if (/auth/i.test(errorStr)) return 'authentication';
    if (/network/i.test(errorStr)) return 'network';
    if (/parse/i.test(errorStr)) return 'parsing';
    
    return 'other';
  }

  _compareObjects(obj1, obj2) {
    const changes = {
      added: [],
      removed: [],
      modified: []
    };

    const keys1 = new Set(Object.keys(obj1 || {}));
    const keys2 = new Set(Object.keys(obj2 || {}));

    keys2.forEach(key => {
      if (!keys1.has(key)) {
        changes.added.push({ key, value: obj2[key] });
      } else if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
        changes.modified.push({
          key,
          oldValue: obj1[key],
          newValue: obj2[key]
        });
      }
    });

    keys1.forEach(key => {
      if (!keys2.has(key)) {
        changes.removed.push({ key, value: obj1[key] });
      }
    });

    return changes;
  }

  _deepClone(obj) {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (e) {
      return obj;
    }
  }

  _captureStackTrace() {
    const stack = new Error().stack;
    return stack ? stack.split('\n').slice(2, 7) : [];
  }

  exportSession() {
    return {
      snapshots: this.snapshots,
      currentIndex: this.currentIndex,
      exportedAt: new Date().toISOString(),
      summary: {
        totalSnapshots: this.snapshots.length,
        timeSpan: this.snapshots.length > 0 
          ? this.snapshots[this.snapshots.length - 1].timestamp - this.snapshots[0].timestamp
          : 0
      }
    };
  }

  importSession(sessionData) {
    if (!sessionData || !sessionData.snapshots) {
      return { success: false, message: 'Invalid session data' };
    }

    this.snapshots = sessionData.snapshots;
    this.currentIndex = sessionData.currentIndex || this.snapshots.length - 1;

    return {
      success: true,
      message: `Imported ${this.snapshots.length} snapshots`
    };
  }

  clearHistory() {
    this.snapshots = [];
    this.currentIndex = -1;
  }

  pauseRecording() {
    this.recordingEnabled = false;
  }

  resumeRecording() {
    this.recordingEnabled = true;
  }

  getStatistics() {
    return {
      totalSnapshots: this.snapshots.length,
      currentIndex: this.currentIndex,
      recordingEnabled: this.recordingEnabled,
      memoryUsage: this.snapshots.reduce((sum, s) => 
        sum + JSON.stringify(s).length, 0
      ),
      timeSpan: this.snapshots.length > 0
        ? this.snapshots[this.snapshots.length - 1].timestamp - this.snapshots[0].timestamp
        : 0,
      uniqueTools: new Set(this.snapshots.map(s => s.toolCall.name)).size
    };
  }
}

module.exports = TimeTravelDebugger;
