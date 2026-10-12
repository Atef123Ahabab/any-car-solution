// Mobile-specific features for the car rental app

// Push Notifications
export const requestNotificationPermission = async () => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (window.Notification.permission === 'granted') {
    return true;
  }

  if (window.Notification.permission !== 'denied') {
    const permission = await window.Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const sendNotification = (title, options = {}) => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }
  
  if (window.Notification.permission === 'granted') {
    const notification = new window.Notification(title, {
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      ...options
    });

    // Auto close after 5 seconds
    setTimeout(() => notification.close(), 5000);
    
    return notification;
  }
  
  return null;
};

// Geolocation API
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        let errorMessage = 'Unknown error';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

// Reverse geocoding to get city from coordinates
export const getCityFromCoordinates = async (latitude, longitude) => {
  try {
    // Using a free geocoding service
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    const data = await response.json();
    return data.city || data.locality || 'Unknown Location';
  } catch (error) {
    console.error('Geocoding error:', error);
    return 'Unknown Location';
  }
};

// Camera API for taking photos
export const capturePhoto = () => {
  return new Promise((resolve, reject) => {
    // Create file input for camera
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use rear camera

    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            file: file,
            dataUrl: e.target.result,
            name: file.name,
            size: file.size,
            type: file.type
          });
        };
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(file);
      } else {
        reject(new Error('No image selected'));
      }
    };

    input.click();
  });
};

// Device vibration
export const vibrate = (pattern = [200]) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

// Share API
export const shareContent = async (shareData) => {
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return true;
    } catch (error) {
      console.error('Share failed:', error);
      return false;
    }
  } else {
    // Fallback: copy to clipboard
    if (navigator.clipboard && shareData.url) {
      try {
        await navigator.clipboard.writeText(shareData.url);
        return true;
      } catch (error) {
        console.error('Clipboard write failed:', error);
        return false;
      }
    }
  }
  return false;
};

// Device orientation
export const getDeviceOrientation = () => {
  return new Promise((resolve, reject) => {
    if ('DeviceOrientationEvent' in window) {
      const handler = (event) => {
        window.removeEventListener('deviceorientation', handler);
        resolve({
          alpha: event.alpha, // Z axis
          beta: event.beta,   // X axis
          gamma: event.gamma  // Y axis
        });
      };
      
      window.addEventListener('deviceorientation', handler);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        window.removeEventListener('deviceorientation', handler);
        reject(new Error('Device orientation timeout'));
      }, 5000);
    } else {
      reject(new Error('Device orientation not supported'));
    }
  });
};

// Battery API
export const getBatteryInfo = async () => {
  if ('getBattery' in navigator) {
    try {
      const battery = await navigator.getBattery();
      return {
        level: Math.round(battery.level * 100),
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime
      };
    } catch (error) {
      console.error('Battery API error:', error);
      return null;
    }
  }
  return null;
};

// Network information
export const getNetworkInfo = () => {
  if ('connection' in navigator) {
    const connection = navigator.connection;
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  }
  return null;
};
