import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceRequestForm from '../components/ServiceRequestForm';
import ServiceStatusBadge from '../components/ServiceStatusBadge';
import ServiceFilter from '../components/ServiceFilter';
import '../Styles/styles/Servicing.css';

const Servicing = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [userCars, setUserCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState('');
  const [userType, setUserType] = useState('');
  const [activeTab, setActiveTab] = useState('my-requests');
  const [filteredServices, setFilteredServices] = useState([]);
  const [filters, setFilters] = useState({
    serviceType: '',
    status: '',
    dateRange: ''
  });

  // Check authentication
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    const userIdFromStorage = localStorage.getItem('userId');
    const userTypeFromStorage = localStorage.getItem('userType') || 'customer';
    
    console.log('Debug - Auth check:', { authStatus, userIdFromStorage, userTypeFromStorage });
    
    setIsAuthenticated(authStatus);
    setUserId(userIdFromStorage);
    setUserType(userTypeFromStorage);
    
    if (!authStatus || !userIdFromStorage) {
      console.log('Not authenticated or no userId, redirecting...');
      navigate('/');
      return;
    }
    
    fetchUserData(userIdFromStorage, userTypeFromStorage);
  }, [navigate]);

  // Filter services whenever services or filters change
  useEffect(() => {
    let filtered = [...services];

    // Filter by service type
    if (filters.serviceType) {
      filtered = filtered.filter(service => service.serviceType === filters.serviceType);
    }

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(service => service.status === filters.status);
    }

    // Filter by date range
    if (filters.dateRange) {
      const now = new Date();
      const serviceDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          filtered = filtered.filter(service => {
            const reqDate = new Date(service.requestedDate);
            return reqDate.toDateString() === now.toDateString();
          });
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(service => {
            const reqDate = new Date(service.requestedDate);
            return reqDate >= weekAgo;
          });
          break;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          filtered = filtered.filter(service => {
            const reqDate = new Date(service.requestedDate);
            return reqDate >= monthAgo;
          });
          break;
        case 'quarter':
          const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
          filtered = filtered.filter(service => {
            const reqDate = new Date(service.requestedDate);
            return reqDate >= quarterAgo;
          });
          break;
      }
    }

    setFilteredServices(filtered);
  }, [services, filters]);

  const fetchUserData = async (userIdParam, userTypeParam) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const headers = {
        'Content-Type': 'application/json',
        'x-user-id': userIdParam
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Fetch user's cars
      try {
        const carsResponse = await fetch(`http://localhost:3000/api/cars/owner/${userIdParam}`, {
          headers
        });
        if (carsResponse.ok) {
          const carsData = await carsResponse.json();
          setUserCars(carsData.cars || []);
        } else {
          // Fallback to mock data if API fails
          setUserCars([
            { _id: '1', make: 'Toyota', model: 'Camry', licensePlate: 'ABC123', ownerId: 'owner1' },
            { _id: '2', make: 'Honda', model: 'Civic', licensePlate: 'XYZ789', ownerId: 'owner2' }
          ]);
        }
      } catch (err) {
        console.log('Cars API failed, using mock data');
        setUserCars([
          { _id: '1', make: 'Toyota', model: 'Camry', licensePlate: 'ABC123', ownerId: 'owner1' },
          { _id: '2', make: 'Honda', model: 'Civic', licensePlate: 'XYZ789', ownerId: 'owner2' }
        ]);
      }
      
      // Fetch services based on user type
      try {
        let servicesEndpoint;
        if (userTypeParam === 'owner') {
          servicesEndpoint = `http://localhost:3000/api/services/owner/${userIdParam}`;
        } else {
          servicesEndpoint = `http://localhost:3000/api/services/customer/${userIdParam}`;
        }
        
        const servicesResponse = await fetch(servicesEndpoint, {
          headers
        });
        
        if (servicesResponse.ok) {
          const servicesData = await servicesResponse.json();
          setServices(servicesData.services || []);
        } else {
          // Fallback to mock data if API fails
          setServices([
            {
              _id: 'service1',
              serviceType: 'oilChange',
              status: 'pending',
              car: { make: 'Toyota', model: 'Camry', licensePlate: 'ABC123' },
              ownerId: { name: 'AutoCare Shop', email: 'shop@autocare.com' },
              requestedDate: new Date().toISOString(),
              description: 'Regular oil change service',
              vehicleDetails: { make: 'Toyota', model: 'Camry', year: 2020 }
            },
            {
              _id: 'service2',
              serviceType: 'brakeRepair',
              status: 'approved',
              car: { make: 'Honda', model: 'Civic', licensePlate: 'XYZ789' },
              ownerId: { name: 'Brake Masters', email: 'service@brakemasters.com' },
              requestedDate: new Date(Date.now() - 86400000).toISOString(),
              description: 'Front brake pads replacement',
              vehicleDetails: { make: 'Honda', model: 'Civic', year: 2019 }
            }
          ]);
        }
      } catch (err) {
        console.log('Services API failed, using mock data');
        setServices([
          {
            _id: 'service1',
            serviceType: 'oilChange',
            status: 'pending',
            car: { make: 'Toyota', model: 'Camry', licensePlate: 'ABC123' },
            ownerId: { name: 'AutoCare Shop', email: 'shop@autocare.com' },
            requestedDate: new Date().toISOString(),
            description: 'Regular oil change service',
            vehicleDetails: { make: 'Toyota', model: 'Camry', year: 2020 }
          }
        ]);
      }
      
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async (serviceData) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'x-user-id': userId
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('http://localhost:3000/api/services', {
        method: 'POST',
        headers,
        body: JSON.stringify(serviceData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setShowServiceForm(false);
        setSelectedCar(null);
        fetchUserData(userId, userType);
      } else {
        setError(data.message || 'Failed to create service request');
      }
    } catch (err) {
      console.error('Error creating service:', err);
      setError('Failed to create service request. Please try again.');
    }
  };

  const handleUpdateServiceStatus = async (serviceId, status, notes = '') => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'x-user-id': userId
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`http://localhost:3000/api/services/${serviceId}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status, notes })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        fetchUserData(userId, userType);
      } else {
        setError(data.message || 'Failed to update service status');
      }
    } catch (err) {
      console.error('Error updating service status:', err);
      setError('Failed to update service status. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="servicing-container">
        <div className="auth-required">
          <h2>Authentication Required</h2>
          <p>Please log in to access the servicing section.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="servicing-container">
        <div className="loading-spinner">
          <h2>Loading your cars...</h2>
          <p>Debug: userId={userId}, userType={userType}, isAuthenticated={isAuthenticated}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="servicing-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="servicing-container">
      {/* Servicing Button - Left Side */}
      <div className="servicing-sidebar">
        <button 
          className="servicing-action-btn"
          onClick={() => setShowServiceForm(true)}
          title="Request New Service"
        >
          <span className="btn-icon">🔧</span>
          <span className="btn-text">Servicing</span>
        </button>
      </div>
      
      <div className="servicing-header">
        <h1>Car Servicing</h1>
        <p>Manage service requests for your vehicles</p>
        
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'my-requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-requests')}
          >
            My Service Requests
          </button>
          {userType === 'owner' && (
            <button 
              className={`tab-btn ${activeTab === 'incoming-requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('incoming-requests')}
            >
              Incoming Requests
            </button>
          )}
        </div>
        
        {userCars.length > 0 && (
          <button 
            className="create-service-btn"
            onClick={() => setShowServiceForm(true)}
          >
            Request Service
          </button>
        )}
      </div>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {activeTab === 'my-requests' && (
        <div className="services-section">
          <h2>My Service Requests</h2>
          
          <ServiceFilter 
            onFilterChange={setFilters}
            services={filteredServices}
          />
          
          {filteredServices.length === 0 ? (
            <div className="no-services-message">
              <h3>No service requests found</h3>
              <p>{services.length === 0 ? 'Create a service request to get started.' : 'Try adjusting your filters.'}</p>
            </div>
          ) : (
            <div className="services-grid">
              {filteredServices.map((service) => (
                <ServiceCard 
                  key={service._id} 
                  service={service} 
                  userType={userType}
                  onStatusUpdate={handleUpdateServiceStatus}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'incoming-requests' && userType === 'owner' && (
        <div className="services-section">
          <h2>Incoming Service Requests</h2>
          {services.filter(s => s.status === 'pending').length === 0 ? (
            <div className="no-services-message">
              <h3>No pending requests</h3>
              <p>All service requests have been processed.</p>
            </div>
          ) : (
            <div className="services-grid">
              {services.filter(s => s.status === 'pending').map((service) => (
                <ServiceCard 
                  key={service._id} 
                  service={service} 
                  userType={userType}
                  onStatusUpdate={handleUpdateServiceStatus}
                  isIncoming={true}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Service Form Modal */}
      {showServiceForm && (
        <ServiceRequestForm 
          userCars={userCars}
          onSubmit={handleCreateService}
          onCancel={() => setShowServiceForm(false)}
        />
      )}
    </div>
  );
};

// Service Card Component
const ServiceCard = ({ service, userType, onStatusUpdate, isIncoming = false }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f39c12';
      case 'approved': return '#3498db';
      case 'completed': return '#27ae60';
      case 'declined': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="service-card">
      <div className="service-header">
        <div className="service-info">
          <h3>{service.serviceType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h3>
          <p className="car-info">
            {service.car?.make} {service.car?.model} ({service.car?.licensePlate})
          </p>
          <p className="service-provider">
            Provider: {service.ownerId?.name || service.ownerId?.email}
          </p>
        </div>
        <div 
          className="status-badge" 
          style={{ backgroundColor: getStatusColor(service.status) }}
        >
          {service.status.toUpperCase()}
        </div>
      </div>

      <div className="service-details">
        <p><strong>Description:</strong> {service.description}</p>
        <p><strong>Urgency:</strong> {service.urgency}</p>
        <p><strong>Requested Date:</strong> {formatDate(service.requestedDate)}</p>
        {service.scheduledDate && (
          <p><strong>Scheduled Date:</strong> {formatDate(service.scheduledDate)}</p>
        )}
        {service.estimatedCost && (
          <p><strong>Estimated Cost:</strong> ${service.estimatedCost}</p>
        )}
        {service.actualCost && (
          <p><strong>Actual Cost:</strong> ${service.actualCost}</p>
        )}
      </div>

      {isIncoming && userType === 'owner' && service.status === 'pending' && (
        <div className="service-actions">
          <button 
            className="confirm-btn"
            onClick={() => onStatusUpdate(service._id, 'approved', 'Service request approved')}
          >
            Approve
          </button>
          <button 
            className="reject-btn"
            onClick={() => onStatusUpdate(service._id, 'declined', 'Service request declined')}
          >
            Decline
          </button>
        </div>
      )}

      {userType === 'owner' && service.status === 'approved' && (
        <div className="service-actions">
          <button 
            className="complete-btn"
            onClick={() => onStatusUpdate(service._id, 'completed', 'Service work completed')}
          >
            Complete Service
          </button>
        </div>
      )}

      {userType === 'customer' && service.status === 'pending' && (
        <div className="service-actions">
          <button 
            className="cancel-btn"
            onClick={() => onStatusUpdate(service._id, 'declined', 'Service request cancelled by customer')}
          >
            Cancel Request
          </button>
        </div>
      )}
    </div>
  );
};

// Create Service Form Component
const CreateServiceForm = ({ userCars, userId, onSubmit, onCancel }) => {
  const [serviceData, setServiceData] = useState({
    customerId: userId,
    ownerId: '',
    car: '',
    serviceType: 'oilChange',
    description: '',
    urgency: 'medium',
    requestedDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    serviceLocation: {
      type: 'customer',
      address: ''
    }
  });

  const handleCarSelection = (carId) => {
    const selectedCar = userCars.find(car => car._id === carId);
    if (selectedCar) {
      setServiceData({
        ...serviceData,
        car: carId,
        ownerId: selectedCar.ownerId
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(serviceData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Request Service</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <select
              value={serviceData.car}
              onChange={(e) => handleCarSelection(e.target.value)}
              required
            >
              <option value="">Select a car</option>
              {userCars.map(car => (
                <option key={car._id} value={car._id}>
                  {car.make} {car.model} ({car.licensePlate})
                </option>
              ))}
            </select>
            <select
              value={serviceData.serviceType}
              onChange={(e) => setServiceData({...serviceData, serviceType: e.target.value})}
              required
            >
              <option value="oilChange">Oil Change</option>
              <option value="brakeService">Brake Service</option>
              <option value="tireRotation">Tire Rotation</option>
              <option value="engineTuneUp">Engine Tune-up</option>
              <option value="transmission">Transmission Service</option>
              <option value="generalMaintenance">General Maintenance</option>
              <option value="repair">Repair</option>
              <option value="inspection">Inspection</option>
              <option value="carWash">Car Wash</option>
              <option value="detailing">Detailing</option>
            </select>
          </div>

          <textarea
            placeholder="Describe the service needed (minimum 10 characters)"
            value={serviceData.description}
            onChange={(e) => setServiceData({...serviceData, description: e.target.value})}
            required
            minLength={10}
          />

          <div className="form-row">
            <select
              value={serviceData.urgency}
              onChange={(e) => setServiceData({...serviceData, urgency: e.target.value})}
              required
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
            <input
              type="date"
              value={serviceData.requestedDate}
              onChange={(e) => setServiceData({...serviceData, requestedDate: e.target.value})}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-row">
            <select
              value={serviceData.serviceLocation.type}
              onChange={(e) => setServiceData({
                ...serviceData,
                serviceLocation: {
                  ...serviceData.serviceLocation,
                  type: e.target.value
                }
              })}
            >
              <option value="customer">At Customer Location</option>
              <option value="owner">At Service Center</option>
            </select>
          </div>

          {serviceData.serviceLocation.type === 'customer' && (
            <input
              type="text"
              placeholder="Service address (optional)"
              value={serviceData.serviceLocation.address}
              onChange={(e) => setServiceData({
                ...serviceData,
                serviceLocation: {
                  ...serviceData.serviceLocation,
                  address: e.target.value
                }
              })}
            />
          )}

          <div className="form-actions">
            <button type="button" onClick={onCancel}>Cancel</button>
            <button type="submit">Request Service</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Servicing;
