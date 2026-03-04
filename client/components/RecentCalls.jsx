import React from 'react';
import './RecentCalls.css';

function RecentCalls({ calls }) {
  if (!calls || calls.length === 0) {
    return (
      <div className="empty-state">
        <p>No tool calls yet. Waiting for data...</p>
      </div>
    );
  }

  return (
    <div className="recent-calls">
      {calls.slice(0, 10).map((call, index) => (
        <div key={call.id || index} className={`call-item ${call.status}`}>
          <div className="call-header">
            <div className="call-tool">
              <span className="status-icon">
                {call.status === 'success' ? '' : ''}
              </span>
              <span className="tool-name">{call.tool}</span>
            </div>
            <div className="call-meta">
              {call.duration && (
                <span className="duration">{call.duration}ms</span>
              )}
              <span className="timestamp">
                {new Date(call.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
          
          {call.error && (
            <div className="call-error">
              <span className="error-label">Error:</span>
              <span className="error-message">
                {call.error.message || call.error}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default RecentCalls;
