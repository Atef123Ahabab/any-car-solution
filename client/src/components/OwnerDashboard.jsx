import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AIAssistantButton from './AIAssistantButton';
import ConversationsList from './ConversationsList';
import '../Styles/styles/OwnerDashboard.css';
import '../Styles/styles/AIAssistantSections.css';

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const [showConversations, setShowConversations] = useState(false);

  return (
    <div className="owner-dashboard">
      <h1>Owner Dashboard</h1>
      <div className="dashboard-grid">
        <div className="dashboard-card" onClick={() => navigate('/manage-cars')}>
          <h2>Manage Cars</h2>
          <p>Add, edit or remove your vehicles</p>
        </div>
        <div className="dashboard-card" onClick={() => navigate('/manage-bookings')}>
          <h2>Manage Bookings</h2>
          <p>View and manage customer bookings</p>
        </div>
        <div className="dashboard-card" onClick={() => navigate('/reports')}>
          <h2>Reports</h2>
          <p>View earnings and analytics</p>
        </div>
        <div className="dashboard-card" onClick={() => navigate('/account-details')}>
          <h2>Account Details</h2>
          <p>Manage your profile and account settings</p>
        </div>
        <div className="dashboard-card" onClick={() => setShowConversations(true)}>
          <h2>Messages</h2>
          <p>Chat with customers</p>
        </div>
      </div>
      
      <div className="ai-assistant-section">
        <AIAssistantButton 
          context="owner" 
          buttonText="AI Business Assistant - Grow Your Rental Income" 
        />
      </div>

      <ConversationsList 
        isOpen={showConversations}
        onClose={() => setShowConversations(false)}
      />
    </div>
  );
};

export default OwnerDashboard;