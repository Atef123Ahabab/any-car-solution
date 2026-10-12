import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Styles/styles/AddCar.css';

const AddCar = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [carData, setCarData] = useState({
    // Basic Information
    make: '',
    model: '',
    year: new Date().getFullYear(),
    type: 'sedan',
    condition: 'good',
    mileage: '',
    licensePlate: '',
    description: '',
    
    // Pricing
    pricing: {
      dailyRate: '',
      weeklyRate: '',
      monthlyRate: '',
      currency: 'USD'
    },
    
    // Specifications
    specifications: {
      engine: {
        type: '',
        displacement: '',
        horsepower: '',
        torque: ''
      },
      transmission: 'automatic',
      fuelType: 'gasoline',
      fuelEconomy: {
        city: '',
        highway: '',
        combined: ''
      },
      drivetrain: 'fwd'
    },
    
    // Dimensions
    dimensions: {
      seats: 5,
      doors: 4,
      luggage: '',
      length: '',
      width: '',
      height: ''
    },
    
    // Features
    features: {
      safety: {
        airbags: false,
        abs: false,
        stabilityControl: false,
        tractionControl: false,
        blindSpotMonitoring: false,
        laneDepartureWarning: false,
        collisionWarning: false
      },
      comfort: {
        airConditioning: false,
        heatedSeats: false,
        cooledSeats: false,
        leatherSeats: false,
        sunroof: false,
        powerWindows: false,
        powerLocks: false,
        cruiseControl: false
      },
      technology: {
        bluetooth: false,
        wifi: false,
        gps: false,
        rearCamera: false,
        dashCamera: false,
        touchScreen: false,
        appleCarPlay: false,
        androidAuto: false,
        usbPorts: 0,
        wirelessCharging: false
      }
    },
    
    // Location
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    
    // Availability
    availability: {
      isAvailable: true,
      availableFrom: new Date().toISOString().split('T')[0],
      availableUntil: ''
    }
  });
  
  const [images, setImages] = useState([]);
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: localStorage.getItem('userEmail') || ''
  });
  
  const handleInputChange = (section, field, value, subField = null) => {
    setCarData(prev => {
      if (subField) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: {
              ...prev[section][field],
              [subField]: value
            }
          }
        };
      } else if (section) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        };
      } else {
        return {
          ...prev,
          [field]: value
        };
      }
    });
  };
  
  const handleFeatureChange = (category, feature, value) => {
    setCarData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [category]: {
          ...prev.features[category],
          [feature]: value
        }
      }
    }));
  };
  
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const formData = new FormData();
      
      // Add car data
      formData.append('carData', JSON.stringify(carData));
      formData.append('ownerId', localStorage.getItem('userId'));
      formData.append('contactPhone', contactInfo.phone);
      formData.append('contactEmail', contactInfo.email);
      
      // Add images
      images.forEach((image, index) => {
        formData.append('images', image);
      });
      
      const response = await fetch('http://localhost:3000/api/cars/add', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add car');
      }
      
      const result = await response.json();
      setSuccess('Car added successfully!');
      
      // Reset form after 2 seconds
      setTimeout(() => {
        navigate('/manage-cars');
      }, 2000);
      
    } catch (err) {
      console.error('Add car error:', err);
      setError(err.message || 'Failed to add car');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="add-car-container">
      <div className="add-car-header">
        <button className="back-btn" onClick={() => navigate('/owner-dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>Add New Car</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="add-car-form">
        {/* Basic Information Section */}
        <div className="form-section">
          <h2>🚗 Basic Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Make *</label>
              <input
                type="text"
                value={carData.make}
                onChange={(e) => handleInputChange(null, 'make', e.target.value)}
                placeholder="e.g., Toyota, BMW, Tesla"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Model *</label>
              <input
                type="text"
                value={carData.model}
                onChange={(e) => handleInputChange(null, 'model', e.target.value)}
                placeholder="e.g., Camry, X5, Model 3"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Year *</label>
              <input
                type="number"
                value={carData.year}
                onChange={(e) => handleInputChange(null, 'year', parseInt(e.target.value))}
                min="1900"
                max={new Date().getFullYear() + 1}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Car Type *</label>
              <select
                value={carData.type}
                onChange={(e) => handleInputChange(null, 'type', e.target.value)}
                required
              >
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="hatchback">Hatchback</option>
                <option value="coupe">Coupe</option>
                <option value="convertible">Convertible</option>
                <option value="truck">Truck</option>
                <option value="van">Van</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Condition</label>
              <select
                value={carData.condition}
                onChange={(e) => handleInputChange(null, 'condition', e.target.value)}
              >
                <option value="excellent">Excellent</option>
                <option value="very-good">Very Good</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Mileage</label>
              <input
                type="number"
                value={carData.mileage}
                onChange={(e) => handleInputChange(null, 'mileage', parseInt(e.target.value))}
                placeholder="Current mileage"
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label>License Plate</label>
              <input
                type="text"
                value={carData.licensePlate}
                onChange={(e) => handleInputChange(null, 'licensePlate', e.target.value.toUpperCase())}
                placeholder="ABC-1234"
              />
            </div>
          </div>
        </div>
        
        {/* Images Section */}
        <div className="form-section">
          <h2>📸 Car Images</h2>
          <div className="form-group">
            <label>Upload Images (Max 10)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
            />
            <p className="help-text">First image will be the primary image</p>
            {images.length > 0 && (
              <div className="image-preview">
                <p>{images.length} image(s) selected</p>
                <ul>
                  {Array.from(images).map((file, index) => (
                    <li key={index}>
                      {file.name} {index === 0 && '(Primary)'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {/* Pricing Section */}
        <div className="form-section">
          <h2>💰 Pricing</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Daily Rate ($) *</label>
              <input
                type="number"
                value={carData.pricing.dailyRate}
                onChange={(e) => handleInputChange('pricing', 'dailyRate', parseFloat(e.target.value))}
                placeholder="50.00"
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Weekly Rate ($)</label>
              <input
                type="number"
                value={carData.pricing.weeklyRate}
                onChange={(e) => handleInputChange('pricing', 'weeklyRate', parseFloat(e.target.value))}
                placeholder="300.00"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="form-group">
              <label>Monthly Rate ($)</label>
              <input
                type="number"
                value={carData.pricing.monthlyRate}
                onChange={(e) => handleInputChange('pricing', 'monthlyRate', parseFloat(e.target.value))}
                placeholder="1000.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>
        
        {/* Engine & Performance Section */}
        <div className="form-section">
          <h2>⚙️ Engine & Performance</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Engine Type</label>
              <input
                type="text"
                value={carData.specifications.engine.type}
                onChange={(e) => handleInputChange('specifications', 'engine', e.target.value, 'type')}
                placeholder="e.g., V6, I4, Electric"
              />
            </div>
            
            <div className="form-group">
              <label>Displacement</label>
              <input
                type="text"
                value={carData.specifications.engine.displacement}
                onChange={(e) => handleInputChange('specifications', 'engine', e.target.value, 'displacement')}
                placeholder="e.g., 2.0L, 3.5L"
              />
            </div>
            
            <div className="form-group">
              <label>Horsepower</label>
              <input
                type="number"
                value={carData.specifications.engine.horsepower}
                onChange={(e) => handleInputChange('specifications', 'engine', parseInt(e.target.value), 'horsepower')}
                placeholder="200"
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label>Torque</label>
              <input
                type="text"
                value={carData.specifications.engine.torque}
                onChange={(e) => handleInputChange('specifications', 'engine', e.target.value, 'torque')}
                placeholder="e.g., 250 lb-ft"
              />
            </div>
            
            <div className="form-group">
              <label>Transmission *</label>
              <select
                value={carData.specifications.transmission}
                onChange={(e) => handleInputChange('specifications', 'transmission', e.target.value)}
                required
              >
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
                <option value="cvt">CVT</option>
                <option value="dual-clutch">Dual-Clutch</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Fuel Type *</label>
              <select
                value={carData.specifications.fuelType}
                onChange={(e) => handleInputChange('specifications', 'fuelType', e.target.value)}
                required
              >
                <option value="gasoline">Gasoline</option>
                <option value="diesel">Diesel</option>
                <option value="hybrid">Hybrid</option>
                <option value="electric">Electric</option>
                <option value="plug-in-hybrid">Plug-in Hybrid</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Drivetrain</label>
              <select
                value={carData.specifications.drivetrain}
                onChange={(e) => handleInputChange('specifications', 'drivetrain', e.target.value)}
              >
                <option value="fwd">Front-Wheel Drive</option>
                <option value="rwd">Rear-Wheel Drive</option>
                <option value="awd">All-Wheel Drive</option>
                <option value="4wd">4-Wheel Drive</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Fuel Economy Section */}
        <div className="form-section">
          <h2>⛽ Fuel Economy (MPG)</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>City MPG</label>
              <input
                type="number"
                value={carData.specifications.fuelEconomy.city}
                onChange={(e) => handleInputChange('specifications', 'fuelEconomy', parseFloat(e.target.value), 'city')}
                placeholder="25"
                min="0"
                step="0.1"
              />
            </div>
            
            <div className="form-group">
              <label>Highway MPG</label>
              <input
                type="number"
                value={carData.specifications.fuelEconomy.highway}
                onChange={(e) => handleInputChange('specifications', 'fuelEconomy', parseFloat(e.target.value), 'highway')}
                placeholder="35"
                min="0"
                step="0.1"
              />
            </div>
            
            <div className="form-group">
              <label>Combined MPG</label>
              <input
                type="number"
                value={carData.specifications.fuelEconomy.combined}
                onChange={(e) => handleInputChange('specifications', 'fuelEconomy', parseFloat(e.target.value), 'combined')}
                placeholder="30"
                min="0"
                step="0.1"
              />
            </div>
          </div>
        </div>
        
        {/* Dimensions Section */}
        <div className="form-section">
          <h2>📏 Dimensions & Capacity</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Seats *</label>
              <input
                type="number"
                value={carData.dimensions.seats}
                onChange={(e) => handleInputChange('dimensions', 'seats', parseInt(e.target.value))}
                min="1"
                max="15"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Doors</label>
              <input
                type="number"
                value={carData.dimensions.doors}
                onChange={(e) => handleInputChange('dimensions', 'doors', parseInt(e.target.value))}
                min="2"
                max="6"
              />
            </div>
            
            <div className="form-group">
              <label>Luggage Space (cu ft)</label>
              <input
                type="number"
                value={carData.dimensions.luggage}
                onChange={(e) => handleInputChange('dimensions', 'luggage', parseFloat(e.target.value))}
                placeholder="15.5"
                min="0"
                step="0.1"
              />
            </div>
          </div>
        </div>
        
        {/* Safety Features Section */}
        <div className="form-section">
          <h2>🛡️ Safety Features</h2>
          <div className="features-grid">
            {Object.entries(carData.features.safety).map(([feature, value]) => (
              <div key={feature} className="feature-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handleFeatureChange('safety', feature, e.target.checked)}
                  />
                  {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Comfort Features Section */}
        <div className="form-section">
          <h2>🛋️ Comfort Features</h2>
          <div className="features-grid">
            {Object.entries(carData.features.comfort).map(([feature, value]) => (
              <div key={feature} className="feature-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handleFeatureChange('comfort', feature, e.target.checked)}
                  />
                  {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Technology Features Section */}
        <div className="form-section">
          <h2>📱 Technology Features</h2>
          <div className="features-grid">
            {Object.entries(carData.features.technology).map(([feature, value]) => {
              if (feature === 'usbPorts') {
                return (
                  <div key={feature} className="form-group">
                    <label>USB Ports</label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => handleFeatureChange('technology', feature, parseInt(e.target.value))}
                      min="0"
                      max="10"
                    />
                  </div>
                );
              }
              return (
                <div key={feature} className="feature-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => handleFeatureChange('technology', feature, e.target.checked)}
                    />
                    {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Location Section */}
        <div className="form-section">
          <h2>📍 Location</h2>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Address *</label>
              <input
                type="text"
                value={carData.location.address}
                onChange={(e) => handleInputChange('location', 'address', e.target.value)}
                placeholder="123 Main Street"
                required
              />
            </div>
            
            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                value={carData.location.city}
                onChange={(e) => handleInputChange('location', 'city', e.target.value)}
                placeholder="New York"
                required
              />
            </div>
            
            <div className="form-group">
              <label>State *</label>
              <input
                type="text"
                value={carData.location.state}
                onChange={(e) => handleInputChange('location', 'state', e.target.value)}
                placeholder="NY"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Zip Code *</label>
              <input
                type="text"
                value={carData.location.zipCode}
                onChange={(e) => handleInputChange('location', 'zipCode', e.target.value)}
                placeholder="10001"
                required
              />
            </div>
          </div>
        </div>
        
        {/* Availability Section */}
        <div className="form-section">
          <h2>📅 Availability</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={carData.availability.isAvailable}
                  onChange={(e) => handleInputChange('availability', 'isAvailable', e.target.checked)}
                />
                Available for Rent
              </label>
            </div>
            
            <div className="form-group">
              <label>Available From</label>
              <input
                type="date"
                value={carData.availability.availableFrom}
                onChange={(e) => handleInputChange('availability', 'availableFrom', e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>Available Until</label>
              <input
                type="date"
                value={carData.availability.availableUntil}
                onChange={(e) => handleInputChange('availability', 'availableUntil', e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {/* Contact Information Section */}
        <div className="form-section">
          <h2>📞 Contact Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Contact Phone</label>
              <input
                type="tel"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(555) 123-4567"
              />
            </div>
            
            <div className="form-group">
              <label>Contact Email</label>
              <input
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                placeholder="owner@example.com"
              />
            </div>
          </div>
        </div>
        
        {/* Description Section */}
        <div className="form-section">
          <h2>📝 Description</h2>
          <div className="form-group">
            <label>Car Description *</label>
            <textarea
              value={carData.description}
              onChange={(e) => handleInputChange(null, 'description', e.target.value)}
              placeholder="Describe your car, its condition, special features, or any important details for renters..."
              rows="4"
              maxLength="1000"
              required
            />
            <p className="char-count">{carData.description.length}/1000 characters</p>
          </div>
        </div>
        
        {/* Error/Success Messages */}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        {/* Submit Buttons */}
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => navigate('/manage-cars')}
            disabled={isLoading}
          >
            Cancel
          </button>
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Adding Car...' : 'Add Car'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCar;