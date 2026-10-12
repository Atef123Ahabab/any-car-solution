import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import "../Styles/styles/Login.css";

const Login = ({ setShowLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [userType, setUserType] = useState('customer'); // Changed from accountType to userType
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const endpoint = isRegistering ? '/register' : '/login';
      const requestBody = isRegistering 
        ? { email, password, userType }
        : { email, password };

      const response = await fetch(`${API_BASE_URL}/api/auth${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // For login - handle all user types (customer, admin, owner)
      if (!isRegistering) {
        // Store authentication data in localStorage
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userType', data.user.userType);
        localStorage.setItem('userRole', data.user.userType); // Add userRole for consistency
        localStorage.setItem('userId', data.user.id || data.user._id);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userName', data.user.name || data.user.email);
        
        // Store JWT token if provided
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }
        
        // Log successful login for debugging
        // console.log('User logged in successfully:', {
        //   id: data.user.id || data.user._id,
        //   email: data.user.email,
        //   userType: data.user.userType,
        // });
        
        // Redirect based on user type
        switch(data.user.userType) {
          case 'owner':
            navigate('/owner-dashboard');
            break;
          case 'admin':
            navigate('/admin-dashboard');
            break;
          case 'customer':
          default:
            navigate('/dashboard');
        }
        
        setShowLogin(false);
      } else {
        // For registration - all user types are now properly handled
        // console.log('User registered successfully:', {
        //   email: email,
        //   userType: userType,
        //   timestamp: new Date().toISOString()
        // });
        
        setError('Registration successful! Please login with your new account.');
        setIsRegistering(false);
        setEmail('');
        setPassword('');
      }
      
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.message || 'Authentication failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-modal">
      <div className="login-content">
        <button 
          className="login-close" 
          onClick={() => setShowLogin(false)}
        >
          &times;
        </button>
        
        <h2>{isRegistering ? 'Create Account' : 'Login to Your Account'}</h2>
        
        <form onSubmit={handleAuth}>
          {isRegistering && (
            <div className="form-group">
              <label>Account Type</label>
              <select 
                value={userType} // Changed from accountType
                onChange={(e) => setUserType(e.target.value)} // Changed from setAccountType
                className="account-type-select"
              >
                <option value="customer">Customer</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              minLength="6"
            />
          </div>
          
          {error && <div className="login-error">{error}</div>}
          
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading 
              ? (isRegistering ? 'Registering...' : 'Logging in...') 
              : (isRegistering ? 'Register' : 'Login')}
          </button>
        </form>
        
        <div className="login-footer">
          <p>
            {isRegistering 
              ? 'Already have an account?' 
              : 'Don\'t have an account?'}
            <span 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              style={{ cursor: 'pointer', color: 'blue' }}
            >
              {isRegistering ? ' Login' : ' Sign up'}
            </span>
          </p>
          {!isRegistering && <p>Forgot password?</p>}
        </div>
      </div>
    </div>
  );
};

export default Login;