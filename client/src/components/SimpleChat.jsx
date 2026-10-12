import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../config/api';
import '../Styles/styles/SimpleChat.css';

const SimpleChat = () => {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Get current user from localStorage
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

    try {
      const response = await fetch(`${API_BASE_URL}/api/conversations/${activeChat._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: newMessage.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
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
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!currentUser) {
    return (
      <div className="simple-chat">
        <div className="chat-login-required">
          <p>Please log in to use the chat feature</p>
        </div>
      </div>
    );
  }

  return (
    <div className="simple-chat">
      {/* Chat Sidebar */}
      <div className="chat-sidebar">
        <div className="chat-header">
          <h3>Messages</h3>
          <button 
            className="new-chat-btn"
            onClick={() => setShowNewChat(!showNewChat)}
          >
            +
          </button>
        </div>

        {showNewChat && (
          <div className="new-chat-section">
            <h4>Start New Chat</h4>
            <div className="users-list">
              {users
                .filter(user => user._id !== currentUser.id)
                .map(user => (
                  <div 
                    key={user._id}
                    className="user-item"
                    onClick={() => startNewConversation(user._id)}
                  >
                    <div className="user-avatar">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="user-info">
                      <div className="user-name">{user.name || 'User'}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        <div className="conversations-list">
          {conversations.map(conversation => {
            const otherUser = getOtherParticipant(conversation);
            return (
              <div 
                key={conversation._id}
                className={`conversation-item ${activeChat?._id === conversation._id ? 'active' : ''}`}
                onClick={() => selectConversation(conversation)}
              >
                <div className="conversation-avatar">
                  {otherUser.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="conversation-info">
                  <div className="conversation-name">{otherUser.name || 'User'}</div>
                  <div className="conversation-preview">
                    {conversation.lastMessage?.content || 'No messages yet'}
                  </div>
                </div>
                <div className="conversation-time">
                  {conversation.lastMessage && formatTime(conversation.lastMessage.createdAt)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        {activeChat ? (
          <>
            <div className="chat-area-header">
              <div className="chat-participant">
                <div className="participant-avatar">
                  {getOtherParticipant(activeChat).name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="participant-name">
                  {getOtherParticipant(activeChat).name || 'User'}
                </div>
              </div>
            </div>

            <div className="messages-container">
              {messages.map(message => (
                <div 
                  key={message._id}
                  className={`message ${message.senderId === currentUser.id ? 'sent' : 'received'}`}
                >
                  <div className="message-content">
                    {message.content}
                  </div>
                  <div className="message-time">
                    {formatTime(message.createdAt)}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className="message-input-form" onSubmit={sendMessage}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="message-input"
              />
              <button type="submit" className="send-btn">
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleChat;
