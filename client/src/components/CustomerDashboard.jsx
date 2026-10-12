import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AIAssistantButton from './AIAssistantButton';
import ConversationsList from './ConversationsList';
import '../Styles/styles/CustomerDashboard.css';
import '../Styles/styles/AIAssistantSections.css';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [showConversations, setShowConversations] = useState(false);

  return (
    <div className="customer-dashboard">
      <h1>Welcome Back!</h1>
      <div className="dashboard-grid">
        <div className="dashboard-card" onClick={() => navigate('/cars')}>
          <h2>Browse Cars</h2>
          <p>Find your perfect rental vehicle</p>
        </div>
        <div className="dashboard-card" onClick={() => navigate('/my-bookings')}>
          <h2>My Bookings</h2>
          <p>View your current and past rentals</p>
        </div>
        <div className="dashboard-card" onClick={() => navigate('/favorites')}>
          <h2>Favorites</h2>
          <p>Your saved vehicles</p>
        </div>
        <div className="dashboard-card" onClick={() => navigate('/account-details')}>
          <h2>Account Settings</h2>
          <p>Manage your profile and preferences</p>
        </div>
        <div className="dashboard-card" onClick={() => setShowConversations(true)}>
          <h2>Messages</h2>
          <p>Chat with car owners</p>
        </div>
      </div>
      
      <div className="ai-assistant-section">
        <AIAssistantButton 
          context="customer" 
          buttonText="AI Rental Assistant - Find Your Perfect Car" 
        />
      </div>

      <ConversationsList 
        isOpen={showConversations}
        onClose={() => setShowConversations(false)}
      />
    </div>
  );
};

export default CustomerDashboard;