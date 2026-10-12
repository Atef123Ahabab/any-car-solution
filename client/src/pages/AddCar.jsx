import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/styles/AddCar.css';

const AddCar = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    type: 'sedan',
    description: '',
    condition: 'excellent',
    mileage: '',
    licensePlate: '',
    pricing: {
      dailyRate: '',
      weeklyRate: '',
      monthlyRate: '',
      currency: 'USD'
    },
    specifications: {
      engine: {
        type: '',
        displacement: '',
        horsepower: ''
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
    dimensions: {
      seats: 5,
      doors: 4,
      luggage: ''
    },
    features: {
      safety: {
        airbags: true,
        abs: true,
        stabilityControl: true,
        tractionControl: true,
        blindSpotMonitoring: false,
        laneDepartureWarning: false,
        collisionWarning: false
      },
      comfort: {
        airConditioning: true,
        heatedSeats: false,
        leatherSeats: false,
        cooledSeats: false,
        sunroof: false,
        powerWindows: true,
        powerLocks: true,
        cruiseControl: false
      },
      technology: {
        bluetooth: true,
        gps: false,
        rearCamera: false,
        wifi: false,
        dashCamera: false,
        touchScreen: false,
        appleCarPlay: false,
        androidAuto: false,
        usbPorts: 2,
        wirelessCharging: false
      }
    },
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    images: []
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        let current = newData;
        
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = type === 'checkbox' ? checked : 
                                        type === 'number' ? Number(value) : value;
        return newData;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : 
                type === 'number' ? Number(value) : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        throw new Error('Please log in to add a car');
      }
      
      // Prepare car data
      const carData = {
        ...formData,
        ownerId: userId,
        availability: {
          isAvailable: true,
          availableFrom: new Date(),
          availableUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          unavailableDates: []
        },
        status: 'active'
      };
      
      // Convert string numbers to actual numbers
      if (carData.pricing.dailyRate) carData.pricing.dailyRate = Number(carData.pricing.dailyRate);
      if (carData.pricing.weeklyRate) carData.pricing.weeklyRate = Number(carData.pricing.weeklyRate);
      if (carData.pricing.monthlyRate) carData.pricing.monthlyRate = Number(carData.pricing.monthlyRate);
      if (carData.mileage) carData.mileage = Number(carData.mileage);
      if (carData.specifications.engine.horsepower) carData.specifications.engine.horsepower = Number(carData.specifications.engine.horsepower);
      if (carData.specifications.fuelEconomy.city) carData.specifications.fuelEconomy.city = Number(carData.specifications.fuelEconomy.city);
      if (carData.specifications.fuelEconomy.highway) carData.specifications.fuelEconomy.highway = Number(carData.specifications.fuelEconomy.highway);
      if (carData.specifications.fuelEconomy.combined) carData.specifications.fuelEconomy.combined = Number(carData.specifications.fuelEconomy.combined);
      if (carData.dimensions.luggage) carData.dimensions.luggage = Number(carData.dimensions.luggage);
      
      const response = await fetch('http://localhost:3000/api/cars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(carData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add car');
      }
      
      const result = await response.json();
      setSuccess('Car added successfully!');
      
      // Redirect to manage cars after 2 seconds
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
        <button className="back-btn" onClick={() => navigate('/manage-cars')}>
          ← Back to Manage Cars
        </button>
        <h1>Add New Car</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="add-car-form">
        {/* Basic Information */}
        <div className="form-section">
          <h2>🚗 Basic Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Make *</label>
              <input
                type="text"
                name="make"
                value={formData.make}
                onChange={handleInputChange}
                required
                placeholder="e.g., Toyota, BMW, Ford"
              />
            </div>
            
            <div className="form-group">
              <label>Model *</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                required
                placeholder="e.g., Camry, X5, Mustang"
              />
            </div>
            
            <div className="form-group">
              <label>Year *</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                required
                min="1990"
                max={new Date().getFullYear() + 1}
              />
            </div>
            
            <div className="form-group">
              <label>Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="hatchback">Hatchback</option>
                <option value="coupe">Coupe</option>
                <option value="convertible">Convertible</option>
                <option value="truck">Truck</option>
                <option value="minivan">Minivan</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>License Plate *</label>
              <input
                type="text"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleInputChange}
                required
                placeholder="e.g., ABC-123"
              />
            </div>
            
            <div className="form-group">
              <label>Mileage</label>
              <input
                type="number"
                name="mileage"
                value={formData.mileage}
                onChange={handleInputChange}
                placeholder="Current mileage"
              />
            </div>
            
            <div className="form-group">
              <label>Condition</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
              >
                <option value="new">New</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>
          </div>
          
          <div className="form-group full-width">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              placeholder="Describe your car's features and condition..."
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="form-section">
          <h2>💰 Pricing</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Daily Rate * ($)</label>
              <input
                type="number"
                name="pricing.dailyRate"
                value={formData.pricing.dailyRate}
                onChange={handleInputChange}
                required
                min="1"
                placeholder="e.g., 50"
              />
            </div>
            
            <div className="form-group">
              <label>Weekly Rate ($)</label>
              <input
                type="number"
                name="pricing.weeklyRate"
                value={formData.pricing.weeklyRate}
                onChange={handleInputChange}
                min="1"
                placeholder="e.g., 300"
              />
            </div>
            
            <div className="form-group">
              <label>Monthly Rate ($)</label>
              <input
                type="number"
                name="pricing.monthlyRate"
                value={formData.pricing.monthlyRate}
                onChange={handleInputChange}
                min="1"
                placeholder="e.g., 1200"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="form-section">
          <h2>📍 Location</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="location.address"
                value={formData.location.address}
                onChange={handleInputChange}
                placeholder="Street address"
              />
            </div>
            
            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                name="location.city"
                value={formData.location.city}
                onChange={handleInputChange}
                required
                placeholder="City"
              />
            </div>
            
            <div className="form-group">
              <label>State *</label>
              <input
                type="text"
                name="location.state"
                value={formData.location.state}
                onChange={handleInputChange}
                required
                placeholder="State"
              />
            </div>
            
            <div className="form-group">
              <label>ZIP Code</label>
              <input
                type="text"
                name="location.zipCode"
                value={formData.location.zipCode}
                onChange={handleInputChange}
                placeholder="ZIP Code"
              />
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="form-section">
          <h2>⚙️ Specifications</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Engine Type</label>
              <input
                type="text"
                name="specifications.engine.type"
                value={formData.specifications.engine.type}
                onChange={handleInputChange}
                placeholder="e.g., V6, I4, Electric"
              />
            </div>
            
            <div className="form-group">
              <label>Displacement</label>
              <input
                type="text"
                name="specifications.engine.displacement"
                value={formData.specifications.engine.displacement}
                onChange={handleInputChange}
                placeholder="e.g., 2.5L, 3.0L"
              />
            </div>
            
            <div className="form-group">
              <label>Horsepower</label>
              <input
                type="number"
                name="specifications.engine.horsepower"
                value={formData.specifications.engine.horsepower}
                onChange={handleInputChange}
                placeholder="e.g., 200"
              />
            </div>
            
            <div className="form-group">
              <label>Transmission</label>
              <select
                name="specifications.transmission"
                value={formData.specifications.transmission}
                onChange={handleInputChange}
              >
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
                <option value="cvt">CVT</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Fuel Type</label>
              <select
                name="specifications.fuelType"
                value={formData.specifications.fuelType}
                onChange={handleInputChange}
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
                name="specifications.drivetrain"
                value={formData.specifications.drivetrain}
                onChange={handleInputChange}
              >
                <option value="fwd">Front-Wheel Drive</option>
                <option value="rwd">Rear-Wheel Drive</option>
                <option value="awd">All-Wheel Drive</option>
                <option value="4wd">4-Wheel Drive</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Seats</label>
              <input
                type="number"
                name="dimensions.seats"
                value={formData.dimensions.seats}
                onChange={handleInputChange}
                min="2"
                max="8"
              />
            </div>
            
            <div className="form-group">
              <label>Doors</label>
              <input
                type="number"
                name="dimensions.doors"
                value={formData.dimensions.doors}
                onChange={handleInputChange}
                min="2"
                max="5"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => navigate('/manage-cars')}>
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Adding Car...' : 'Add Car'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCar;
