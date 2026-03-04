import React, { useState, useEffect } from 'react';
import ToolChainDisplay from '../components/ToolChainDisplay';
import StatsCards from '../components/StatsCards';
import RecentCalls from '../components/RecentCalls';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState({
    totalCalls: 0,
    successRate: 0,
    avgDuration: 0,
    activeClients: 1
  });

  const [recentCalls, setRecentCalls] = useState([]);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    // Connect to WebSocket
    const websocket = new WebSocket(`ws://${window.location.hostname}:3000`);

    websocket.onopen = () => {
      console.log('WebSocket connected');
    };

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'call') {
        setRecentCalls(prev => [message.data, ...prev].slice(0, 50));
        updateStats(message.data);
      } else if (message.type === 'history') {
        setRecentCalls(message.data);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  const updateStats = (call) => {
    setStats(prev => {
      const newTotal = prev.totalCalls + 1;
      const successCount = call.status === 'success' 
        ? Math.round(prev.successRate * prev.totalCalls / 100) + 1
        : Math.round(prev.successRate * prev.totalCalls / 100);
      
      return {
        totalCalls: newTotal,
        successRate: Math.round((successCount / newTotal) * 100),
        avgDuration: call.duration 
          ? Math.round((prev.avgDuration * prev.totalCalls + call.duration) / newTotal)
          : prev.avgDuration,
        activeClients: 1
      };
    });
  };

  return (
    <div className="dashboard">
      <header className="page-header">
        <h1>Real-time Monitor</h1>
        <p>Live tool call monitoring and analysis</p>
      </header>

      <StatsCards stats={stats} />
      
      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h2>Recent Tool Calls</h2>
          <RecentCalls calls={recentCalls} />
        </div>
        
        <div className="dashboard-section">
          <h2>Call Chain Visualization</h2>
          <ToolChainDisplay calls={recentCalls} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
