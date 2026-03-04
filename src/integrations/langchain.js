/**
 * LangChain integration for DevToolsLLM
 * Middleware to capture and trace LangChain tool calls
 */

class LangChainTracer {
  constructor(options = {}) {
    this.monitor = options.monitor || null;
    this.logFile = options.logFile || null;
    this.calls = [];
  }

  /**
   * Create a traced tool wrapper
   */
  wrapTool(tool) {
    const self = this;
    
    return {
      ...tool,
      async call(input, config) {
        const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const startTime = Date.now();
        
        const callData = {
          id: callId,
          tool: tool.name,
          input: input,
          timestamp: new Date().toISOString(),
          startTime: new Date().toISOString()
        };

        try {
          const result = await tool.call(input, config);
          const endTime = Date.now();
          
          callData.output = result;
          callData.endTime = new Date().toISOString();
          callData.duration = endTime - startTime;
          callData.status = 'success';
          
          self.recordCall(callData);
          
          return result;
        } catch (error) {
          const endTime = Date.now();
          
          callData.error = {
            message: error.message,
            type: error.name,
            stack: error.stack
          };
          callData.endTime = new Date().toISOString();
          callData.duration = endTime - startTime;
          callData.status = 'error';
          
          self.recordCall(callData);
          
          throw error;
        }
      }
    };
  }

  /**
   * Record a tool call
   */
  recordCall(callData) {
    this.calls.push(callData);

    // Send to real-time monitor if available
    if (this.monitor) {
      this.monitor.recordCall(callData);
    }

    // Append to log file if specified
    if (this.logFile) {
      const fs = require('fs');
      fs.appendFileSync(this.logFile, JSON.stringify(callData) + '\n');
    }
  }

  /**
   * Get all recorded calls
   */
  getCalls() {
    return this.calls;
  }

  /**
   * Clear recorded calls
   */
  clear() {
    this.calls = [];
  }

  /**
   * Export calls to file
   */
  export(filename) {
    const fs = require('fs');
    fs.writeFileSync(filename, JSON.stringify(this.calls, null, 2));
    console.log(`Exported ${this.calls.length} calls to ${filename}`);
  }
}

module.exports = { LangChainTracer };
