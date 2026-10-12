import React, { useState } from 'react';
import '../Styles/styles/SocialMediaIntegration.css';

const SocialMediaIntegration = ({ carData, userInfo }) => {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('');

  const socialPlatforms = [
    {
      name: 'WhatsApp',
      icon: '📱',
      color: '#25D366',
      action: 'share',
      url: (text, url) => `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
    },
    {
      name: 'Facebook',
      icon: '📘',
      color: '#1877F2',
      action: 'share',
      url: (text, url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`
    },
    {
      name: 'Twitter',
      icon: '🐦',
      color: '#1DA1F2',
      action: 'share',
      url: (text, url) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      color: '#0A66C2',
      action: 'share',
      url: (text, url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    },
    {
      name: 'Telegram',
      icon: '✈️',
      color: '#0088CC',
      action: 'share',
      url: (text, url) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
    },
    {
      name: 'Instagram',
      icon: '📷',
      color: '#E4405F',
      action: 'message',
      url: () => 'https://www.instagram.com/'
    },
    {
      name: 'Messenger',
      icon: '💬',
      color: '#006AFF',
      action: 'message',
      url: () => 'https://www.messenger.com/'
    },
    {
      name: 'Discord',
      icon: '🎮',
      color: '#5865F2',
      action: 'message',
      url: () => 'https://discord.com/'
    }
  ];

  const generateShareText = () => {
    if (carData) {
      return `Check out this amazing ${carData.year} ${carData.make} ${carData.model} available for rent! Starting at $${carData.pricing?.dailyRate}/day. Perfect for your next adventure! 🚗✨`;
    }
    return `Check out this awesome car rental platform! Find the perfect car for your next trip! 🚗✨`;
  };

  const getCurrentUrl = () => {
    return window.location.href;
  };

  const handleSocialAction = (platform) => {
    const shareText = generateShareText();
    const currentUrl = getCurrentUrl();
    
    if (platform.action === 'share') {
      const url = platform.url(shareText, currentUrl);
      window.open(url, '_blank', 'width=600,height=400');
    } else {
      // For messaging platforms, open in new tab
      window.open(platform.url(), '_blank');
    }
  };

  const copyToClipboard = async () => {
    const shareText = generateShareText();
    const currentUrl = getCurrentUrl();
    const fullText = `${shareText}\n\n${currentUrl}`;
    
    try {
      await navigator.clipboard.writeText(fullText);
      alert('Link copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = fullText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link copied to clipboard!');
    }
  };

  const sendEmail = () => {
    const shareText = generateShareText();
    const currentUrl = getCurrentUrl();
    const subject = carData ? `Check out this ${carData.make} ${carData.model}!` : 'Amazing Car Rental Platform';
    const body = `${shareText}\n\n${currentUrl}`;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="social-media-integration">
      <div className="social-actions">
        <button 
          className="share-btn primary"
          onClick={() => setShareModalOpen(true)}
        >
          <span className="share-icon">🔗</span>
          Share & Connect
        </button>
      </div>

      {shareModalOpen && (
        <div className="modal-overlay" onClick={() => setShareModalOpen(false)}>
          <div className="social-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Share & Connect</h3>
              <button 
                className="close-btn"
                onClick={() => setShareModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="social-content">
              <div className="share-preview">
                <h4>Share this {carData ? 'car' : 'platform'}</h4>
                <p className="share-text">{generateShareText()}</p>
              </div>

              <div className="social-platforms">
                <h4>Choose Platform</h4>
                <div className="platforms-grid">
                  {socialPlatforms.map((platform) => (
                    <button
                      key={platform.name}
                      className="platform-btn"
                      style={{ '--platform-color': platform.color }}
                      onClick={() => handleSocialAction(platform)}
                      title={`${platform.action === 'share' ? 'Share on' : 'Message via'} ${platform.name}`}
                    >
                      <span className="platform-icon">{platform.icon}</span>
                      <span className="platform-name">{platform.name}</span>
                      <span className="platform-action">
                        {platform.action === 'share' ? 'Share' : 'Message'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="additional-actions">
                <h4>Other Options</h4>
                <div className="action-buttons">
                  <button className="action-btn" onClick={copyToClipboard}>
                    <span>📋</span>
                    Copy Link
                  </button>
                  <button className="action-btn" onClick={sendEmail}>
                    <span>📧</span>
                    Email
                  </button>
                </div>
              </div>

              {userInfo && (
                <div className="collaboration-section">
                  <h4>Collaboration Features</h4>
                  <div className="collab-options">
                    <button className="collab-btn">
                      <span>👥</span>
                      Invite Friends to Compare
                    </button>
                    <button className="collab-btn">
                      <span>💬</span>
                      Start Group Chat
                    </button>
                    <button className="collab-btn">
                      <span>📅</span>
                      Plan Trip Together
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialMediaIntegration;
