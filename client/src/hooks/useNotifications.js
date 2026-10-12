import { useState, useEffect } from 'react';
import { requestNotificationPermission, sendNotification } from '../utils/mobileFeatures';

export const useNotifications = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const enableNotifications = async () => {
    setIsLoading(true);
    try {
      const granted = await requestNotificationPermission();
      setIsEnabled(granted);
      
      if (granted) {
        sendNotification('Car Rental App', {
          body: 'Notifications enabled! You\'ll receive booking updates.',
          icon: '/favicon.svg'
        });
      }
      
      return granted;
    } catch (error) {
      console.error('Notification setup error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const sendBookingNotification = (bookingData) => {
    if (isEnabled) {
      sendNotification('Booking Confirmed! 🚗', {
        body: `Your ${bookingData.carMake} ${bookingData.carModel} is reserved for ${bookingData.pickupDate}`,
        icon: '/favicon.svg',
        tag: 'booking-confirmation'
      });
    }
  };

  const sendReminderNotification = (bookingData) => {
    if (isEnabled) {
      sendNotification('Pickup Reminder 📅', {
        body: `Don't forget to pick up your ${bookingData.carMake} ${bookingData.carModel} today!`,
        icon: '/favicon.svg',
        tag: 'pickup-reminder'
      });
    }
  };

  const sendReturnReminder = (bookingData) => {
    if (isEnabled) {
      sendNotification('Return Reminder 🔄', {
        body: `Time to return your ${bookingData.carMake} ${bookingData.carModel}`,
        icon: '/favicon.svg',
        tag: 'return-reminder'
      });
    }
  };

  return {
    isEnabled,
    isLoading,
    enableNotifications,
    sendBookingNotification,
    sendReminderNotification,
    sendReturnReminder
  };
};
