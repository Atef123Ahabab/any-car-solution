import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Styles/styles/Navbar.css';
import SearchHistory from './SearchHistory';
import { useDebounce } from '../hooks/useDebounce';
import { API_BASE_URL } from '../config/api';
import "../Styles/styles/Navbar.css";
// Import favicon from public directory
const favicon = '/favicon.svg';

const Navbar = ({ setShowLogin }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userType, setUserType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [userId, setUserId] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Check authentication status on component mount and when localStorage changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const authStatus = localStorage.getItem('isAuthenticated') === 'true';
      const email = localStorage.getItem('userEmail') || '';
      const type = localStorage.getItem('userType') || '';
      const id = localStorage.getItem('userId') || '';
      
      setIsAuthenticated(authStatus);
      setUserEmail(email);
      setUserType(type);
      setUserId(id);
    };

    checkAuthStatus();

    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', checkAuthStatus);
    
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, []);

  const handleLogout = () => {
    // Clear all authentication data from localStorage
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('authToken');
    
    // Update local state
    setIsAuthenticated(false);
    setUserEmail('');
    setUserType('');
    
    // Navigate to home page
    navigate('/');
  };

  const handleDashboardClick = () => {
    // Navigate to appropriate dashboard based on user type
    switch(userType) {
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
  };

  const handleEmailClick = () => {
    // Navigate to dashboard when email is clicked
    handleDashboardClick();
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!debouncedSearchQuery.trim()) return;

    try {
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');

      const response = await fetch(`${API_BASE_URL}/api/cars/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: debouncedSearchQuery,
          userId: userId || null,
          userEmail: userEmail || null
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      
      // Navigate to cars page with search results
      navigate('/cars', {
        state: {
          searchResults: data.cars,
          searchQuery: data.searchQuery,
          resultsCount: data.resultsCount,
          filters: data.filters
        }
      });
      
      // Clear search input
      setSearchQuery('');
    } catch (error) {
      console.error('Search error:', error);
      const errorMessage = error.message || 'Search failed. Please check your connection and try again.';
      alert(errorMessage);
    }
  };

  const handleSearchHistorySelect = async (historyItem) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cars/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: historyItem.query,
          location: historyItem.filters?.location,
          carType: historyItem.filters?.carType,
          pickupDate: historyItem.filters?.pickupDate,
          returnDate: historyItem.filters?.returnDate,
          userId: userId || null,
          userEmail: userEmail || null
        })
      });

      const data = await response.json();
      
      if (data.success) {
        navigate('/cars', { 
          state: { 
            searchResults: data.cars, 
            searchQuery: historyItem.query || `Search from history`,
            resultsCount: data.resultsCount
          } 
        });
      }
    } catch (error) {
      console.error('Search history error:', error);
    }
  };

  // Define menu links based on user authentication and type
  const menuLinks = [
    { name: 'Home', path: '/' },
    { name: 'Cars', path: '/cars' },
    ...(isAuthenticated ? [
      { name: 'My Bookings', path: '/my-bookings' },
      { name: 'Servicing', path: '/servicing' },
      { name: 'Reports', path: '/reports' },
      { name: 'Chat', path: '/chat' },
      ...(userType === 'owner' ? [
        { name: 'Manage Cars', path: '/manage-cars' },
        { name: 'Manage Bookings', path: '/manage-bookings' }
      ] : []),
      ...(userType === 'admin' ? [
        { name: 'Statistics', path: '/statistics' }
      ] : [])
    ] : [])
  ];

  return (
    <div className="navbar-container">
      {/* Logo with smooth hover effect */}
      <Link to="/" className="logo-link">
        <img src={favicon} alt="logo" className="logo-image" />
      </Link>

      {/* Menu Links with better spacing and subtle animations */}
      <div className="menu-links">
        {menuLinks.map((link, idx) => (
          <Link
            key={idx}
            to={link.path}
            className="menu-link"
          >
            {link.name}
          </Link>
        ))}
      </div>

      {/* Search Bar with improved styling */}
      <form className="search-container" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search cars..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="search-button">
          <svg xmlns="http://www.w3.org/2000/svg" className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        {isAuthenticated && (
          <SearchHistory 
            userId={userId}
            onSearchSelect={handleSearchHistorySelect}
          />
        )}
      </form>

      {/* Action Buttons with better visual hierarchy */}
      <div className="action-buttons">
        {isAuthenticated ? (
          // Authenticated user view
          <>
            <div className="user-info">
              <span 
                className="user-email" 
                onClick={handleEmailClick}
                title="Click to go to dashboard"
              >
                {userEmail}
              </span>
              <span className="user-type-badge">
                {userType.charAt(0).toUpperCase() + userType.slice(1)}
              </span>
            </div>
            <button
              onClick={handleDashboardClick}
              className="dashboard-button"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="logout-button"
            >
              Logout
            </button>
          </>
        ) : (
          // Non-authenticated user view - only show login button
          <button
            onClick={() => setShowLogin && setShowLogin(true)}
            className="login-button"
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;