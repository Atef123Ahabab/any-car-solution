import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config/api';
import '../Styles/styles/EnhancedMessaging.css';

const EnhancedMessaging = () => {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    
    if (userId) {
      setCurrentUser({
        id: userId,
        email: userEmail,
        name: userName || userEmail?.split('@')[0] || 'User'
      });
      fetchConversations();
      fetchUsers();
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/conversations`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const startNewConversation = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          participantId: userId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setActiveChat(data.conversation);
        setMessages([]);
        setShowNewChat(false);
        fetchConversations();
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const tempMessage = {
      _id: Date.now(),
      content: newMessage.trim(),
      senderId: currentUser.id,
      createdAt: new Date().toISOString(),
      isTemp: true
    };

    setMessages(prev => [...prev, tempMessage]);
    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/conversations/${activeChat._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: messageContent
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => prev.map(msg => 
          msg.isTemp && msg.content === messageContent ? data.message : msg
        ));
      } else {
        setMessages(prev => prev.filter(msg => !msg.isTemp));
        setNewMessage(messageContent);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(msg => !msg.isTemp));
      setNewMessage(messageContent);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const selectConversation = (conversation) => {
    setActiveChat(conversation);
    fetchMessages(conversation._id);
    setShowNewChat(false);
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants?.find(p => p._id !== currentUser?.id) || 
           { name: 'Unknown User', email: 'unknown@email.com' };
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { 
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString([], { 
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getMessageStatus = (message) => {
    if (message.isTemp) return 'sending';
    if (message.readBy?.length > 1) return 'read';
    if (message.deliveredTo?.length > 0) return 'delivered';
    return 'sent';
  };

  if (!currentUser) {
    return (
      <div className="enhanced-messaging">
        <div className="chat-login-required">
          <div className="login-prompt">
            <h3>🔒 Authentication Required</h3>
            <p>Please log in to access the messaging system</p>
            <button className="login-btn" onClick={() => window.location.href = '/login'}>
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-messaging">
      {/* Enhanced Sidebar */}
      <div className="chat-sidebar enhanced">
        <div className="sidebar-header">
          <div className="user-profile">
            <div className="user-avatar large">
              {currentUser.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-info">
              <h3>{currentUser.name}</h3>
              <span className="user-status online">Online</span>
            </div>
          </div>
          <button 
            className="new-chat-btn enhanced"
            onClick={() => setShowNewChat(!showNewChat)}
            title="Start new conversation"
          >
            <span className="icon">💬</span>
          </button>
        </div>

        {showNewChat && (
          <div className="new-chat-section enhanced">
            <div className="section-header">
              <h4>Start New Chat</h4>
              <button 
                className="close-section"
                onClick={() => setShowNewChat(false)}
              >
                ×
              </button>
            </div>
            <div className="users-list">
              {users
                .filter(user => user._id !== currentUser.id)
                .map(user => (
                  <div 
                    key={user._id}
                    className="user-item enhanced"
                    onClick={() => startNewConversation(user._id)}
                  >
                    <div className="user-avatar">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                      {onlineUsers.has(user._id) && <div className="online-indicator"></div>}
                    </div>
                    <div className="user-info">
                      <div className="user-name">{user.name || 'User'}</div>
                      <div className="user-email">{user.email}</div>
                      <div className="user-role">{user.userType || 'User'}</div>
                    </div>
                    <div className="user-actions">
                      <span className="chat-icon">💬</span>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        <div className="conversations-list enhanced">
          <div className="list-header">
            <h4>Recent Chats</h4>
            <span className="chat-count">{conversations.length}</span>
          </div>
          {conversations.map(conversation => {
            const otherUser = getOtherParticipant(conversation);
            const isActive = activeChat?._id === conversation._id;
            return (
              <div 
                key={conversation._id}
                className={`conversation-item enhanced ${isActive ? 'active' : ''}`}
                onClick={() => selectConversation(conversation)}
              >
                <div className="conversation-avatar">
                  {otherUser.name?.charAt(0).toUpperCase() || 'U'}
                  {onlineUsers.has(otherUser._id) && <div className="online-indicator"></div>}
                </div>
                <div className="conversation-info">
                  <div className="conversation-header">
                    <div className="conversation-name">{otherUser.name || 'User'}</div>
                    <div className="conversation-time">
                      {conversation.lastMessage && formatTime(conversation.lastMessage.createdAt)}
                    </div>
                  </div>
                  <div className="conversation-preview">
                    {conversation.lastMessage?.content || 'No messages yet'}
                  </div>
                  {conversation.unreadCount > 0 && (
                    <div className="unread-badge">{conversation.unreadCount}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Chat Area */}
      <div className="chat-area enhanced">
        {activeChat ? (
          <>
            <div className="chat-header enhanced">
              <div className="chat-participant">
                <div className="participant-avatar">
                  {getOtherParticipant(activeChat).name?.charAt(0).toUpperCase() || 'U'}
                  {onlineUsers.has(getOtherParticipant(activeChat)._id) && 
                    <div className="online-indicator"></div>
                  }
                </div>
                <div className="participant-info">
                  <div className="participant-name">
                    {getOtherParticipant(activeChat).name || 'User'}
                  </div>
                  <div className="participant-status">
                    {onlineUsers.has(getOtherParticipant(activeChat)._id) ? 'Online' : 'Last seen recently'}
                  </div>
                </div>
              </div>
              <div className="chat-actions">
                <button className="action-btn" title="Video call">📹</button>
                <button className="action-btn" title="Voice call">📞</button>
                <button className="action-btn" title="More options">⋮</button>
              </div>
            </div>

            <div className="messages-container enhanced">
              {messages.map(message => {
                const isSent = message.senderId === currentUser.id;
                const status = getMessageStatus(message);
                return (
                  <div 
                    key={message._id}
                    className={`message enhanced ${isSent ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      {message.content}
                      <div className="message-meta">
                        <span className="message-time">
                          {formatTime(message.createdAt)}
                        </span>
                        {isSent && (
                          <span className={`message-status ${status}`}>
                            {status === 'sending' && '⏳'}
                            {status === 'sent' && '✓'}
                            {status === 'delivered' && '✓✓'}
                            {status === 'read' && '✓✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="typing-indicator">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="typing-text">Typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="message-input-form enhanced" onSubmit={sendMessage}>
              <div className="input-container">
                <button type="button" className="attachment-btn" title="Attach file">
                  📎
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="message-input enhanced"
                />
                <button type="button" className="emoji-btn" title="Add emoji">
                  😊
                </button>
                <button 
                  type="submit" 
                  className={`send-btn enhanced ${newMessage.trim() ? 'active' : ''}`}
                  disabled={!newMessage.trim()}
                >
                  <span className="send-icon">➤</span>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="no-chat-selected enhanced">
            <div className="welcome-message">
              <div className="welcome-icon">💬</div>
              <h3>Welcome to Enhanced Messaging</h3>
              <p>Select a conversation to start messaging or create a new chat</p>
              <button 
                className="start-chat-btn"
                onClick={() => setShowNewChat(true)}
              >
                Start New Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedMessaging;
