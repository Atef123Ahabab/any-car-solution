import React, { useState } from 'react';
import SimpleChat from '../components/SimpleChat';
import EnhancedMessaging from '../components/EnhancedMessaging';
import SocialMediaIntegration from '../components/SocialMediaIntegration';
import '../Styles/styles/SimpleChat.css';

const Chat = () => {
  const [useEnhancedMode, setUseEnhancedMode] = useState(true);

  return (
    <div className="chat-page">
      <div className="chat-mode-selector">
        <button 
          className={`mode-btn ${!useEnhancedMode ? 'active' : ''}`}
          onClick={() => setUseEnhancedMode(false)}
        >
          Simple Chat
        </button>
        <button 
          className={`mode-btn ${useEnhancedMode ? 'active' : ''}`}
          onClick={() => setUseEnhancedMode(true)}
        >
          Enhanced Chat
        </button>
      </div>

      {!useEnhancedMode && (
        <div className="chat-page-header">
          <h1>Messages</h1>
          <p>Connect with other users</p>
          
          {/* Social Media Integration */}
          <SocialMediaIntegration 
            carData={null} 
            userInfo={{
              id: localStorage.getItem('userId'),
              name: localStorage.getItem('userName'),
              email: localStorage.getItem('userEmail')
            }}
          />
        </div>
      )}

      <div className="chat-page-content">
        {useEnhancedMode ? <EnhancedMessaging /> : <SimpleChat />}
      </div>
    </div>
  );
};

export default Chat;
