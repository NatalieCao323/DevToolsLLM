import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

function Layout({ children }) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '📊 Dashboard', icon: '📊' },
    { path: '/errors', label: '🐛 Errors', icon: '🐛' },
    { path: '/traces', label: '🔗 Traces', icon: '🔗' },
    { path: '/settings', label: '⚙️ Settings', icon: '⚙️' }
  ];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>🔍 DevToolsLLM</h1>
          <p className="version">v0.1.0</p>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="status-indicator">
            <span className="status-dot"></span>
            <span>Connected</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;
