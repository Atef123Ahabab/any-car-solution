import React, { useState } from 'react';
import '../Styles/styles/BookingModal.css';

const BookingModal = ({ car, isOpen, onClose, onBooking }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    setLoading(true);
    try {
      // Calculate total days and cost
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      const totalCost = days * car.pricing.dailyRate;

      // Call the booking handler
      await onBooking({
        carId: car._id,
        startDate,
        endDate,
        totalCost,
        days
      });

      // Reset form
      setStartDate('');
      setEndDate('');
      onClose();
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Book {car.year} {car.make} {car.model}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          <div className="car-summary">
            <img 
              src={car.images?.[0]?.url || 'https://via.placeholder.com/200x150/cccccc/666666?text=No+Image'} 
              alt={`${car.make} ${car.model}`}
              className="car-thumbnail"
            />
            <div className="car-info">
              <h3>{car.year} {car.make} {car.model}</h3>
              <p className="price">${car.pricing.dailyRate}/day</p>
              <p className="location">{car.location.city}, {car.location.state}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="booking-form">
            <div className="date-inputs">
              <div className="input-group">
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="endDate">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            {startDate && endDate && (
              <div className="booking-summary">
                <div className="summary-row">
                  <span>Duration:</span>
                  <span>{Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))} days</span>
                </div>
                <div className="summary-row">
                  <span>Daily Rate:</span>
                  <span>${car.pricing.dailyRate}</span>
                </div>
                <div className="summary-row total">
                  <span>Total Cost:</span>
                  <span>${Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) * car.pricing.dailyRate}</span>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="book-btn" disabled={loading}>
                {loading ? 'Booking...' : 'Book Now'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
