import React, { useState } from 'react';
import './Settings.css';

function Settings() {
  const [config, setConfig] = useState({
    monitoring: {
      wsPort: 3000,
      refreshRate: 1000,
      historySize: 1000,
      enableML: true
    },
    alerts: {
      errorThreshold: 10,
      timeoutThreshold: 5000,
      enableNotifications: false,
      notificationEmail: ''
    },
    display: {
      theme: 'dark',
      dateFormat: 'locale',
      timezone: 'local'
    },
    performance: {
      enableCompression: true,
      cacheSize: 500,
      logLevel: 'info'
    }
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (section, key, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setSaved(false);
  };

  const handleSave = () => {
    console.log('Saving configuration:', config);
    localStorage.setItem('devtools-llm-config', JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      const defaultConfig = {
        monitoring: {
          wsPort: 3000,
          refreshRate: 1000,
          historySize: 1000,
          enableML: true
        },
        alerts: {
          errorThreshold: 10,
          timeoutThreshold: 5000,
          enableNotifications: false,
          notificationEmail: ''
        },
        display: {
          theme: 'dark',
          dateFormat: 'locale',
          timezone: 'local'
        },
        performance: {
          enableCompression: true,
          cacheSize: 500,
          logLevel: 'info'
        }
      };
      setConfig(defaultConfig);
      setSaved(false);
    }
  };

  return (
    <div className="settings">
      <header className="page-header">
        <h1>Settings</h1>
        <p>Configure your DevToolsLLM instance</p>
      </header>

      <div className="settings-content">
        <div className="settings-section">
          <h2>Monitoring Configuration</h2>
          <div className="setting-group">
            <label>
              <span className="setting-label">WebSocket Port</span>
              <input
                type="number"
                value={config.monitoring.wsPort}
                onChange={(e) => handleChange('monitoring', 'wsPort', parseInt(e.target.value))}
              />
            </label>
            <p className="setting-description">Port for WebSocket server (requires restart)</p>
          </div>

          <div className="setting-group">
            <label>
              <span className="setting-label">Refresh Rate (ms)</span>
              <input
                type="number"
                value={config.monitoring.refreshRate}
                onChange={(e) => handleChange('monitoring', 'refreshRate', parseInt(e.target.value))}
              />
            </label>
            <p className="setting-description">How often to update the dashboard</p>
          </div>

          <div className="setting-group">
            <label>
              <span className="setting-label">History Size</span>
              <input
                type="number"
                value={config.monitoring.historySize}
                onChange={(e) => handleChange('monitoring', 'historySize', parseInt(e.target.value))}
              />
            </label>
            <p className="setting-description">Maximum number of calls to keep in history</p>
          </div>

          <div className="setting-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.monitoring.enableML}
                onChange={(e) => handleChange('monitoring', 'enableML', e.target.checked)}
              />
              <span>Enable ML-enhanced error analysis</span>
            </label>
            <p className="setting-description">Use machine learning for better error classification</p>
          </div>
        </div>

        <div className="settings-section">
          <h2>Alert Configuration</h2>
          <div className="setting-group">
            <label>
              <span className="setting-label">Error Threshold</span>
              <input
                type="number"
                value={config.alerts.errorThreshold}
                onChange={(e) => handleChange('alerts', 'errorThreshold', parseInt(e.target.value))}
              />
            </label>
            <p className="setting-description">Alert when error count exceeds this value</p>
          </div>

          <div className="setting-group">
            <label>
              <span className="setting-label">Timeout Threshold (ms)</span>
              <input
                type="number"
                value={config.alerts.timeoutThreshold}
                onChange={(e) => handleChange('alerts', 'timeoutThreshold', parseInt(e.target.value))}
              />
            </label>
            <p className="setting-description">Alert when call duration exceeds this value</p>
          </div>

          <div className="setting-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.alerts.enableNotifications}
                onChange={(e) => handleChange('alerts', 'enableNotifications', e.target.checked)}
              />
              <span>Enable Email Notifications</span>
            </label>
          </div>

          {config.alerts.enableNotifications && (
            <div className="setting-group">
              <label>
                <span className="setting-label">Notification Email</span>
                <input
                  type="email"
                  value={config.alerts.notificationEmail}
                  onChange={(e) => handleChange('alerts', 'notificationEmail', e.target.value)}
                  placeholder="your@email.com"
                />
              </label>
            </div>
          )}
        </div>

        <div className="settings-section">
          <h2>Display Settings</h2>
          <div className="setting-group">
            <label>
              <span className="setting-label">Theme</span>
              <select
                value={config.display.theme}
                onChange={(e) => handleChange('display', 'theme', e.target.value)}
              >
                <option value="dark">Dark</option>
                <option value="light">Light (Coming Soon)</option>
              </select>
            </label>
          </div>

          <div className="setting-group">
            <label>
              <span className="setting-label">Date Format</span>
              <select
                value={config.display.dateFormat}
                onChange={(e) => handleChange('display', 'dateFormat', e.target.value)}
              >
                <option value="locale">Locale Default</option>
                <option value="iso">ISO 8601</option>
                <option value="relative">Relative (e.g., "2 hours ago")</option>
              </select>
            </label>
          </div>

          <div className="setting-group">
            <label>
              <span className="setting-label">Timezone</span>
              <select
                value={config.display.timezone}
                onChange={(e) => handleChange('display', 'timezone', e.target.value)}
              >
                <option value="local">Local</option>
                <option value="utc">UTC</option>
              </select>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h2>Performance</h2>
          <div className="setting-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.performance.enableCompression}
                onChange={(e) => handleChange('performance', 'enableCompression', e.target.checked)}
              />
              <span>Enable Data Compression</span>
            </label>
            <p className="setting-description">Compress data for better performance</p>
          </div>

          <div className="setting-group">
            <label>
              <span className="setting-label">Cache Size</span>
              <input
                type="number"
                value={config.performance.cacheSize}
                onChange={(e) => handleChange('performance', 'cacheSize', parseInt(e.target.value))}
              />
            </label>
            <p className="setting-description">Number of items to cache</p>
          </div>

          <div className="setting-group">
            <label>
              <span className="setting-label">Log Level</span>
              <select
                value={config.performance.logLevel}
                onChange={(e) => handleChange('performance', 'logLevel', e.target.value)}
              >
                <option value="debug">Debug</option>
                <option value="info">Info</option>
                <option value="warn">Warning</option>
                <option value="error">Error</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button className="btn-primary" onClick={handleSave}>
          Save Settings
        </button>
        <button className="btn-secondary" onClick={handleReset}>
          Reset to Defaults
        </button>
        {saved && <span className="save-indicator">Settings saved successfully!</span>}
      </div>
    </div>
  );
}

export default Settings;
