import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import '../Styles/styles/ChatSystem.css';

const ChatSystem = ({ isOpen, onClose, conversationId, receiverId, receiverName, carTitle }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const currentUser = {
    id: localStorage.getItem('userId'),
    name: localStorage.getItem('userEmail')?.split('@')[0] || 'User',
    type: localStorage.getItem('userType') || 'customer'
  };

  useEffect(() => {
    if (isOpen && conversationId) {
      // Initialize socket connection
      const newSocket = io('http://localhost:3000');
      setSocket(newSocket);

      newSocket.on('connect', () => {
        setIsConnected(true);
        newSocket.emit('join', currentUser.id);
        newSocket.emit('joinConversation', conversationId);
        
        // Mark messages as read when opening chat
        newSocket.emit('markAsRead', {
          conversationId,
          userId: currentUser.id,
          userType: currentUser.type
        });
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      newSocket.on('newMessage', (message) => {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      });

      newSocket.on('userTyping', (data) => {
        if (data.userId !== currentUser.id) {
          setTypingUser(data.isTyping ? data.userName : '');
        }
      });

      newSocket.on('messageError', (error) => {
        console.error('Message error:', error);
      });

      // Fetch existing messages
      fetchMessages();

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isOpen, conversationId]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/chat/messages/${conversationId}`);
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages);
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && socket && isConnected) {
      const messageData = {
        conversationId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderType: currentUser.type,
        message: newMessage.trim(),
        receiverId
      };

      socket.emit('sendMessage', messageData);
      setNewMessage('');
      
      // Stop typing indicator
      socket.emit('typing', {
        conversationId,
        userId: currentUser.id,
        userName: currentUser.name,
        isTyping: false
      });
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (socket && isConnected) {
      // Send typing indicator
      socket.emit('typing', {
        conversationId,
        userId: currentUser.id,
        userName: currentUser.name,
        isTyping: true
      });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', {
          conversationId,
          userId: currentUser.id,
          userName: currentUser.name,
          isTyping: false
        });
      }, 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="chat-system-overlay">
      <div className="chat-system-container">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <h3>{receiverName}</h3>
            <p className="car-title">{carTitle}</p>
            <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? '● Online' : '● Offline'}
            </span>
          </div>
          <button className="chat-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Messages Area */}
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="no-messages">
              <p>Start a conversation about the {carTitle}</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className={`message ${message.senderId === currentUser.id ? 'sent' : 'received'}`}
              >
                <div className="message-content">
                  <p>{message.message}</p>
                  <span className="message-time">{formatTime(message.timestamp)}</span>
                </div>
              </div>
            ))
          )}
          
          {/* Typing Indicator */}
          {typingUser && (
            <div className="typing-indicator">
              <span>{typingUser} is typing...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="chat-input-area">
          <div className="chat-input-container">
            <textarea
              value={newMessage}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${receiverName}...`}
              className="chat-input"
              rows="1"
              disabled={!isConnected}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !isConnected}
              className="chat-send-btn"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSystem;
