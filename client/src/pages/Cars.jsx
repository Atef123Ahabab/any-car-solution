import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import SocialMediaIntegration from '../components/SocialMediaIntegration';
import CarImageUpload from '../components/CarImageUpload';
import AIAssistantButton from '../components/AIAssistantButton';
import ChatButton from '../components/ChatButton';
import ServerStatus from '../components/ServerStatus';
import CarCard from './CarCard';
// import { useNotifications } from '../hooks/useNotifications';
import '../Styles/styles/Cars.css';
import '../Styles/styles/AIAssistantSections.css';

const Cars = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // const { sendBookingNotification } = useNotifications();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [searchInfo, setSearchInfo] = useState(null);
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');

  const fetchCars = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching cars from:', `${API_BASE_URL}/api/cars`);
      
      const response = await fetch(`${API_BASE_URL}/api/cars`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch cars`);
      }
      
      const data = await response.json();
      console.log('Received data:', data);
      
      if (data.cars) {
        setCars(data.cars);
        console.log('Set cars count:', data.cars.length);
      } else if (Array.isArray(data)) {
        setCars(data);
        console.log('Set cars count (array):', data.length);
      } else {
        console.warn('Unexpected data format:', data);
        setCars([]);
      }
    } catch (err) {
      console.error('Error fetching cars:', err);
      setError(`Failed to load cars: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function fetchCarsFromState() {
      try {
        setLoading(true);
        
        // Check if we have search results from navigation state
        if (location.state?.searchResults) {
          setCars(location.state.searchResults);
          setSearchInfo({
            query: location.state.searchQuery,
            resultsCount: location.state.resultsCount,
            filters: location.state.filters
          });
          setLoading(false);
          return;
        }

        // Otherwise fetch all cars
        await fetchCars();
      } catch (err) {
        console.error('Error fetching cars:', err);
        setError('Failed to load cars. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchCarsFromState();
  }, [location.state, fetchCars]);

  const handleViewDetails = (car) => {
    const carId = car.id || car._id;
    navigate(`/car-details/${carId}`);
  };

  const handleBookNow = useCallback((car) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      setError('Please log in to book a car');
      return;
    }
    setSelectedCar(car);
    setShowBookingModal(true);
  }, []);

  const handleBookingSubmit = useCallback(async (bookingData) => {
    setBookingLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bookingData,
          carId: selectedCar._id,
          userId: userId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }

      const result = await response.json();
      
      // Send booking notification
      // await sendBookingNotification({
      //   type: 'new_booking',
      //   bookingId: result._id,
      //   carDetails: selectedCar,
      //   customerDetails: bookingData
      // });
      
      alert('Booking created successfully!');
      setShowBookingModal(false);
      setSelectedCar(null);
      
      // Refresh cars to update availability
      fetchCars();
    } catch (err) {
      console.error('Booking error:', err);
      alert(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  }, [selectedCar, userId, fetchCars]);

  if (loading) {
    return (
      <div className="cars-container">
        <div className="loading-spinner">
          <h2>Loading cars...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cars-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cars-container">
      {searchInfo ? (
        <div className="search-results-header">
          <h1>Search Results</h1>
          <p className="search-info">
            {searchInfo.resultsCount} cars found for "{searchInfo.query}"
            {searchInfo.filters?.location && ` in ${searchInfo.filters.location}`}
          </p>
          <button 
            className="clear-search-btn"
            onClick={() => {
              setSearchInfo(null);
              window.location.reload();
            }}
          >
            View All Cars
          </button>
        </div>
      ) : (
        <div className="cars-header">
          <h1>Available Cars</h1>
          <p>Find your perfect rental car</p>
          
          {/* Social Media Integration for Cars Page */}
          <div className="cars-social-section">
            <SocialMediaIntegration 
              carData={null} 
              userInfo={{
                id: userId,
                name: localStorage.getItem('userName'),
                email: localStorage.getItem('userEmail')
              }}
            />
          </div>
        </div>
      )}
      
      {/* Server Status Component */}
      <ServerStatus />
      
      <div className="cars-grid">
        {cars.length === 0 ? (
          <div className="no-cars">
            <h3>No cars available</h3>
            <p>Please check back later or try adjusting your search criteria.</p>
          </div>
        ) : (
          cars.map(car => (
            <CarCard 
              key={car._id}
              car={car}
              onBookNow={(car) => {
                setSelectedCar(car);
                setShowBookingModal(true);
              }}
              onViewDetails={(car) => {
                navigate(`/car-details/${car.id}`);
              }}
              userRole={userRole}
            />
          ))
        )}
      </div>

      <div className="explore-more">
        <button className="explore-button">Explore all cars →</button>
      </div>

      <div className="owner-banner">
        <h3>Do You Own a Luxury Car?</h3>
        <p>
          Monetize your vehicle effortlessly by listing it on CarRental.
          We take care of insurance, driver verification and secure payments – 
          so you can earn passive income, stress-free.
        </p>
        <button className="list-button">List your car</button>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedCar && (
        <BookingModal 
          car={selectedCar}
          onSubmit={handleBookingSubmit}
          onCancel={() => {
            setShowBookingModal(false);
            setSelectedCar(null);
          }}
          loading={bookingLoading}
        />
      )}
    </div>
  );
};

// Booking Modal Component
const BookingModal = ({ car, onSubmit, onCancel, loading }) => {
  const [bookingData, setBookingData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    pickupDate: '',
    returnDate: '',
    pickupLocation: car.location?.city + ', ' + car.location?.state || '',
    returnLocation: car.location?.city + ', ' + car.location?.state || '',
    specialRequests: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Calculate rental duration and total cost
    const pickup = new Date(bookingData.pickupDate);
    const returnDate = new Date(bookingData.returnDate);
    const days = Math.ceil((returnDate - pickup) / (1000 * 60 * 60 * 24));
    const totalCost = days * car.pricing.dailyRate;
    
    onSubmit({
      ...bookingData,
      rentalDuration: days,
      pricing: {
        dailyRate: car.pricing.dailyRate,
        totalCost: totalCost,
        currency: car.pricing.currency || 'USD'
      }
    });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="modal-overlay">
      <div className="modal-content booking-modal">
        <h2>Book {car.year} {car.make} {car.model}</h2>
        <div className="car-booking-summary">
          <img 
            src={car.images?.[0]?.url ? (car.images[0].url.startsWith('http') ? car.images[0].url : `${API_BASE_URL.replace('/api', '')}${car.images[0].url}`) : '/placeholder-car.jpg'} 
            alt={`${car.year} ${car.make} ${car.model}`}
            className="booking-car-image"
          />
          <div className="booking-car-details">
            <h3>{car.year} {car.make} {car.model}</h3>
            <p className="daily-rate">${car.pricing.dailyRate}/day</p>
            <p className="car-location">{car.location?.city}, {car.location?.state}</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-section">
            <h4>Customer Information</h4>
            <div className="form-row">
              <input
                type="text"
                placeholder="Full Name"
                value={bookingData.customerName}
                onChange={(e) => setBookingData({...bookingData, customerName: e.target.value})}
                required
              />
              <input
                type="email"
                placeholder="Email Address"
                value={bookingData.customerEmail}
                onChange={(e) => setBookingData({...bookingData, customerEmail: e.target.value})}
                required
              />
            </div>
            <input
              type="tel"
              placeholder="Phone Number"
              value={bookingData.customerPhone}
              onChange={(e) => setBookingData({...bookingData, customerPhone: e.target.value})}
              required
            />
          </div>

          <div className="form-section">
            <h4>Rental Details</h4>
            <div className="form-row">
              <div className="date-field">
                <label>Pickup Date</label>
                <input
                  type="date"
                  value={bookingData.pickupDate}
                  onChange={(e) => setBookingData({...bookingData, pickupDate: e.target.value})}
                  min={today}
                  required
                />
              </div>
              <div className="date-field">
                <label>Return Date</label>
                <input
                  type="date"
                  value={bookingData.returnDate}
                  onChange={(e) => setBookingData({...bookingData, returnDate: e.target.value})}
                  min={bookingData.pickupDate || today}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <input
                type="text"
                placeholder="Pickup Location"
                value={bookingData.pickupLocation}
                onChange={(e) => setBookingData({...bookingData, pickupLocation: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Return Location"
                value={bookingData.returnLocation}
                onChange={(e) => setBookingData({...bookingData, returnLocation: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h4>Additional Information</h4>
            <textarea
              placeholder="Special requests or notes (optional)"
              value={bookingData.specialRequests}
              onChange={(e) => setBookingData({...bookingData, specialRequests: e.target.value})}
              rows="3"
            />
          </div>

          {bookingData.pickupDate && bookingData.returnDate && (
            <div className="booking-summary">
              <div className="cost-breakdown">
                <div className="cost-item">
                  <span>Daily Rate:</span>
                  <span>${car.pricing.dailyRate}</span>
                </div>
                <div className="cost-item">
                  <span>Duration:</span>
                  <span>{Math.ceil((new Date(bookingData.returnDate) - new Date(bookingData.pickupDate)) / (1000 * 60 * 60 * 24))} days</span>
                </div>
                <div className="cost-item total">
                  <span>Total Cost:</span>
                  <span>${Math.ceil((new Date(bookingData.returnDate) - new Date(bookingData.pickupDate)) / (1000 * 60 * 60 * 24)) * car.pricing.dailyRate}</span>
                </div>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Cars;