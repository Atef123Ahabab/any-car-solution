// API configuration for different environments
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL || 'https://your-backend-url.railway.app'  // Production API URL
  : 'https://carrental-and-service.onrender.com'; // Development API URL

export { API_BASE_URL };
