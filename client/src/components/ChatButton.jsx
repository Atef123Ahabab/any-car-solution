import React, { useState } from 'react';
import ChatSystem from './ChatSystem';
import '../Styles/styles/ChatButton.css';

const ChatButton = ({ carId, ownerId, ownerName, carTitle, buttonText = "Chat with Owner" }) => {
  const [showChat, setShowChat] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);

  const currentUser = {
    id: localStorage.getItem('userId'),
    type: localStorage.getItem('userType') || 'customer'
  };

  const handleChatClick = async () => {
    if (!currentUser.id) {
      alert('Please log in to start a conversation');
      return;
    }

    if (currentUser.id === ownerId) {
      alert('You cannot chat with yourself');
      return;
    }

    try {
      setLoading(true);
      
      // Create or get existing conversation
      const response = await fetch('http://localhost:3000/api/chat/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carId,
          customerId: currentUser.type === 'customer' ? currentUser.id : ownerId,
          ownerId: currentUser.type === 'owner' ? currentUser.id : ownerId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setConversationId(data.conversation._id);
        setShowChat(true);
      } else {
        alert('Failed to start conversation');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Failed to start conversation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        className="chat-button"
        onClick={handleChatClick}
        disabled={loading}
      >
        {loading ? 'Starting...' : buttonText}
      </button>

      {showChat && conversationId && (
        <ChatSystem
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          conversationId={conversationId}
          receiverId={ownerId}
          receiverName={ownerName}
          carTitle={carTitle}
        />
      )}
    </>
  );
};

export default ChatButton;
