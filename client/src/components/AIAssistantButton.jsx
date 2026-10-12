import React, { useState } from 'react';
import AIAssistant from './AIAssistant';
import '../Styles/styles/AIAssistantButton.css';

const AIAssistantButton = ({ context = 'general', buttonText = 'AI Assistance for your luxury' }) => {
  const [isAIOpen, setIsAIOpen] = useState(false);

  return (
    <>
      <button 
        className="ai-assistant-btn"
        onClick={() => setIsAIOpen(true)}
      >
        <div className="ai-btn-icon">🤖</div>
        <span>{buttonText}</span>
        <div className="ai-btn-pulse"></div>
      </button>
      
      <AIAssistant 
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        context={context}
      />
    </>
  );
};

export default AIAssistantButton;
