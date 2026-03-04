const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

/**
 * Real-time monitoring server for LLM tool calls
 */
class RealtimeMonitor {
  constructor(port = 3000) {
    this.port = port;
    this.server = null;
    this.wss = null;
    this.clients = new Set();
    this.callHistory = [];
    this.maxHistorySize = 1000;
  }

  /**
   * Start the monitoring server
   */
  async start(port) {
    this.port = port || this.port;

    // Create HTTP server
    this.server = http.createServer((req, res) => {
      if (req.url === '/') {
        this.serveHTML(res);
      } else if (req.url === '/api/history') {
        this.serveHistory(res);
      } else if (req.url === '/api/stats') {
        this.serveStats(res);
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    });

    // Create WebSocket server
    this.wss = new WebSocket.Server({ server: this.server });

    this.wss.on('connection', (ws) => {
      console.log('✅ Client connected');
      this.clients.add(ws);

      // Send recent history to new client
      ws.send(JSON.stringify({
        type: 'history',
        data: this.callHistory.slice(-50)
      }));

      ws.on('close', () => {
        console.log('❌ Client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });

    // Start server
    this.server.listen(this.port, () => {
      console.log('\n🚀 Real-time Monitor Started\n');
      console.log('='.repeat(60));
      console.log(`\n📡 Server running at: http://localhost:${this.port}`);
      console.log(`🔌 WebSocket endpoint: ws://localhost:${this.port}`);
      console.log('\n📊 API Endpoints:');
      console.log(`   GET /api/history - Get call history`);
      console.log(`   GET /api/stats   - Get statistics`);
      console.log('\n💡 Usage:');
      console.log('   1. Open http://localhost:' + this.port + ' in your browser');
      console.log('   2. Send tool call events via WebSocket');
      console.log('   3. Monitor in real-time\n');
      console.log('='.repeat(60));
      console.log('\nPress Ctrl+C to stop\n');
    });

    // Handle shutdown
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Shutting down monitor...');
      this.stop();
      process.exit(0);
    });
  }

  /**
   * Stop the server
   */
  stop() {
    if (this.wss) {
      this.wss.close();
    }
    if (this.server) {
      this.server.close();
    }
    console.log('✅ Monitor stopped');
  }

  /**
   * Record a tool call
   */
  recordCall(call) {
    const enrichedCall = {
      ...call,
      id: call.id || `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: call.timestamp || new Date().toISOString()
    };

    this.callHistory.push(enrichedCall);

    // Limit history size
    if (this.callHistory.length > this.maxHistorySize) {
      this.callHistory.shift();
    }

    // Broadcast to all connected clients
    this.broadcast({
      type: 'call',
      data: enrichedCall
    });

    return enrichedCall;
  }

  /**
   * Broadcast message to all clients
   */
  broadcast(message) {
    const data = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  /**
   * Serve HTML dashboard
   */
  serveHTML(res) {
    const html = this.generateDashboardHTML();
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  /**
   * Serve call history
   */
  serveHistory(res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(this.callHistory));
  }

  /**
   * Serve statistics
   */
  serveStats(res) {
    const stats = this.calculateStats();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(stats));
  }

  /**
   * Calculate statistics from call history
   */
  calculateStats() {
    const stats = {
      totalCalls: this.callHistory.length,
      successRate: 0,
      averageDuration: 0,
      toolUsage: {},
      recentErrors: []
    };

    let successCount = 0;
    let totalDuration = 0;
    let durationCount = 0;

    this.callHistory.forEach(call => {
      if (call.status === 'success') successCount++;
      if (call.duration) {
        totalDuration += call.duration;
        durationCount++;
      }
      stats.toolUsage[call.tool] = (stats.toolUsage[call.tool] || 0) + 1;
      if (call.error) {
        stats.recentErrors.push({
          tool: call.tool,
          error: call.error,
          timestamp: call.timestamp
        });
      }
    });

    stats.successRate = this.callHistory.length > 0
      ? Math.round((successCount / this.callHistory.length) * 100)
      : 0;
    stats.averageDuration = durationCount > 0
      ? Math.round(totalDuration / durationCount)
      : 0;
    stats.recentErrors = stats.recentErrors.slice(-10);

    return stats;
  }

  /**
   * Generate dashboard HTML
   */
  generateDashboardHTML() {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>DevToolsLLM Monitor</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #1a1a1a;
      color: #e0e0e0;
      padding: 20px;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    h1 { margin-bottom: 20px; color: #4CAF50; }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: #2a2a2a;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #4CAF50;
    }
    .stat-label { font-size: 12px; color: #888; margin-bottom: 5px; }
    .stat-value { font-size: 28px; font-weight: bold; }
    .calls {
      background: #2a2a2a;
      border-radius: 8px;
      padding: 20px;
      max-height: 600px;
      overflow-y: auto;
    }
    .call {
      padding: 12px;
      margin-bottom: 10px;
      background: #333;
      border-radius: 4px;
      border-left: 3px solid #4CAF50;
    }
    .call.error { border-left-color: #f44336; }
    .call-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .call-tool { font-weight: bold; color: #4CAF50; }
    .call-time { font-size: 12px; color: #888; }
    .call-status { font-size: 12px; }
    .call-status.success { color: #4CAF50; }
    .call-status.error { color: #f44336; }
    .call-error {
      margin-top: 8px;
      padding: 8px;
      background: #442;
      border-radius: 4px;
      font-size: 12px;
      color: #faa;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔍 DevToolsLLM Real-time Monitor</h1>
    
    <div class="stats">
      <div class="stat-card">
        <div class="stat-label">Total Calls</div>
        <div class="stat-value" id="total-calls">0</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Success Rate</div>
        <div class="stat-value" id="success-rate">0%</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Avg Duration</div>
        <div class="stat-value" id="avg-duration">0ms</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Active Clients</div>
        <div class="stat-value" id="active-clients">1</div>
      </div>
    </div>

    <h2 style="margin-bottom: 15px;">Recent Calls</h2>
    <div class="calls" id="calls"></div>
  </div>

  <script>
    const ws = new WebSocket('ws://' + location.host);
    const callsContainer = document.getElementById('calls');
    let callCount = 0;
    let successCount = 0;
    let totalDuration = 0;
    let durationCount = 0;

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'call') {
        addCall(message.data);
        updateStats(message.data);
      } else if (message.type === 'history') {
        message.data.forEach(call => {
          addCall(call);
          updateStats(call);
        });
      }
    };

    function addCall(call) {
      const callEl = document.createElement('div');
      callEl.className = 'call' + (call.error ? ' error' : '');
      
      const time = new Date(call.timestamp).toLocaleTimeString();
      const status = call.status === 'success' ? 'success' : 'error';
      const duration = call.duration ? \`(\${call.duration}ms)\` : '';
      
      callEl.innerHTML = \`
        <div class="call-header">
          <span class="call-tool">\${call.tool}</span>
          <span class="call-time">\${time} \${duration}</span>
        </div>
        <div class="call-status \${status}">\${status.toUpperCase()}</div>
        \${call.error ? \`<div class="call-error">\${call.error.message || call.error}</div>\` : ''}
      \`;
      
      callsContainer.insertBefore(callEl, callsContainer.firstChild);
      
      // Keep only last 50 calls
      while (callsContainer.children.length > 50) {
        callsContainer.removeChild(callsContainer.lastChild);
      }
    }

    function updateStats(call) {
      callCount++;
      if (call.status === 'success') successCount++;
      if (call.duration) {
        totalDuration += call.duration;
        durationCount++;
      }
      
      document.getElementById('total-calls').textContent = callCount;
      document.getElementById('success-rate').textContent = 
        Math.round((successCount / callCount) * 100) + '%';
      document.getElementById('avg-duration').textContent = 
        durationCount > 0 ? Math.round(totalDuration / durationCount) + 'ms' : '0ms';
    }

    ws.onerror = () => {
      console.error('WebSocket error');
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
    };
  </script>
</body>
</html>
    `;
  }
}

/**
 * Start monitoring server
 */
async function start(port) {
  const monitor = new RealtimeMonitor(port);
  await monitor.start();
  return monitor;
}

module.exports = {
  RealtimeMonitor,
  start
};
