import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import '../Styles/styles/ServerStatus.css';

const ServerStatus = () => {
  const [serverInfo, setServerInfo] = useState({
    connected: false,
    totalCars: 0,
    totalBookings: 0,
    availableCars: 0,
    rentedCars: 0,
    totalRevenue: 0,
    lastUpdated: null
  });
  const [userInfo, setUserInfo] = useState({
    isLoggedIn: false,
    userId: null,
    userRole: null,
    email: null
  });

  useEffect(() => {
    // Get user info from localStorage
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail');
    
    setUserInfo({
      isLoggedIn: !!userId,
      userId,
      userRole,
      email
    });

    // Fetch server statistics
    fetchServerStats();
    
    // Update every 30 seconds
    const interval = setInterval(fetchServerStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchServerStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/statistics`);
      if (response.ok) {
        const data = await response.json();
        setServerInfo({
          connected: true,
          totalCars: data.totalCars || 0,
          totalBookings: data.totalBookings || 0,
          availableCars: data.availableCars || 0,
          rentedCars: data.rentedCars || 0,
          totalRevenue: data.totalRevenue || 0,
          lastUpdated: new Date()
        });
      } else {
        setServerInfo(prev => ({ ...prev, connected: false }));
      }
    } catch (error) {
      console.error('Failed to fetch server stats:', error);
      setServerInfo(prev => ({ ...prev, connected: false }));
    }
  };

  return (
    <div className="server-status">
      <div className="status-header">
        <h3>System Status</h3>
        <div className={`connection-indicator ${serverInfo.connected ? 'connected' : 'disconnected'}`}>
          <span className="status-dot"></span>
          {serverInfo.connected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      <div className="status-grid">
        {/* User Information */}
        <div className="status-card user-info">
          <h4>User Status</h4>
          <div className="info-item">
            <span className="label">Status:</span>
            <span className={`value ${userInfo.isLoggedIn ? 'logged-in' : 'guest'}`}>
              {userInfo.isLoggedIn ? 'Logged In' : 'Guest'}
            </span>
          </div>
          {userInfo.isLoggedIn && (
            <>
              <div className="info-item">
                <span className="label">Role:</span>
                <span className="value role">{userInfo.userRole}</span>
              </div>
              <div className="info-item">
                <span className="label">User ID:</span>
                <span className="value user-id">{userInfo.userId}</span>
              </div>
              {userInfo.email && (
                <div className="info-item">
                  <span className="label">Email:</span>
                  <span className="value email">{userInfo.email}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Server Statistics */}
        <div className="status-card server-stats">
          <h4>Server Statistics</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{serverInfo.totalCars}</span>
              <span className="stat-label">Total Cars</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{serverInfo.availableCars}</span>
              <span className="stat-label">Available</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{serverInfo.rentedCars}</span>
              <span className="stat-label">Rented</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{serverInfo.totalBookings}</span>
              <span className="stat-label">Total Bookings</span>
            </div>
          </div>
        </div>

        {/* Connection Info */}
        <div className="status-card connection-info">
          <h4>Connection Details</h4>
          <div className="info-item">
            <span className="label">API URL:</span>
            <span className="value api-url">{API_BASE_URL}</span>
          </div>
          <div className="info-item">
            <span className="label">Status:</span>
            <span className={`value ${serverInfo.connected ? 'online' : 'offline'}`}>
              {serverInfo.connected ? 'Online' : 'Offline'}
            </span>
          </div>
          {serverInfo.lastUpdated && (
            <div className="info-item">
              <span className="label">Last Updated:</span>
              <span className="value timestamp">
                {serverInfo.lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>

        {/* Revenue Info (for admins/owners) */}
        {userInfo.userRole === 'admin' || userInfo.userRole === 'owner' ? (
          <div className="status-card revenue-info">
            <h4>Revenue</h4>
            <div className="revenue-amount">
              ${serverInfo.totalRevenue.toLocaleString()}
            </div>
            <span className="revenue-label">Total Revenue</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ServerStatus;
