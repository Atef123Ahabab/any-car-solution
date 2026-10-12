import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import carImage from '../assets/main_car.png';
import MobileFeatures from '../components/MobileFeatures';
import AIAssistantButton from '../components/AIAssistantButton';
import "../Styles/styles/Home.css";

const cityList = ["Dhaka","Nakhalpara" ,"Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City", "Hamilton", "Halifax"]

const API_BASE_URL = window.location.hostname === '192.168.0.100' ? 'http://192.168.0.100:3000' : 'http://localhost:3000';

const Home = () => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const isMobile = window.innerWidth <= 768;

  const handleLocationFound = (locationData) => {
    setSelectedCity(locationData.city);
  };

  const handlePhotoTaken = (photo) => {
    console.log('Photo captured:', photo);
    // Could be used for profile pictures or car damage reports
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!selectedCity) {
      alert('Please select a pickup location');
      return;
    }

    try {
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');

      const response = await fetch(`${API_BASE_URL}/api/cars/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: selectedCity,
          pickupDate,
          returnDate,
          userId: userId || null,
          userEmail: userEmail || null
        })
      });

      const data = await response.json();
      
      if (data.success) {
        navigate('/cars', { 
          state: { 
            searchResults: data.cars, 
            searchQuery: `Cars in ${selectedCity}`,
            resultsCount: data.resultsCount,
            filters: {
              location: selectedCity,
              pickupDate,
              returnDate
            }
          } 
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      const errorMessage = error.message || 'Search failed. Please check your connection and try again.';
      alert(errorMessage);
    }
  };

  return (
    <div className={`home ${isMobile ? 'home-mobile' : ''}`}>
      <div className={`home-content ${isMobile ? 'home-container' : ''}`}>
        {isMobile ? (
          // Mobile Layout
          <>
            <div className="hero-section">
              <h1 className="hero-title">Find Your Perfect Ride</h1>
              <p className="hero-subtitle">Rent premium cars for any occasion</p>
            </div>

            <div className="mobile-search-form">
              <form onSubmit={handleSearch}>
                <div className="search-field">
                  <label htmlFor="city">📍 Pickup Location</label>
                  <select
                    id="city"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    required
                  >
                    <option value="">Select a city</option>
                    {cityList.map((city, index) => (
                      <option key={index} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="search-field">
                  <label htmlFor="pickup-date">📅 Pickup Date</label>
                  <input
                    type="date"
                    id="pickup-date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="search-field">
                  <label htmlFor="return-date">📅 Return Date</label>
                  <input
                    type="date"
                    id="return-date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    min={pickupDate || new Date().toISOString().split('T')[0]}
                  />
                </div>

                <button type="submit" className="search-btn">
                  🔍 Search Cars
                </button>
                
                <div className="ai-assistant-section">
                  <AIAssistantButton 
                    context="general" 
                    buttonText="AI Assistance for your luxury rental" 
                  />
                </div>
              </form>
            </div>

            <div className="hero-image-mobile">
              <img src={carImage} alt="Luxury Car" style={{width: '100%', borderRadius: '15px'}} />
            </div>

            <MobileFeatures 
              onLocationFound={handleLocationFound}
              onPhotoTaken={handlePhotoTaken}
            />
          </>
        ) : (
          // Desktop Layout
          <>
            <div className="hero-section">
              <div className="hero-text">
                <h1>Find Your Perfect Ride</h1>
                <p>Rent premium cars for any occasion</p>
              </div>
              <div className="hero-image">
                <img src={carImage} alt="Luxury Car" />
              </div>
            </div>

            <div className="search-section">
              <form onSubmit={handleSearch} className="search-form">
                <div className="search-container">
                  <div className="search-field">
                    <label htmlFor="city">Pickup Location</label>
                    <select
                      id="city"
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      required
                    >
                      <option value="">Select a city</option>
                      {cityList.map((city, index) => (
                        <option key={index} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="search-field">
                    <label htmlFor="pickup-date">Pickup Date</label>
                    <input
                      type="date"
                      id="pickup-date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="search-field">
                    <label htmlFor="return-date">Return Date</label>
                    <input
                      type="date"
                      id="return-date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      min={pickupDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <button type="submit" className="search-button">
                    Search Cars
                  </button>
                </div>
                
                <div className="ai-assistant-section">
                  <AIAssistantButton 
                    context="general" 
                    buttonText="AI Assistance for your luxury rental" 
                  />
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;