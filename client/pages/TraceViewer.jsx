import React, { useState, useEffect } from 'react';
import './TraceViewer.css';

function TraceViewer() {
  const [traces, setTraces] = useState([]);
  const [selectedTrace, setSelectedTrace] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadTraces();
  }, []);

  const loadTraces = () => {
    const mockTraces = [
      {
        id: 'trace_1',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        totalCalls: 5,
        duration: 1250,
        status: 'success',
        calls: [
          { id: 'call_1', tool: 'search', duration: 120, status: 'success', parentId: null },
          { id: 'call_2', tool: 'calculator', duration: 45, status: 'success', parentId: 'call_1' },
          { id: 'call_3', tool: 'weather', duration: 380, status: 'success', parentId: 'call_1' },
          { id: 'call_4', tool: 'database', duration: 520, status: 'success', parentId: null },
          { id: 'call_5', tool: 'api', duration: 185, status: 'success', parentId: 'call_4' }
        ]
      },
      {
        id: 'trace_2',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        totalCalls: 3,
        duration: 2100,
        status: 'error',
        calls: [
          { id: 'call_6', tool: 'search', duration: 150, status: 'success', parentId: null },
          { id: 'call_7', tool: 'api', duration: 1950, status: 'error', parentId: 'call_6', error: 'Timeout' }
        ]
      },
      {
        id: 'trace_3',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        totalCalls: 8,
        duration: 890,
        status: 'success',
        calls: [
          { id: 'call_8', tool: 'search', duration: 110, status: 'success', parentId: null },
          { id: 'call_9', tool: 'calculator', duration: 35, status: 'success', parentId: 'call_8' },
          { id: 'call_10', tool: 'weather', duration: 280, status: 'success', parentId: 'call_8' },
          { id: 'call_11', tool: 'database', duration: 180, status: 'success', parentId: null },
          { id: 'call_12', tool: 'api', duration: 95, status: 'success', parentId: 'call_11' },
          { id: 'call_13', tool: 'cache', duration: 15, status: 'success', parentId: 'call_11' },
          { id: 'call_14', tool: 'validator', duration: 25, status: 'success', parentId: null },
          { id: 'call_15', tool: 'logger', duration: 150, status: 'success', parentId: 'call_14' }
        ]
      }
    ];

    setTraces(mockTraces);
    if (mockTraces.length > 0) {
      setSelectedTrace(mockTraces[0]);
    }
  };

  const buildTree = (calls) => {
    const callMap = new Map();
    const roots = [];

    calls.forEach(call => {
      callMap.set(call.id, { ...call, children: [] });
    });

    calls.forEach(call => {
      const node = callMap.get(call.id);
      if (call.parentId && callMap.has(call.parentId)) {
        callMap.get(call.parentId).children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const renderTree = (nodes, level = 0) => {
    return nodes.map((node, index) => {
      const isLast = index === nodes.length - 1;
      const connector = isLast ? '└─' : '├─';
      const statusIcon = node.status === 'success' ? '[OK]' : '[ERR]';

      return (
        <div key={node.id}>
          <div className="tree-node" style={{ paddingLeft: `${level * 24}px` }}>
            <span className="connector">{level > 0 ? connector : ''}</span>
            <span className={`status-icon ${node.status}`}>{statusIcon}</span>
            <span className="tool-name">{node.tool}</span>
            <span className="duration">({node.duration}ms)</span>
            {node.error && <span className="error-badge">Error: {node.error}</span>}
          </div>
          {node.children && node.children.length > 0 && renderTree(node.children, level + 1)}
        </div>
      );
    });
  };

  const filteredTraces = traces.filter(trace => {
    if (filter === 'all') return true;
    if (filter === 'success') return trace.status === 'success';
    if (filter === 'error') return trace.status === 'error';
    return true;
  });

  return (
    <div className="trace-viewer">
      <header className="page-header">
        <h1>Trace Viewer</h1>
        <p>Visualize and analyze tool call traces</p>
      </header>

      <div className="filter-bar">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All Traces
        </button>
        <button 
          className={filter === 'success' ? 'active' : ''}
          onClick={() => setFilter('success')}
        >
          Successful
        </button>
        <button 
          className={filter === 'error' ? 'active' : ''}
          onClick={() => setFilter('error')}
        >
          Failed
        </button>
      </div>

      <div className="trace-content">
        <div className="trace-list-section">
          <h2>Trace History</h2>
          <div className="trace-list">
            {filteredTraces.map(trace => (
              <div
                key={trace.id}
                className={`trace-item ${trace.status} ${selectedTrace?.id === trace.id ? 'selected' : ''}`}
                onClick={() => setSelectedTrace(trace)}
              >
                <div className="trace-header">
                  <span className="trace-id">{trace.id}</span>
                  <span className={`trace-status ${trace.status}`}>
                    {trace.status.toUpperCase()}
                  </span>
                </div>
                <div className="trace-info">
                  <span>{trace.totalCalls} calls</span>
                  <span>{trace.duration}ms</span>
                  <span>{new Date(trace.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="trace-details-section">
          {selectedTrace ? (
            <>
              <h2>Call Chain Visualization</h2>
              <div className="trace-tree">
                {renderTree(buildTree(selectedTrace.calls))}
              </div>

              <h2>Performance Timeline</h2>
              <div className="timeline">
                {selectedTrace.calls.map((call, index) => {
                  const offset = selectedTrace.calls
                    .slice(0, index)
                    .reduce((sum, c) => sum + c.duration, 0);
                  const percentage = (call.duration / selectedTrace.duration) * 100;

                  return (
                    <div key={call.id} className="timeline-item">
                      <div className="timeline-label">
                        <span>{call.tool}</span>
                        <span>{call.duration}ms</span>
                      </div>
                      <div className="timeline-bar-container">
                        <div
                          className={`timeline-bar ${call.status}`}
                          style={{
                            width: `${percentage}%`,
                            marginLeft: `${(offset / selectedTrace.duration) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <h2>Call Statistics</h2>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Total Calls</span>
                  <span className="stat-value">{selectedTrace.totalCalls}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Duration</span>
                  <span className="stat-value">{selectedTrace.duration}ms</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Avg Duration</span>
                  <span className="stat-value">
                    {Math.round(selectedTrace.duration / selectedTrace.totalCalls)}ms
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Status</span>
                  <span className={`stat-value ${selectedTrace.status}`}>
                    {selectedTrace.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <p>Select a trace to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TraceViewer;
