import React, { useState, useEffect } from 'react';
import './ErrorAnalysis.css';

function ErrorAnalysis() {
  const [errors, setErrors] = useState([]);
  const [stats, setStats] = useState({
    totalErrors: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    errorTypes: {}
  });
  const [selectedError, setSelectedError] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    loadErrorData();
  }, [timeRange]);

  const loadErrorData = () => {
    const mockErrors = [
      {
        id: 1,
        type: 'TIMEOUT',
        severity: 'HIGH',
        message: 'Request timeout after 30s',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        tool: 'search',
        count: 5
      },
      {
        id: 2,
        type: 'API_ERROR',
        severity: 'CRITICAL',
        message: 'Rate limit exceeded (429)',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        tool: 'weather',
        count: 12
      },
      {
        id: 3,
        type: 'INVALID_PARAMS',
        severity: 'MEDIUM',
        message: 'Missing required parameter: query',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        tool: 'calculator',
        count: 3
      },
      {
        id: 4,
        type: 'NETWORK',
        severity: 'HIGH',
        message: 'ECONNREFUSED - Connection refused',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        tool: 'database',
        count: 8
      },
      {
        id: 5,
        type: 'PARSE_ERROR',
        severity: 'MEDIUM',
        message: 'JSON parse error: Unexpected token',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        tool: 'api',
        count: 2
      }
    ];

    setErrors(mockErrors);

    const newStats = {
      totalErrors: mockErrors.reduce((sum, e) => sum + e.count, 0),
      critical: mockErrors.filter(e => e.severity === 'CRITICAL').reduce((sum, e) => sum + e.count, 0),
      high: mockErrors.filter(e => e.severity === 'HIGH').reduce((sum, e) => sum + e.count, 0),
      medium: mockErrors.filter(e => e.severity === 'MEDIUM').reduce((sum, e) => sum + e.count, 0),
      low: 0,
      errorTypes: {}
    };

    mockErrors.forEach(error => {
      newStats.errorTypes[error.type] = (newStats.errorTypes[error.type] || 0) + error.count;
    });

    setStats(newStats);
  };

  const getSuggestions = (errorType) => {
    const suggestions = {
      TIMEOUT: [
        'Increase timeout threshold in configuration',
        'Check API endpoint response time',
        'Implement retry logic with exponential backoff'
      ],
      API_ERROR: [
        'Verify API key and permissions',
        'Check rate limits and quota',
        'Implement request throttling'
      ],
      INVALID_PARAMS: [
        'Add parameter validation before calls',
        'Check required vs optional parameters',
        'Use TypeScript for type safety'
      ],
      NETWORK: [
        'Check network connectivity',
        'Verify firewall settings',
        'Implement connection pooling'
      ],
      PARSE_ERROR: [
        'Validate JSON structure',
        'Add error handling for parse failures',
        'Log raw response for debugging'
      ]
    };
    return suggestions[errorType] || [];
  };

  return (
    <div className="error-analysis">
      <header className="page-header">
        <h1>Error Analysis</h1>
        <p>Intelligent error detection and debugging suggestions</p>
      </header>

      <div className="time-range-selector">
        <button 
          className={timeRange === '1h' ? 'active' : ''}
          onClick={() => setTimeRange('1h')}
        >
          Last Hour
        </button>
        <button 
          className={timeRange === '24h' ? 'active' : ''}
          onClick={() => setTimeRange('24h')}
        >
          Last 24 Hours
        </button>
        <button 
          className={timeRange === '7d' ? 'active' : ''}
          onClick={() => setTimeRange('7d')}
        >
          Last 7 Days
        </button>
      </div>

      <div className="error-stats">
        <div className="stat-card total">
          <h3>Total Errors</h3>
          <div className="stat-value">{stats.totalErrors}</div>
        </div>
        <div className="stat-card critical">
          <h3>Critical</h3>
          <div className="stat-value">{stats.critical}</div>
        </div>
        <div className="stat-card high">
          <h3>High</h3>
          <div className="stat-value">{stats.high}</div>
        </div>
        <div className="stat-card medium">
          <h3>Medium</h3>
          <div className="stat-value">{stats.medium}</div>
        </div>
      </div>

      <div className="error-content">
        <div className="error-list-section">
          <h2>Error Types</h2>
          <div className="error-type-chart">
            {Object.entries(stats.errorTypes)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => {
                const percentage = (count / stats.totalErrors) * 100;
                return (
                  <div key={type} className="error-type-bar">
                    <div className="error-type-label">
                      <span>{type}</span>
                      <span>{count}</span>
                    </div>
                    <div className="bar-container">
                      <div 
                        className="bar-fill" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>

          <h2>Recent Errors</h2>
          <div className="error-list">
            {errors.map(error => (
              <div 
                key={error.id} 
                className={`error-item ${error.severity.toLowerCase()} ${selectedError?.id === error.id ? 'selected' : ''}`}
                onClick={() => setSelectedError(error)}
              >
                <div className="error-header">
                  <span className="error-type">{error.type}</span>
                  <span className="error-count">{error.count}x</span>
                </div>
                <div className="error-message">{error.message}</div>
                <div className="error-meta">
                  <span className="error-tool">Tool: {error.tool}</span>
                  <span className="error-time">
                    {new Date(error.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="error-details-section">
          {selectedError ? (
            <>
              <h2>Error Details</h2>
              <div className="error-detail-card">
                <div className="detail-row">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">{selectedError.type}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Severity:</span>
                  <span className={`detail-value severity-${selectedError.severity.toLowerCase()}`}>
                    {selectedError.severity}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Tool:</span>
                  <span className="detail-value">{selectedError.tool}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Occurrences:</span>
                  <span className="detail-value">{selectedError.count}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Message:</span>
                  <span className="detail-value">{selectedError.message}</span>
                </div>
              </div>

              <h3>Debugging Suggestions</h3>
              <div className="suggestions-list">
                {getSuggestions(selectedError.type).map((suggestion, index) => (
                  <div key={index} className="suggestion-item">
                    <span className="suggestion-number">{index + 1}</span>
                    <span className="suggestion-text">{suggestion}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-selection">
              <p>Select an error to view details and suggestions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorAnalysis;
