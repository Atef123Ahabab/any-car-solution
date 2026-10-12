import React, { useState, useEffect } from 'react';
import '../Styles/styles/Statistics.css';

const Statistics = () => {
  const [stats, setStats] = useState({
    activeBookings: [],
    totalCars: 0,
    totalBookings: 0,
    totalRevenue: 0,
    availableCars: 0,
    rentedCars: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/statistics');
      
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError(err.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="statistics-container">
        <div className="loading-spinner">
          <h2>Loading statistics...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="statistics-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={fetchStatistics}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="statistics-container">
      <div className="statistics-header">
        <h1>Car Rental Statistics</h1>
        <p>Overview of current bookings and system performance</p>
      </div>

      {/* Summary Cards */}
      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <h3>{stats.totalCars}</h3>
            <p>Total Cars</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{stats.totalBookings}</h3>
            <p>Total Bookings</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>${stats.totalRevenue?.toLocaleString()}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.availableCars}</h3>
            <p>Available Cars</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <h3>{stats.rentedCars}</h3>
            <p>Currently Rented</p>
          </div>
        </div>
      </div>

      {/* Active Bookings Table */}
      <div className="active-bookings-section">
        <h2>Currently Rented Cars</h2>
        
        {stats.activeBookings && stats.activeBookings.length > 0 ? (
          <div className="bookings-table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Car</th>
                  <th>Renter</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Duration</th>
                  <th>Daily Rate</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.activeBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td className="car-info">
                      <div className="car-details">
                        <img 
                          src={booking.car?.images?.[0]?.url || '/placeholder-car.jpg'} 
                          alt={`${booking.car?.make} ${booking.car?.model}`}
                          className="car-thumbnail"
                          onError={(e) => {
                            e.target.src = '/placeholder-car.jpg';
                          }}
                        />
                        <div>
                          <strong>{booking.car?.year} {booking.car?.make} {booking.car?.model}</strong>
                          <p>{booking.car?.licensePlate}</p>
                        </div>
                      </div>
                    </td>
                    <td className="user-info">
                      <div>
                        <strong>{booking.user?.email}</strong>
                        <p>User ID: {booking.user?._id?.slice(-8)}</p>
                      </div>
                    </td>
                    <td>{formatDate(booking.startDate)}</td>
                    <td>{formatDate(booking.endDate)}</td>
                    <td>{calculateDuration(booking.startDate, booking.endDate)} days</td>
                    <td>${booking.car?.pricing?.dailyRate}</td>
                    <td>${booking.totalAmount}</td>
                    <td>
                      <span className={`status-badge ${booking.status}`}>
                        {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-bookings">
            <h3>No Active Bookings</h3>
            <p>There are currently no cars being rented.</p>
          </div>
        )}
      </div>

      {/* Additional Statistics */}
      <div className="additional-stats">
        <div className="chart-section">
          <h3>Quick Insights</h3>
          <div className="insights-grid">
            <div className="insight-item">
              <span className="insight-label">Utilization Rate</span>
              <span className="insight-value">
                {stats.totalCars > 0 ? Math.round((stats.rentedCars / stats.totalCars) * 100) : 0}%
              </span>
            </div>
            <div className="insight-item">
              <span className="insight-label">Average Revenue per Car</span>
              <span className="insight-value">
                ${stats.totalCars > 0 ? Math.round(stats.totalRevenue / stats.totalCars) : 0}
              </span>
            </div>
            <div className="insight-item">
              <span className="insight-label">Active Bookings</span>
              <span className="insight-value">{stats.activeBookings?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
