import React, { useState, useEffect } from 'react';
import { 
  requestNotificationPermission, 
  sendNotification, 
  getCurrentLocation, 
  getCityFromCoordinates,
  capturePhoto,
  vibrate,
  shareContent
} from '../utils/mobileFeatures';

const MobileFeatures = ({ onLocationFound, onPhotoTaken }) => {
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    // Check if notifications are already enabled
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationsEnabled(window.Notification.permission === 'granted');
    }
  }, []);

  const handleLocationRequest = async () => {
    setLocationLoading(true);
    try {
      const coords = await getCurrentLocation();
      const city = await getCityFromCoordinates(coords.latitude, coords.longitude);
      
      const locationData = {
        ...coords,
        city
      };
      
      setLocation(locationData);
      vibrate([100, 50, 100]); // Success vibration
      
      if (onLocationFound) {
        onLocationFound(locationData);
      }
      
      if (notificationsEnabled) {
        sendNotification('Location Found!', {
          body: `Your location: ${city}`,
          icon: '/favicon.svg'
        });
      }
    } catch (error) {
      console.error('Location error:', error);
      vibrate([200, 100, 200, 100, 200]); // Error vibration
      alert(`Location Error: ${error.message}`);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleNotificationRequest = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    
    if (granted) {
      sendNotification('Notifications Enabled!', {
        body: 'You will now receive booking updates and reminders.',
        icon: '/favicon.svg'
      });
      vibrate([100]);
    } else {
      alert('Notifications were denied. You can enable them in your browser settings.');
    }
  };

  const handlePhotoCapture = async () => {
    try {
      const photo = await capturePhoto();
      vibrate([50]);
      
      if (onPhotoTaken) {
        onPhotoTaken(photo);
      }
      
      if (notificationsEnabled) {
        sendNotification('Photo Captured!', {
          body: 'Photo ready for upload',
          icon: '/favicon.svg'
        });
      }
    } catch (error) {
      console.error('Photo capture error:', error);
      vibrate([200, 100, 200]);
      alert(`Photo Error: ${error.message}`);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Car Rental App',
      text: 'Check out this amazing car rental app!',
      url: window.location.origin
    };

    const shared = await shareContent(shareData);
    if (shared) {
      vibrate([100]);
      if (notificationsEnabled) {
        sendNotification('Shared Successfully!', {
          body: 'App link shared',
          icon: '/favicon.svg'
        });
      }
    } else {
      alert('Sharing not supported on this device');
    }
  };

  return (
    <div className="mobile-features">
      <div className="feature-section">
        <h3>📱 Mobile Features</h3>
        
        <div className="feature-buttons">
          <button 
            className="feature-btn location-btn"
            onClick={handleLocationRequest}
            disabled={locationLoading}
          >
            {locationLoading ? '📍 Finding...' : '📍 Get My Location'}
          </button>
          
          <button 
            className="feature-btn notification-btn"
            onClick={handleNotificationRequest}
            disabled={notificationsEnabled}
          >
            {notificationsEnabled ? '🔔 Notifications On' : '🔔 Enable Notifications'}
          </button>
          
          <button 
            className="feature-btn camera-btn"
            onClick={handlePhotoCapture}
          >
            📸 Take Photo
          </button>
          
          <button 
            className="feature-btn share-btn"
            onClick={handleShare}
          >
            📤 Share App
          </button>
        </div>
        
        {location && (
          <div className="location-info">
            <h4>📍 Your Location</h4>
            <p><strong>City:</strong> {location.city}</p>
            <p><strong>Coordinates:</strong> {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</p>
            <p><strong>Accuracy:</strong> ±{Math.round(location.accuracy)}m</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileFeatures;
