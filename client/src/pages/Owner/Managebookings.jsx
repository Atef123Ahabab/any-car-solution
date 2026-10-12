import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../Styles/styles/ManageBookings.css';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // Fetch bookings from backend
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user._id) {
        setError('Please log in to view bookings');
        setLoading(false);
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/bookings/owner/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setBookings(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    // Filter by status
    if (filter !== 'all' && booking.status !== filter) {
      return false;
    }
    
    // Filter by search term (search in customer name, car make/model)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const customerName = booking.userId?.name?.toLowerCase() || '';
      const carMake = booking.carId?.make?.toLowerCase() || '';
      const carModel = booking.carId?.model?.toLowerCase() || '';
      
      if (!customerName.includes(searchLower) && 
          !carMake.includes(searchLower) && 
          !carModel.includes(searchLower)) {
        return false;
      }
    }
    
    return true;
  });

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/bookings/${bookingId}/status`, 
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setBookings(bookings.map(booking => 
        booking._id === bookingId ? { ...booking, status: newStatus } : booking
      ));
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Failed to update booking status');
    }
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) {
      return;
    }
    
    try {
      await axios.delete(`http://localhost:5000/api/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setBookings(bookings.filter(booking => booking._id !== bookingId));
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Failed to delete booking');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      case 'completed':
        return 'status-completed';
      case 'active':
        return 'status-active';
      default:
        return 'status-default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="manage-bookings-container">
      <h1 className="manage-bookings-title">Manage Bookings</h1>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      <div className="booking-controls">
        <div className="search-filter-container">
          <input
            type="text"
            placeholder="Search by customer name or car..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select 
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <button className="add-booking-btn" onClick={fetchBookings}>
          🔄 Refresh
        </button>
      </div>
      
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading bookings...</p>
        </div>
      ) : (
        <div className="bookings-table-container">
          {filteredBookings.length === 0 ? (
            <div className="no-bookings">
              <p>No bookings found matching your criteria.</p>
            </div>
          ) : (
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Car</th>
                  <th>Rental Period</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>#{booking._id.slice(-6)}</td>
                    <td>
                      <div>
                        <strong>{booking.userId?.name || 'N/A'}</strong>
                        <br />
                        <small>{booking.userId?.email || ''}</small>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{booking.carId?.make} {booking.carId?.model}</strong>
                        <br />
                        <small>{booking.carId?.year} • {booking.carId?.type}</small>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{formatDate(booking.rentalPeriod?.startDate)}</strong>
                        <br />
                        <small>to {formatDate(booking.rentalPeriod?.endDate)}</small>
                        <br />
                        <small>({booking.rentalPeriod?.totalDays} days)</small>
                      </div>
                    </td>
                    <td>
                      <strong>{formatCurrency(booking.pricing?.totalAmount || 0)}</strong>
                      <br />
                      <small>{formatCurrency(booking.pricing?.dailyRate || 0)}/day</small>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <select
                          className="status-select"
                          value={booking.status}
                          onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDelete(booking._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageBookings;