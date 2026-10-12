import React, { useState } from 'react';
import '../Styles/styles/CarCard.css';

const CarCard = ({ car, onBookNow, onViewDetails }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Handle different car data structures (legacy and new)
  const carData = {
    id: car._id || car.id,
    make: car.make || car.brand,
    model: car.model,
    year: car.year,
    type: car.type || car.category,
    image: car.images?.[0]?.url ? `http://localhost:3000${car.images[0].url}` : car.image,
    pricing: car.pricing || { dailyRate: car.pricePerDay },
    availability: car.availability || { isAvailable: car.isAvailable },
    specifications: car.specifications || {
      transmission: car.transmission,
      fuelType: car.fuelType
    },
    dimensions: car.dimensions || { seats: car.seating_capacity },
    location: car.location || { city: car.location },
    rating: car.rating || { average: 4.5, count: 0 },
    features: car.features || {},
    condition: car.condition || 'good'
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const formatPrice = (price) => {
    return typeof price === 'number' ? price.toFixed(0) : price;
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'excellent': return '#10b981';
      case 'very-good': return '#3b82f6';
      case 'good': return '#f59e0b';
      case 'fair': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">★</span>);
    }
    
    return stars;
  };

  return (
    <div className="car-card" onClick={() => onViewDetails?.(carData)}>
      {/* Price Tag at the top */}
      <div className="price-tag">
        ${formatPrice(carData.pricing.dailyRate)}/day
      </div>

      <div className="car-image-container">
        {isLoading && (
          <div className="image-loading">
            <div className="loading-spinner"></div>
          </div>
        )}
        
        {!imageError ? (
          <img 
            src={carData.image}
            alt={`${carData.make} ${carData.model}`}
            className="car-image"
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ display: isLoading ? 'none' : 'block' }}
          />
        ) : (
          <div className="no-image-placeholder">
            <div className="no-image-icon">🚗</div>
            <p>No Image Available</p>
          </div>
        )}
      </div>

      {/* Car Content */}
      <div className="car-content">
        <div className="car-header">
          <h3 className="car-title">{carData.make} {carData.model}</h3>
          <div className="car-year">{carData.year}</div>
        </div>

        <div className="car-specs">
          <span className="car-type">{carData.type}</span>
          <span className="car-transmission">{carData.specifications?.transmission}</span>
          <span className="car-seats">{carData.dimensions?.seats} seats</span>
        </div>

        <div className="car-location">
          📍 {carData.location?.city}
        </div>

        <div className="car-rating">
          {renderStars(carData.rating?.average || 4.5)}
          <span className="rating-count">({carData.rating?.count || 0})</span>
        </div>

        <div className="car-condition">
          <span 
            className="condition-badge"
            style={{ backgroundColor: getConditionColor(carData.condition) }}
          >
            {carData.condition}
          </span>
        </div>
      </div>

      {/* Book Now Button */}
      <button 
        className="book-now-btn"
        onClick={(e) => {
          e.stopPropagation();
          onBookNow?.(carData);
        }}
      >
        Book Now
      </button>
    </div>
  );
};

export default CarCard; 