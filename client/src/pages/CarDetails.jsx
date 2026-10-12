import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import SocialMediaIntegration from '../components/SocialMediaIntegration';
import '../Styles/styles/CarDetails.css';
import ImageManager from '../components/ImageManager';
import BookingModal from '../components/BookingModal';

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const userId = localStorage.getItem('userId');
  const userType = localStorage.getItem('userType');
  const isOwner = userType === 'owner' && car?.ownerId === userId;

  const fetchCarDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/cars/${id}`);
      
      if (!response.ok) {
        throw new Error('Car not found');
      }
      
      const data = await response.json();
      console.log('Car data received:', data);
      setCar(data.car || data); // Handle both response formats
    } catch (err) {
      console.error('Error fetching car details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImagesUpdate = () => {
    fetchCarDetails(); // Refresh car data after image changes
  };

  const handleBooking = async (bookingData) => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        alert('Please log in to make a booking');
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          carId: bookingData.carId,
          userId: userId,
          rentalPeriod: {
            startDate: bookingData.startDate,
            endDate: bookingData.endDate
          },
          pricing: {
            dailyRate: car.pricing.dailyRate,
            totalAmount: bookingData.totalCost
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }

      const result = await response.json();
      alert('Booking created successfully!');
      setShowBookingModal(false);
      
      // Optionally navigate to bookings page
      navigate('/my-bookings');
    } catch (error) {
      console.error('Booking error:', error);
      alert(error.message || 'Failed to create booking. Please try again.');
    }
  };

  useEffect(() => {
    if (id) {
      fetchCarDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="car-details-container">
        <div className="loading-spinner">
          <h2>Loading car details...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="car-details-container">
        <button className="back-button" onClick={() => navigate(-1)}>← Back to Cars</button>
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="car-details-container">
        <button className="back-button" onClick={() => navigate(-1)}>← Back to Cars</button>
        <div className="error-message">
          <h2>Car not found</h2>
          <p>The requested car could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="car-details-container">
      <button className="back-button" onClick={() => navigate(-1)}>← Back to Cars</button>
      
      <div className="car-header">
        <h1>{car.year} {car.make} {car.model}</h1>
        <h2>{car.type?.charAt(0).toUpperCase() + car.type?.slice(1)} - {car.year}</h2>
        <div className="price-badge">${car.pricing?.dailyRate}/day</div>
      </div>

      <div className="car-content">
        <div className="car-image-container">
          <img 
            src={car.images?.[0]?.url ? (car.images[0].url.startsWith('http') ? car.images[0].url : `${API_BASE_URL.replace('/api', '')}${car.images[0].url}`) : 'https://via.placeholder.com/600x400/cccccc/666666?text=No+Image'} 
            alt={`${car.year} ${car.make} ${car.model}`} 
            className="main-car-image"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/600x400/cccccc/666666?text=No+Image';
            }}
          />
          
          {/* Image Upload Section for Car Owner */}
          {isOwner && (
            <div className="image-upload-section">
              <h3>Manage Car Images</h3>
              <ImageManager 
                car={car} 
                onImagesUpdate={handleImagesUpdate}
              />
            </div>
          )}
          
          {car.images && car.images.length > 1 && (
            <div className="image-gallery">
              {car.images.slice(1, 4).map((image, index) => (
                <img 
                  key={index}
                  src={image.url.startsWith('http') ? image.url : `${API_BASE_URL.replace('/api', '')}${image.url}`} 
                  alt={`${car.make} ${car.model} view ${index + 2}`}
                  className="gallery-image"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200/cccccc/666666?text=No+Image';
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="car-specs">
          <div className="specs-grid">
            <div className="spec-item">
              <span className="spec-label">Transmission</span>
              <span className="spec-value">{car.specifications?.transmission?.charAt(0).toUpperCase() + car.specifications?.transmission?.slice(1) || 'Automatic'}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Seats</span>
              <span className="spec-value">{car.dimensions?.seats || 5} Seats</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Fuel Type</span>
              <span className="spec-value">{car.specifications?.fuelType?.charAt(0).toUpperCase() + car.specifications?.fuelType?.slice(1) || 'Gasoline'}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Location</span>
              <span className="spec-value">{car.location?.city}, {car.location?.state}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Mileage</span>
              <span className="spec-value">{car.mileage?.toLocaleString()} miles</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Engine</span>
              <span className="spec-value">{car.specifications?.engine?.type} {car.specifications?.engine?.displacement || 'N/A'}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Horsepower</span>
              <span className="spec-value">{car.specifications?.engine?.horsepower || 'N/A'} HP</span>
            </div>
          </div>

          <div className="car-description">
            <h3>Description</h3>
            <p>{car.description || `Experience the luxury and performance of this ${car.year} ${car.make} ${car.model}. Perfect for your next adventure or business trip.`}</p>
            
            <div className="additional-info">
              <div className="info-item">
                <span className="info-label">Condition:</span>
                <span className="info-value">{car.condition?.charAt(0).toUpperCase() + car.condition?.slice(1)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">License Plate:</span>
                <span className="info-value">{car.licensePlate}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Fuel Economy:</span>
                <span className="info-value">{car.specifications?.fuelEconomy?.combined || 'N/A'} MPG</span>
              </div>
            </div>
          </div>

          <div className="car-features">
            <h3>Features</h3>
            <div className="features-grid">
              {/* Comfort Features */}
              {car.features?.comfort?.airConditioning && <div className="feature-item">✓ Air Conditioning</div>}
              {car.features?.comfort?.heatedSeats && <div className="feature-item">✓ Heated Seats</div>}
              {car.features?.comfort?.leatherSeats && <div className="feature-item">✓ Leather Seats</div>}
              {car.features?.comfort?.cooledSeats && <div className="feature-item">✓ Cooled Seats</div>}
              {car.features?.comfort?.sunroof && <div className="feature-item">✓ Sunroof</div>}
              {car.features?.comfort?.cruiseControl && <div className="feature-item">✓ Cruise Control</div>}
              
              {/* Technology Features */}
              {car.features?.technology?.bluetooth && <div className="feature-item">✓ Bluetooth</div>}
              {car.features?.technology?.gps && <div className="feature-item">✓ GPS Navigation</div>}
              {car.features?.technology?.rearCamera && <div className="feature-item">✓ Rear View Camera</div>}
              {car.features?.technology?.wifi && <div className="feature-item">✓ WiFi</div>}
              {car.features?.technology?.touchScreen && <div className="feature-item">✓ Touch Screen</div>}
              {car.features?.technology?.appleCarPlay && <div className="feature-item">✓ Apple CarPlay</div>}
              {car.features?.technology?.androidAuto && <div className="feature-item">✓ Android Auto</div>}
              {car.features?.technology?.wirelessCharging && <div className="feature-item">✓ Wireless Charging</div>}
              
              {/* Safety Features */}
              {car.features?.safety?.airbags && <div className="feature-item">✓ Airbags</div>}
              {car.features?.safety?.abs && <div className="feature-item">✓ ABS</div>}
              {car.features?.safety?.stabilityControl && <div className="feature-item">✓ Stability Control</div>}
              {car.features?.safety?.blindSpotMonitoring && <div className="feature-item">✓ Blind Spot Monitoring</div>}
              {car.features?.safety?.laneDepartureWarning && <div className="feature-item">✓ Lane Departure Warning</div>}
              {car.features?.safety?.collisionWarning && <div className="feature-item">✓ Collision Warning</div>}
            </div>
          </div>

          <div className="pricing-details">
            <h3>Pricing</h3>
            <div className="pricing-grid">
              <div className="price-item">
                <span className="price-label">Daily Rate</span>
                <span className="price-value">${car.pricing?.dailyRate}</span>
              </div>
              {car.pricing?.weeklyRate && (
                <div className="price-item">
                  <span className="price-label">Weekly Rate</span>
                  <span className="price-value">${car.pricing.weeklyRate}</span>
                </div>
              )}
              {car.pricing?.monthlyRate && (
                <div className="price-item">
                  <span className="price-label">Monthly Rate</span>
                  <span className="price-value">${car.pricing.monthlyRate}</span>
                </div>
              )}
              {car.pricing?.securityDeposit && (
                <div className="price-item">
                  <span className="price-label">Security Deposit</span>
                  <span className="price-value">${car.pricing.securityDeposit}</span>
                </div>
              )}
            </div>
          </div>

          <div className="availability-status">
            <h3>Availability</h3>
            <div className={`status-badge ${car.availability?.isAvailable ? 'available' : 'unavailable'}`}>
              {car.availability?.isAvailable ? '✓ Available Now' : '✗ Currently Unavailable'}
            </div>
            {car.availability?.availableFrom && (
              <p>Available from: {new Date(car.availability.availableFrom).toLocaleDateString()}</p>
            )}
            {car.availability?.availableUntil && (
              <p>Available until: {new Date(car.availability.availableUntil).toLocaleDateString()}</p>
            )}
          </div>

          <button 
            className={`book-now-button ${!car.availability?.isAvailable ? 'disabled' : ''}`}
            disabled={!car.availability?.isAvailable}
            onClick={() => setShowBookingModal(true)}
          >
            {car.availability?.isAvailable ? 'Book Now' : 'Currently Unavailable'}
          </button>

          {/* Social Media Integration */}
          <SocialMediaIntegration 
            carData={car} 
            userInfo={{
              id: userId,
              name: localStorage.getItem('userName'),
              email: localStorage.getItem('userEmail')
            }}
          />
        </div>
      </div>

      {/* Image Manager for Car Owners */}
      {isOwner && (
        <ImageManager 
          car={car} 
          onImagesUpdate={handleImagesUpdate}
        />
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal 
          car={car}
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          onBooking={handleBooking}
        />
      )}
    </div>
  );
};

export default CarDetails;