import React from 'react';
import './ToolChainDisplay.css';

function ToolChainDisplay({ calls }) {
  if (!calls || calls.length === 0) {
    return (
      <div className="empty-state">
        <p>No call chain data available</p>
      </div>
    );
  }

  // Build a simple tree structure from recent calls
  const recentCalls = calls.slice(0, 10);

  return (
    <div className="tool-chain-display">
      <div className="chain-tree">
        {recentCalls.map((call, index) => {
          const isLast = index === recentCalls.length - 1;
          const connector = isLast ? '└─' : '├─';
          const status = call.status === 'success' ? '✅' : '❌';
          
          return (
            <div key={call.id || index} className="chain-node">
              <span className="connector">{connector}</span>
              <span className="status">{status}</span>
              <span className="tool-name">{call.tool}</span>
              {call.duration && (
                <span className="duration">({call.duration}ms)</span>
              )}
              {call.error && (
                <div className="node-error">
                  <span className="error-connector">   └─</span>
                  <span className="error-icon">❌</span>
                  <span className="error-text">
                    {call.error.message || call.error}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ToolChainDisplay;
