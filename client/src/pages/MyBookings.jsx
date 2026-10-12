import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AIAssistantButton from '../components/AIAssistantButton';
import '../Styles/styles/MyBookings.css';


const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        setError('Please log in to view your bookings');
        setIsLoading(false);
        return;
      }
      
      const response = await fetch(`http://localhost:3000/api/bookings/user/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      
      const data = await response.json();
      setBookings(data.bookings || []);
      setFilteredBookings(data.bookings || []);
    } catch (err) {
      console.error('Fetch bookings error:', err);
      setError(err.message || 'Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter bookings based on status
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(booking => booking.status === statusFilter));
    }
  }, [bookings, statusFilter]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  };

  const handleViewCar = (carId) => {
    navigate(`/car-details/${carId}`);
  };

  const handleCancelBooking = (booking) => {
    setBookingToCancel(booking);
    setShowCancelModal(true);
  };

  const confirmCancelBooking = async () => {
    if (!bookingToCancel) return;

    try {
      const response = await fetch(`http://localhost:3000/api/bookings/${bookingToCancel._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      // Update local state
      const updatedBookings = bookings.map(booking =>
        booking._id === bookingToCancel._id
          ? { ...booking, status: 'cancelled' }
          : booking
      );
      setBookings(updatedBookings);
      
      setShowCancelModal(false);
      setBookingToCancel(null);
      alert('Booking cancelled successfully');
    } catch (error) {
      console.error('Cancel booking error:', error);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  const handleRebook = (booking) => {
    // Navigate to cars page with the same car pre-selected
    navigate('/cars', {
      state: {
        rebookCar: booking.carId,
        previousBooking: booking
      }
    });
  };

  const canCancelBooking = (booking) => {
    const startDate = new Date(booking.rentalPeriod.startDate);
    const today = new Date();
    const timeDiff = startDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    // Can cancel if booking is confirmed/pending and starts more than 1 day from now
    return (booking.status === 'confirmed' || booking.status === 'pending') && daysDiff > 1;
  };

  if (isLoading) {
    return (
      <div className="my-bookings-container">
        <div className="loading">Loading your bookings...</div>
      </div>
    );
  }

  return (
    <div className="my-bookings-container">
      <h1 className="page-title">My Bookings</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      {/* Booking Filters */}
      {bookings.length > 0 && (
        <div className="booking-filters">
          <div className="filter-section">
            <label htmlFor="status-filter">Filter by Status:</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter-select"
            >
              <option value="all">All Bookings ({bookings.length})</option>
              <option value="confirmed">Confirmed ({bookings.filter(b => b.status === 'confirmed').length})</option>
              <option value="pending">Pending ({bookings.filter(b => b.status === 'pending').length})</option>
              <option value="cancelled">Cancelled ({bookings.filter(b => b.status === 'cancelled').length})</option>
            </select>
          </div>
          <div className="results-count">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </div>
        </div>
      )}
      
      {bookings.length === 0 ? (
        <div className="no-bookings">
          <div className="no-bookings-content">
            <span className="no-bookings-icon">📅</span>
            <h3>No Bookings Found</h3>
            <p>You haven't made any car bookings yet. Browse available cars to make your first booking!</p>
            <button className="browse-cars-btn" onClick={() => navigate('/cars')}>
              Browse Cars
            </button>
          </div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="no-bookings">
          <div className="no-bookings-content">
            <span className="no-bookings-icon">🔍</span>
            <h3>No Bookings Match Filter</h3>
            <p>No bookings found for the selected status. Try changing the filter or browse cars to make a new booking!</p>
            <button className="browse-cars-btn" onClick={() => setStatusFilter('all')}>
              Show All Bookings
            </button>
          </div>
        </div>
      ) : (
        <div className="bookings-grid">
          {filteredBookings.map((booking, index) => (
            <div key={booking._id} className="booking-card-standard">
              {/* Price Tag */}
              <div className="price-tag">
                ${booking.pricing.dailyRate}/day
              </div>

              {/* Car Image */}
              <div className="car-image-container" onClick={() => handleViewCar(booking.carId?._id || booking.carId)}>
                <img 
                  src={booking.carId?.images?.[0]?.url ? `http://localhost:3000${booking.carId.images[0].url}` : '/placeholder-car.jpg'} 
                  alt={`${booking.carId?.make} ${booking.carId?.model}`} 
                  className="car-image"
                  onError={(e) => {
                    e.target.src = '/placeholder-car.jpg';
                  }}
                />
              </div>

              {/* Car Content */}
              <div className="car-content">
                <div className="car-header">
                  <h3 className="car-title">{booking.carId?.make} {booking.carId?.model}</h3>
                  <span className={`booking-status ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="car-specs">
                  <span>{booking.carId?.year}</span>
                  <span>{booking.carId?.type}</span>
                  <span>{booking.carId?.dimensions?.seats} Seats</span>
                </div>

                <div className="booking-info">
                  <div className="rental-period">
                    <strong>Rental Period:</strong>
                    <p>{formatDate(booking.rentalPeriod.startDate)} - {formatDate(booking.rentalPeriod.endDate)}</p>
                  </div>
                  
                  <div className="location">
                    <strong>Location:</strong>
                    <p>{booking.carId?.location?.city}, {booking.carId?.location?.state}</p>
                  </div>

                  <div className="total-price">
                    <strong>Total: ${booking.pricing.totalAmount}</strong>
                  </div>
                </div>

                <div className="booking-actions">
                  <button 
                    className="view-details-btn"
                    onClick={() => handleViewCar(booking.carId?._id || booking.carId)}
                  >
                    View Details
                  </button>
                  
                  {canCancelBooking(booking) && (
                    <button 
                      className="cancel-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelBooking(booking);
                      }}
                    >
                      Cancel
                    </button>
                  )}
                  
                  <button 
                    className="rebook-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRebook(booking);
                    }}
                  >
                    Book Again
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && bookingToCancel && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="cancel-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Cancel Booking</h3>
            <p>Are you sure you want to cancel your booking for:</p>
            <div className="modal-car-info">
              <strong>{bookingToCancel.carId?.make} {bookingToCancel.carId?.model}</strong>
              <br />
              <span>
                {formatDate(bookingToCancel.rentalPeriod.startDate)} - {formatDate(bookingToCancel.rentalPeriod.endDate)}
              </span>
              <br />
              <span className="modal-price">Total: ${bookingToCancel.pricing.totalAmount}</span>
            </div>
            <p className="cancel-warning">
              ⚠️ This action cannot be undone. Please review your cancellation policy.
            </p>
            <div className="modal-actions">
              <button 
                className="confirm-cancel-btn"
                onClick={confirmCancelBooking}
              >
                Yes, Cancel Booking
              </button>
              <button 
                className="keep-booking-btn"
                onClick={() => setShowCancelModal(false)}
              >
                Keep Booking
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* AI Assistant for Booking Help */}
      <div className="ai-assistant-section">
        <AIAssistantButton 
          context="booking" 
          buttonText="AI Booking Assistant - Get Help" 
        />
      </div>
    </div>
  );
};

export default MyBookings;