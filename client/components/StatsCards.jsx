import React from 'react';
import './StatsCards.css';

function StatsCards({ stats }) {
  const cards = [
    {
      label: 'Total Calls',
      value: stats.totalCalls,
      icon: '',
      color: '#4CAF50'
    },
    {
      label: 'Success Rate',
      value: `${stats.successRate}%`,
      icon: '',
      color: '#2196F3'
    },
    {
      label: 'Avg Duration',
      value: `${stats.avgDuration}ms`,
      icon: '',
      color: '#FF9800'
    },
    {
      label: 'Active Clients',
      value: stats.activeClients,
      icon: '',
      color: '#9C27B0'
    }
  ];

  return (
    <div className="stats-cards">
      {cards.map((card, index) => (
        <div key={index} className="stat-card" style={{ borderLeftColor: card.color }}>
          <div className="stat-icon" style={{ color: card.color }}>
            {card.icon}
          </div>
          <div className="stat-content">
            <div className="stat-label">{card.label}</div>
            <div className="stat-value">{card.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatsCards;
