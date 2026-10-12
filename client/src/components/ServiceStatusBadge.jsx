import React from 'react';
import '../Styles/styles/ServiceBadge.css';

const ServiceStatusBadge = ({ status, size = 'medium' }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return {
          color: '#f39c12',
          bgColor: '#fef9e7',
          text: 'Pending',
          icon: '⏳'
        };
      case 'approved':
        return {
          color: '#3498db',
          bgColor: '#ebf3fd',
          text: 'Approved',
          icon: '✅'
        };
      case 'completed':
        return {
          color: '#27ae60',
          bgColor: '#eafaf1',
          text: 'Completed',
          icon: '🎉'
        };
      case 'declined':
        return {
          color: '#e74c3c',
          bgColor: '#fdedec',
          text: 'Declined',
          icon: '❌'
        };
      default:
        return {
          color: '#95a5a6',
          bgColor: '#f8f9fa',
          text: 'Unknown',
          icon: '❓'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span 
      className={`status-badge ${size}`}
      style={{
        color: config.color,
        backgroundColor: config.bgColor,
        border: `1px solid ${config.color}20`
      }}
    >
      <span className="status-icon">{config.icon}</span>
      <span className="status-text">{config.text}</span>
    </span>
  );
};

export default ServiceStatusBadge;
