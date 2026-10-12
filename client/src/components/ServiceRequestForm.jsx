import React, { useState } from 'react';
import '../Styles/styles/ServiceForm.css';

const ServiceRequestForm = ({ userCars, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    serviceType: 'oilChange',
    vehicleId: '',
    requestedDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    urgency: 'medium',
    description: '',
    customerEmail: localStorage.getItem('userEmail') || '',
    customerPhone: '',
    estimatedCost: '',
    serviceLocation: {
      type: 'garage',
      address: ''
    },
    vehicleDetails: {
      make: '',
      model: '',
      year: '',
      mileage: '',
      licensePlate: '',
      vin: ''
    },
    customerNotes: ''
  });

  const serviceTypes = [
    { value: 'oilChange', label: 'Oil Change' },
    { value: 'tireReplacement', label: 'Tire Replacement' },
    { value: 'engineDiagnostics', label: 'Engine Diagnostics' },
    { value: 'batteryReplacement', label: 'Battery Replacement' },
    { value: 'brakeRepair', label: 'Brake Repair' },
    { value: 'transmissionService', label: 'Transmission Service' },
    { value: 'airConditioningRepair', label: 'Air Conditioning Repair' },
    { value: 'suspensionCheck', label: 'Suspension Check' },
    { value: 'carWashDetailing', label: 'Car Wash/Detailing' },
    { value: 'generalMaintenance', label: 'General Maintenance' }
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const locationTypes = [
    { value: 'garage', label: 'At Service Center' },
    { value: 'pickup', label: 'Pickup & Delivery' },
    { value: 'mobile', label: 'Mobile Service' },
    { value: 'dropoff', label: 'Drop-off Service' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('vehicle.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        vehicleDetails: {
          ...prev.vehicleDetails,
          [field]: value
        }
      }));
    } else if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        serviceLocation: {
          ...prev.serviceLocation,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleVehicleSelect = (e) => {
    const vehicleId = e.target.value;
    const selectedVehicle = userCars.find(car => car._id === vehicleId);
    
    if (selectedVehicle) {
      setFormData(prev => ({
        ...prev,
        vehicleId,
        vehicleDetails: {
          make: selectedVehicle.make,
          model: selectedVehicle.model,
          year: selectedVehicle.year || '',
          licensePlate: selectedVehicle.licensePlate || '',
          vin: selectedVehicle.vin || '',
          mileage: selectedVehicle.currentMileage || prev.vehicleDetails.mileage
        }
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare data for submission
    const submissionData = {
      ...formData,
      customerId: localStorage.getItem('userId'),
      car: formData.vehicleId,
      // Combine description and customer notes
      description: formData.description || formData.customerNotes || 'Service request',
      // Set default values if not provided
      estimatedCost: parseFloat(formData.estimatedCost) || 0,
      // Ensure proper date format
      requestedDate: new Date(formData.requestedDate).toISOString()
    };
    
    onSubmit(submissionData);
  };

  return (
    <div className="service-form-overlay">
      <div className="service-form-container">
        <div className="service-form-header">
          <h2>Request Service</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="service-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="serviceType">Service Type *</label>
              <select
                id="serviceType"
                name="serviceType"
                value={formData.serviceType}
                onChange={handleInputChange}
                required
              >
                {serviceTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="urgency">Priority Level *</label>
              <select
                id="urgency"
                name="urgency"
                value={formData.urgency}
                onChange={handleInputChange}
                required
              >
                {urgencyLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="vehicleId">Select Vehicle *</label>
            <select
              id="vehicleId"
              name="vehicleId"
              value={formData.vehicleId}
              onChange={handleVehicleSelect}
              required
            >
              <option value="">Choose your vehicle</option>
              {userCars.map(car => (
                <option key={car._id} value={car._id}>
                  {car.make} {car.model} ({car.licensePlate})
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="requestedDate">Preferred Date *</label>
              <input
                type="date"
                id="requestedDate"
                name="requestedDate"
                value={formData.requestedDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="estimatedCost">Estimated Budget ($)</label>
              <input
                type="number"
                id="estimatedCost"
                name="estimatedCost"
                value={formData.estimatedCost}
                onChange={handleInputChange}
                placeholder="Optional"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="contact-section">
            <h3>Contact Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="customerEmail">Email Address *</label>
                <input
                  type="email"
                  id="customerEmail"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  required
                  placeholder="your.email@example.com"
                />
              </div>
              <div className="form-group">
                <label htmlFor="customerPhone">Phone Number</label>
                <input
                  type="tel"
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>

          <div className="location-section">
            <h3>Service Location</h3>
            <div className="form-group">
              <label htmlFor="location.type">Service Location Type *</label>
              <select
                id="location.type"
                name="location.type"
                value={formData.serviceLocation.type}
                onChange={handleInputChange}
                required
              >
                {locationTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            {(formData.serviceLocation.type === 'pickup' || formData.serviceLocation.type === 'mobile') && (
              <div className="form-group">
                <label htmlFor="location.address">Service Address</label>
                <input
                  type="text"
                  id="location.address"
                  name="location.address"
                  value={formData.serviceLocation.address}
                  onChange={handleInputChange}
                  placeholder="123 Main St, City, State 12345"
                />
              </div>
            )}
          </div>

          <div className="vehicle-details">
            <h3>Vehicle Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="vehicle.make">Make</label>
                <input
                  type="text"
                  id="vehicle.make"
                  name="vehicle.make"
                  value={formData.vehicleDetails.make}
                  onChange={handleInputChange}
                  placeholder="e.g., Toyota"
                  readOnly={formData.vehicleId}
                />
              </div>
              <div className="form-group">
                <label htmlFor="vehicle.model">Model</label>
                <input
                  type="text"
                  id="vehicle.model"
                  name="vehicle.model"
                  value={formData.vehicleDetails.model}
                  onChange={handleInputChange}
                  placeholder="e.g., Camry"
                  readOnly={formData.vehicleId}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="vehicle.year">Year</label>
                <input
                  type="number"
                  id="vehicle.year"
                  name="vehicle.year"
                  value={formData.vehicleDetails.year}
                  onChange={handleInputChange}
                  placeholder="e.g., 2020"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  readOnly={formData.vehicleId}
                />
              </div>
              <div className="form-group">
                <label htmlFor="vehicle.mileage">Current Mileage</label>
                <input
                  type="number"
                  id="vehicle.mileage"
                  name="vehicle.mileage"
                  value={formData.vehicleDetails.mileage}
                  onChange={handleInputChange}
                  placeholder="e.g., 50000"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="vehicle.licensePlate">License Plate</label>
                <input
                  type="text"
                  id="vehicle.licensePlate"
                  name="vehicle.licensePlate"
                  value={formData.vehicleDetails.licensePlate}
                  onChange={handleInputChange}
                  placeholder="ABC-1234"
                  readOnly={formData.vehicleId}
                />
              </div>
              <div className="form-group">
                <label htmlFor="vehicle.vin">VIN (Optional)</label>
                <input
                  type="text"
                  id="vehicle.vin"
                  name="vehicle.vin"
                  value={formData.vehicleDetails.vin}
                  onChange={handleInputChange}
                  placeholder="17-character VIN"
                  maxLength="17"
                  readOnly={formData.vehicleId}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Service Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the service needed, any specific issues, symptoms, or requirements..."
              rows="4"
              required
              minLength="10"
            />
          </div>

          <div className="form-group">
            <label htmlFor="customerNotes">Additional Notes</label>
            <textarea
              id="customerNotes"
              name="customerNotes"
              value={formData.customerNotes}
              onChange={handleInputChange}
              placeholder="Any additional information, special requests, or preferred service times..."
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Request Service
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceRequestForm;
