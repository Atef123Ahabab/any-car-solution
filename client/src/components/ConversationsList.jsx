import React, { useState, useEffect } from 'react';
import ChatSystem from './ChatSystem';
import StartChatModal from './StartChatModal';
import '../Styles/styles/ConversationsList.css';

const ConversationsList = ({ isOpen, onClose }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showStartChat, setShowStartChat] = useState(false);

  const currentUser = {
    id: localStorage.getItem('userId'),
    type: localStorage.getItem('userType') || 'customer'
  };

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/chat/conversations/${currentUser.id}`);
      const data = await response.json();
      
      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = (conversation) => {
    const otherUser = currentUser.type === 'customer' 
      ? conversation.ownerId 
      : conversation.customerId;
    
    const otherUserName = currentUser.type === 'customer'
      ? conversation.ownerId.name
      : conversation.customerId.name;

    setSelectedConversation({
      id: conversation._id,
      receiverId: otherUser._id || otherUser,
      receiverName: otherUserName,
      carTitle: conversation.carTitle
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="conversations-overlay">
        <div className="conversations-container">
          <div className="conversations-header">
            <h2>Messages</h2>
            <div className="conversations-header-actions">
              <button 
                className="new-chat-btn"
                onClick={() => setShowStartChat(true)}
              >
                + New Chat
              </button>
              <button className="conversations-close-btn" onClick={onClose}>
                ✕
              </button>
            </div>
          </div>

          <div className="conversations-list">
            {loading ? (
              <div className="conversations-loading">
                <p>Loading conversations...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="no-conversations">
                <p>No conversations yet</p>
                <span>Click "New Chat" above to start chatting with {currentUser.type === 'customer' ? 'car owners' : 'customers'}!</span>
                <button 
                  className="browse-cars-btn"
                  onClick={() => setShowStartChat(true)}
                >
                  Start New Chat
                </button>
              </div>
            ) : (
              conversations.map((conversation) => {
                const otherUser = currentUser.type === 'customer' 
                  ? conversation.ownerId 
                  : conversation.customerId;
                
                const unreadCount = currentUser.type === 'customer'
                  ? conversation.unreadCount?.customer || 0
                  : conversation.unreadCount?.owner || 0;

                return (
                  <div
                    key={conversation._id}
                    className="conversation-item"
                    onClick={() => handleConversationClick(conversation)}
                  >
                    <div className="conversation-avatar">
                      {otherUser.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    
                    <div className="conversation-content">
                      <div className="conversation-header-row">
                        <h4>{otherUser.name || 'Unknown User'}</h4>
                        <span className="conversation-time">
                          {formatTime(conversation.lastMessageTime)}
                        </span>
                      </div>
                      
                      <p className="car-title">{conversation.carTitle}</p>
                      
                      <p className="last-message">
                        {conversation.lastMessage}
                      </p>
                    </div>

                    {unreadCount > 0 && (
                      <div className="unread-badge">
                        {unreadCount}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {selectedConversation && (
        <ChatSystem
          isOpen={true}
          onClose={() => setSelectedConversation(null)}
          conversationId={selectedConversation.id}
          receiverId={selectedConversation.receiverId}
          receiverName={selectedConversation.receiverName}
          carTitle={selectedConversation.carTitle}
        />
      )}

      <StartChatModal
        isOpen={showStartChat}
        onClose={() => setShowStartChat(false)}
      />
    </>
  );
};

export default ConversationsList;
