import React, { useState, useRef, useEffect } from 'react';
import '../Styles/styles/AIAssistant.css';

const AIAssistant = ({ isOpen, onClose, context = 'general' }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const contextPrompts = {
    general: "I'm your CarRent AI assistant. I can help you with car rentals, bookings, and general questions about our platform.",
    customer: "I'm here to help you find the perfect rental car, understand pricing, booking process, and answer any questions about your rentals.",
    owner: "I can assist you with managing your car listings, optimizing pricing, understanding booking management, and growing your rental business.",
    cars: "I can help you find cars that match your needs, explain car features, compare different vehicles, and assist with the booking process.",
    booking: "I'm here to help you with the booking process, payment options, rental policies, and any booking-related questions.",
    manage: "I can assist you with managing your cars, updating listings, handling bookings, and optimizing your rental business."
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 1,
        text: contextPrompts[context] || contextPrompts.general,
        sender: 'ai',
        timestamp: new Date()
      }]);
    }
  }, [isOpen, context]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          context: context,
          conversationHistory: messages.slice(-5) // Send last 5 messages for context
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      const aiMessage = {
        id: Date.now() + 1,
        text: data.response,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble connecting right now. Please try again later or contact our support team for assistance.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getSuggestions = () => {
    const suggestions = {
      general: [
        "How do I rent a car?",
        "What are your pricing options?",
        "How do I become a car owner?",
        "What's included in the rental?"
      ],
      customer: [
        "Show me luxury cars",
        "What documents do I need?",
        "How does insurance work?",
        "Can I extend my rental?"
      ],
      owner: [
        "How do I add my car?",
        "What's the best pricing strategy?",
        "How do I handle maintenance?",
        "When do I get paid?"
      ],
      cars: [
        "Compare these cars",
        "What's the fuel efficiency?",
        "Are there any discounts?",
        "What's the cancellation policy?"
      ]
    };
    return suggestions[context] || suggestions.general;
  };

  if (!isOpen) return null;

  return (
    <div className="ai-assistant-overlay">
      <div className="ai-assistant-container">
        <div className="ai-assistant-header">
          <div className="ai-info">
            <div className="ai-avatar">🤖</div>
            <div>
              <h3>CarRent AI Assistant</h3>
              <span className="ai-status">Online</span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="ai-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.sender}`}>
              <div className="message-content">
                <p>{message.text}</p>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message ai">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length <= 1 && (
          <div className="suggestions">
            <p>Try asking:</p>
            <div className="suggestion-buttons">
              {getSuggestions().map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-btn"
                  onClick={() => setInputMessage(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="ai-input-container">
          <div className="ai-input-wrapper">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about CarRent..."
              rows="1"
              disabled={isLoading}
            />
            <button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="send-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
