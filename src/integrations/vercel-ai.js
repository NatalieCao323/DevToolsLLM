/**
 * Vercel AI SDK integration for DevToolsLLM
 * Middleware to capture and trace Vercel AI tool calls
 */

class VercelAITracer {
  constructor(options = {}) {
    this.monitor = options.monitor || null;
    this.logFile = options.logFile || null;
    this.calls = [];
  }

  /**
   * Create middleware for Vercel AI SDK
   */
  createMiddleware() {
    const self = this;
    
    return {
      experimental_telemetry: {
        isEnabled: true,
        recordEvent: (event) => {
          if (event.type === 'tool-call') {
            self.recordToolCall(event);
          }
        }
      },
      
      onToolCall: async ({ toolCall, result }) => {
        const callData = {
          id: toolCall.id || `call_${Date.now()}`,
          tool: toolCall.name,
          input: toolCall.arguments,
          output: result,
          timestamp: new Date().toISOString(),
          status: result.error ? 'error' : 'success',
          error: result.error || null
        };
        
        self.recordCall(callData);
      }
    };
  }

  /**
   * Wrap a tool function
   */
  wrapTool(toolFn, toolName) {
    const self = this;
    
    return async function(...args) {
      const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const startTime = Date.now();
      
      const callData = {
        id: callId,
        tool: toolName,
        input: args,
        timestamp: new Date().toISOString(),
        startTime: new Date().toISOString()
      };

      try {
        const result = await toolFn(...args);
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
   * Record tool call event
   */
  recordToolCall(event) {
    const callData = {
      id: event.id || `call_${Date.now()}`,
      tool: event.toolName,
      input: event.args,
      output: event.result,
      timestamp: new Date().toISOString(),
      duration: event.duration,
      status: event.error ? 'error' : 'success',
      error: event.error || null
    };
    
    this.recordCall(callData);
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

module.exports = { VercelAITracer };
