import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AIAssistantButton from '../../components/AIAssistantButton';
import '../../Styles/styles/ManageCars.css';

const ManageCars = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCar, setSelectedCar] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filter, setFilter] = useState({
    status: 'all',
    fuelType: 'all',
    availability: 'all'
  });

  useEffect(() => {
    fetchOwnerCars();
  }, []);

  const fetchOwnerCars = async () => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        setError('Please log in to view your cars');
        setIsLoading(false);
        return;
      }
      
      const response = await fetch(`http://localhost:3000/api/cars/owner/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch cars');
      }
      
      const data = await response.json();
      setCars(data.cars || []);
    } catch (err) {
      console.error('Fetch cars error:', err);
      setError(err.message || 'Failed to load cars');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCar = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this car?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3000/api/cars/${carId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete car');
      }
      
      // Remove car from local state
      setCars(prev => prev.filter(car => car._id !== carId));
      setShowDetails(false);
      setSelectedCar(null);
    } catch (err) {
      console.error('Delete car error:', err);
      setError(err.message || 'Failed to delete car');
    }
  };

  const toggleAvailability = async (carId, currentAvailability) => {
    try {
      const response = await fetch(`http://localhost:3000/api/cars/${carId}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isAvailable: !currentAvailability
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update availability');
      }
      
      // Update local state
      setCars(prev => prev.map(car => 
        car._id === carId 
          ? { ...car, availability: { ...car.availability, isAvailable: !currentAvailability } }
          : car
      ));
    } catch (err) {
      console.error('Toggle availability error:', err);
      setError(err.message || 'Failed to update availability');
    }
  };

  const getFilteredCars = () => {
    return cars.filter(car => {
      if (filter.status !== 'all' && car.status !== filter.status) return false;
      if (filter.fuelType !== 'all' && car.specifications?.fuelType !== filter.fuelType) return false;
      if (filter.availability !== 'all') {
        const isAvailable = car.availability?.isAvailable;
        if (filter.availability === 'available' && !isAvailable) return false;
        if (filter.availability === 'unavailable' && isAvailable) return false;
      }
      return true;
    });
  };

  const CarCard = ({ car }) => (
    <div className="car-card">
      <div className="car-image">
        {car.images && car.images.length > 0 ? (
          <img 
            src={`http://localhost:3000${car.images.find(img => img.isPrimary)?.url || car.images[0]?.url}`} 
            alt={car.fullName || `${car.make} ${car.model}`}
            onError={(e) => {
              e.target.src = '/placeholder-car.jpg';
            }}
          />
        ) : (
          <div className="no-image">
            <span>📷</span>
            <p>No Image</p>
          </div>
        )}
        
        <div className="car-status">
          <span className={`status-badge ${car.status}`}>
            {car.status?.toUpperCase()}
          </span>
          <span className={`availability-badge ${car.availability?.isAvailable ? 'available' : 'unavailable'}`}>
            {car.availability?.isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>
      
      <div className="car-info">
        <h3>{car.year} {car.make} {car.model}</h3>
        <p className="car-type">{car.type?.toUpperCase()}</p>
        
        <div className="car-specs">
          <span>🚗 {car.specifications?.transmission}</span>
          <span>⛽ {car.specifications?.fuelType}</span>
          <span>👥 {car.dimensions?.seats} seats</span>
        </div>
        
        <div className="car-pricing">
          <span className="daily-rate">${car.pricing?.dailyRate}/day</span>
          {car.pricing?.weeklyRate && (
            <span className="weekly-rate">${car.pricing.weeklyRate}/week</span>
          )}
        </div>
        
        <div className="car-actions">
          <button 
            className="view-btn"
            onClick={() => {
              setSelectedCar(car);
              setShowDetails(true);
            }}
          >
            View Details
          </button>
          
          <button 
            className="edit-btn"
            onClick={() => navigate(`/edit-car/${car._id}`)}
          >
            Edit
          </button>
          
          <button 
            className={`availability-btn ${car.availability?.isAvailable ? 'make-unavailable' : 'make-available'}`}
            onClick={() => toggleAvailability(car._id, car.availability?.isAvailable)}
          >
            {car.availability?.isAvailable ? 'Make Unavailable' : 'Make Available'}
          </button>
          
          <button 
            className="delete-btn"
            onClick={() => handleDeleteCar(car._id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  const CarDetailsModal = ({ car, onClose }) => {
    if (!car) return null;
    
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{car.year} {car.make} {car.model}</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          
          <div className="modal-body">
            {/* Image Gallery */}
            {car.images && car.images.length > 0 && (
              <div className="image-gallery">
                <h3>📸 Images</h3>
                <div className="images-grid">
                  {car.images.map((image, index) => (
                    <img 
                      key={index}
                      src={`http://localhost:3000${image.url}`}
                      alt={image.alt || `${car.make} ${car.model} ${index + 1}`}
                      className={image.isPrimary ? 'primary-image' : ''}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Basic Info */}
            <div className="details-section">
              <h3>🚗 Basic Information</h3>
              <div className="details-grid">
                <div><strong>Type:</strong> {car.type}</div>
                <div><strong>Condition:</strong> {car.condition}</div>
                <div><strong>Mileage:</strong> {car.mileage ? `${car.mileage.toLocaleString()} miles` : 'Not specified'}</div>
                <div><strong>License Plate:</strong> {car.licensePlate || 'Not specified'}</div>
              </div>
            </div>
            
            {/* Engine Specs */}
            <div className="details-section">
              <h3>⚙️ Engine & Performance</h3>
              <div className="details-grid">
                <div><strong>Engine:</strong> {car.specifications?.engine?.type || 'Not specified'}</div>
                <div><strong>Displacement:</strong> {car.specifications?.engine?.displacement || 'Not specified'}</div>
                <div><strong>Horsepower:</strong> {car.specifications?.engine?.horsepower ? `${car.specifications.engine.horsepower} HP` : 'Not specified'}</div>
                <div><strong>Torque:</strong> {car.specifications?.engine?.torque || 'Not specified'}</div>
                <div><strong>Transmission:</strong> {car.specifications?.transmission}</div>
                <div><strong>Fuel Type:</strong> {car.specifications?.fuelType}</div>
                <div><strong>Drivetrain:</strong> {car.specifications?.drivetrain?.toUpperCase()}</div>
              </div>
            </div>
            
            {/* Fuel Economy */}
            {(car.specifications?.fuelEconomy?.city || car.specifications?.fuelEconomy?.highway) && (
              <div className="details-section">
                <h3>⛽ Fuel Economy</h3>
                <div className="details-grid">
                  {car.specifications.fuelEconomy.city && <div><strong>City:</strong> {car.specifications.fuelEconomy.city} MPG</div>}
                  {car.specifications.fuelEconomy.highway && <div><strong>Highway:</strong> {car.specifications.fuelEconomy.highway} MPG</div>}
                  {car.specifications.fuelEconomy.combined && <div><strong>Combined:</strong> {car.specifications.fuelEconomy.combined} MPG</div>}
                </div>
              </div>
            )}
            
            {/* Features */}
            <div className="details-section">
              <h3>✨ Features</h3>
              
              {/* Safety Features */}
              <div className="feature-category">
                <h4>🛡️ Safety</h4>
                <div className="features-list">
                  {Object.entries(car.features?.safety || {}).filter(([_, value]) => value).map(([feature, _]) => (
                    <span key={feature} className="feature-tag">
                      {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Comfort Features */}
              <div className="feature-category">
                <h4>🛋️ Comfort</h4>
                <div className="features-list">
                  {Object.entries(car.features?.comfort || {}).filter(([_, value]) => value).map(([feature, _]) => (
                    <span key={feature} className="feature-tag">
                      {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Technology Features */}
              <div className="feature-category">
                <h4>📱 Technology</h4>
                <div className="features-list">
                  {Object.entries(car.features?.technology || {}).filter(([key, value]) => {
                    if (key === 'usbPorts') return value > 0;
                    return value === true;
                  }).map(([feature, value]) => (
                    <span key={feature} className="feature-tag">
                      {feature === 'usbPorts' 
                        ? `${value} USB Ports`
                        : feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
                      }
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Location */}
            <div className="details-section">
              <h3>📍 Location</h3>
              <div className="location-info">
                <p>{car.location?.address}</p>
                <p>{car.location?.city}, {car.location?.state} {car.location?.zipCode}</p>
              </div>
            </div>
            
            {/* Pricing */}
            <div className="details-section">
              <h3>💰 Pricing</h3>
              <div className="pricing-info">
                <div className="price-item">
                  <strong>Daily:</strong> ${car.pricing?.dailyRate}
                </div>
                {car.pricing?.weeklyRate && (
                  <div className="price-item">
                    <strong>Weekly:</strong> ${car.pricing.weeklyRate}
                  </div>
                )}
                {car.pricing?.monthlyRate && (
                  <div className="price-item">
                    <strong>Monthly:</strong> ${car.pricing.monthlyRate}
                  </div>
                )}
              </div>
            </div>
            
            {/* Description */}
            <div className="details-section">
              <h3>📝 Description</h3>
              <p className="description">{car.description}</p>
            </div>
            
            {/* Stats */}
            <div className="details-section">
              <h3>📊 Statistics</h3>
              <div className="stats-grid">
                <div><strong>Views:</strong> {car.views || 0}</div>
                <div><strong>Bookings:</strong> {car.bookings || 0}</div>
                <div><strong>Rating:</strong> {car.rating?.average || 0}/5 ({car.rating?.count || 0} reviews)</div>
                <div><strong>Added:</strong> {new Date(car.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
          
          <div className="modal-actions">
            <button className="edit-btn" onClick={() => {
              onClose();
              navigate(`/edit-car/${car._id}`);
            }}>
              Edit Car
            </button>
            <button className="delete-btn" onClick={() => handleDeleteCar(car._id)}>
              Delete Car
            </button>
          </div>
        </div>
      </div>
    );
  };

  const filteredCars = getFilteredCars();

  if (isLoading) {
    return (
      <div className="manage-cars-container">
        <div className="loading">Loading your cars...</div>
      </div>
    );
  }

  return (
    <div className="manage-cars-container">
      <div className="manage-cars-header">
        <button className="back-btn" onClick={() => navigate('/owner-dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>Manage Your Cars</h1>
        <button 
          className="add-car-btn"
          onClick={() => navigate('/add-car')}
        >
          + Add New Car
        </button>
      </div>
      <div className="page-header">
      </div>

      {/* Filters */}
      <div className="filters-section">
        <h3>🔍 Filter Cars</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={filter.status} 
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="rented">Rented</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Fuel Type:</label>
            <select 
              value={filter.fuelType} 
              onChange={(e) => setFilter(prev => ({ ...prev, fuelType: e.target.value }))}
            >
              <option value="all">All Fuel Types</option>
              <option value="gasoline">Gasoline</option>
              <option value="diesel">Diesel</option>
              <option value="hybrid">Hybrid</option>
              <option value="electric">Electric</option>
              <option value="plug-in-hybrid">Plug-in Hybrid</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Availability:</label>
            <select 
              value={filter.availability} 
              onChange={(e) => setFilter(prev => ({ ...prev, availability: e.target.value }))}
            >
              <option value="all">All</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Cars Grid */}
      <div className="cars-section">
        <div className="cars-summary">
          <h3>📊 Your Fleet Summary</h3>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-number">{cars.length}</span>
              <span className="stat-label">Total Cars</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{cars.filter(car => car.availability?.isAvailable).length}</span>
              <span className="stat-label">Available</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{cars.filter(car => car.status === 'rented').length}</span>
              <span className="stat-label">Rented</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{cars.reduce((sum, car) => sum + (car.views || 0), 0)}</span>
              <span className="stat-label">Total Views</span>
            </div>
          </div>
        </div>

        {filteredCars.length === 0 ? (
          <div className="no-cars">
            <div className="no-cars-content">
              <span className="no-cars-icon">🚗</span>
              <h3>No Cars Found</h3>
              <p>
                {cars.length === 0 
                  ? "You haven't added any cars yet. Start by adding your first car to rent it out!"
                  : "No cars match your current filters. Try adjusting the filters above."
                }
              </p>
              {cars.length === 0 && (
                <button className="add-first-car-btn" onClick={() => navigate('/add-car')}>
                  Add Your First Car
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="cars-grid">
            {filteredCars.map(car => (
              <CarCard key={car._id} car={car} />
            ))}
          </div>
        )}
      </div>

      {/* Car Details Modal */}
      {showDetails && selectedCar && (
        <CarDetailsModal 
          car={selectedCar} 
          onClose={() => {
            setShowDetails(false);
            setSelectedCar(null);
          }} 
        />
      )}
      
      {/* AI Assistant for Car Management */}
      <div className="ai-assistant-section">
        <AIAssistantButton 
          context="manage" 
          buttonText="AI Car Management Assistant" 
        />
      </div>
    </div>
  );
};

export default ManageCars;
