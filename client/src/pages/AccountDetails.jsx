import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/styles/AccountDetails.css';

const AccountDetails = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    bio: '',
    userType: 'customer',
    createdAt: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      const userType = localStorage.getItem('userType');
      
      console.log('Auth check:', { token: !!token, userId, userEmail, userType });
      
      if (!token) {
        setError('Please log in to view your account details');
        setIsLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Profile response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Profile fetch failed:', errorData);
        throw new Error(errorData.message || 'Failed to fetch profile');
      }

      const data = await response.json();
      console.log('Profile data:', data);
      
      if (data.success && data.user) {
        setUserInfo({
          name: data.user.name || userEmail?.split('@')[0] || 'User',
          email: data.user.email || userEmail || '',
          phone: data.user.phone || '',
          address: data.user.address || {
            street: '',
            city: '',
            state: '',
            zipCode: ''
          },
          bio: data.user.bio || '',
          userType: data.user.userType || userType || 'customer',
          createdAt: data.user.createdAt || new Date().toISOString()
        });
      } else {
        // Fallback if API fails but we have some user data
        if (userEmail) {
          setUserInfo(prev => ({
            ...prev,
            name: userEmail.split('@')[0],
            email: userEmail,
            userType: userType || 'customer'
          }));
        }
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError(`Failed to load profile: ${err.message}`);
      
      // Fallback to localStorage data if available
      const userEmail = localStorage.getItem('userEmail');
      const userType = localStorage.getItem('userType');
      if (userEmail) {
        setUserInfo(prev => ({
          ...prev,
          name: userEmail.split('@')[0],
          email: userEmail,
          userType: userType || 'customer'
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('address.')) {
      const addressField = name.split('.')[1];
      setUserInfo(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setUserInfo(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:3000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: userInfo.name,
          phone: userInfo.phone,
          address: userInfo.address,
          bio: userInfo.bio
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      if (data.success) {
        setSuccess('Profile updated successfully!');
        setUserInfo(data.user);
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:3000/api/auth/account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      const data = await response.json();
      if (data.success) {
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userType');
        
        // Redirect to home page
        navigate('/');
      }
    } catch (err) {
      console.error('Account deletion error:', err);
      setError('Failed to delete account');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading && !userInfo.email) {
    return (
      <div className="account-details-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="account-details-container">
      <div className="account-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Account Details</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="account-content">
        <div className="profile-section">
          <h2>👤 Personal Information</h2>
          <form onSubmit={handleUpdateProfile} className="profile-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={userInfo.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={userInfo.email}
                  disabled
                  className="disabled-input"
                />
                <small>Email cannot be changed</small>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={userInfo.phone || ''}
                  onChange={handleInputChange}
                  placeholder="+1234567890"
                />
              </div>

              <div className="form-group">
                <label>User Type</label>
                <input
                  type="text"
                  value={userInfo.userType}
                  disabled
                  className="disabled-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={userInfo.bio || ''}
                onChange={handleInputChange}
                placeholder="Tell us about yourself..."
                maxLength="500"
                rows="4"
              />
              <small>{userInfo.bio?.length || 0}/500 characters</small>
            </div>

            <h3>📍 Address Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Street Address</label>
                <input
                  type="text"
                  name="address.street"
                  value={userInfo.address?.street || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="address.city"
                  value={userInfo.address?.city || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="address.state"
                  value={userInfo.address?.state || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>ZIP Code</label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={userInfo.address?.zipCode || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="update-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>

        <div className="account-info-section">
          <h2>📊 Account Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Member Since:</span>
              <span className="info-value">
                {userInfo.createdAt ? new Date(userInfo.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Account Type:</span>
              <span className="info-value">{userInfo.userType}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{userInfo.email}</span>
            </div>
          </div>
        </div>

        <div className="danger-zone">
          <h2>⚠️ Danger Zone</h2>
          <div className="danger-content">
            <p>
              Deleting your account will permanently remove all your data, including:
            </p>
            <ul>
              <li>Your profile information</li>
              <li>All your car listings (if you're an owner)</li>
              <li>Your booking history</li>
              <li>Your search history</li>
            </ul>
            <p><strong>This action cannot be undone!</strong></p>
            
            <button 
              className="delete-account-btn"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>⚠️ Confirm Account Deletion</h3>
            <p>
              Are you absolutely sure you want to delete your account? 
              This will permanently remove all your data and cannot be undone.
            </p>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-btn"
                onClick={handleDeleteAccount}
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountDetails;
