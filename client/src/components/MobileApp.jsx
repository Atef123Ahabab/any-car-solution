import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import '../Styles/styles/MobileApp.css';

const MobileApp = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallBanner(false);
      }
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    setDeferredPrompt(null);
  };

  const isMobile = window.innerWidth <= 768;

  return (
    <div className="mobile-app-wrapper">
      {showInstallBanner && (
        <div className="install-banner">
          <div className="install-content">
            <span>Install Car Rental App</span>
            <div>
              <button className="install-btn" onClick={handleInstallClick}>
                Install
              </button>
              <button className="dismiss-btn" onClick={handleDismiss}>
                ×
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="mobile-content">
        <div className="main-content">
          {children}
        </div>
        
        {isMobile && (
          <nav className="mobile-bottom-nav">
            <Link 
              to="/" 
              className={`mobile-nav-item ${location.pathname === '/' ? 'active' : ''}`}
            >
              <div className="mobile-nav-icon">🏠</div>
              <span>Home</span>
            </Link>
            <Link 
              to="/cars" 
              className={`mobile-nav-item ${location.pathname === '/cars' ? 'active' : ''}`}
            >
              <div className="mobile-nav-icon">🚗</div>
              <span>Cars</span>
            </Link>
            <Link 
              to="/my-bookings" 
              className={`mobile-nav-item ${location.pathname === '/my-bookings' ? 'active' : ''}`}
            >
              <div className="mobile-nav-icon">📋</div>
              <span>Bookings</span>
            </Link>
            <Link 
              to="/servicing" 
              className={`mobile-nav-item ${location.pathname === '/servicing' ? 'active' : ''}`}
            >
              <div className="mobile-nav-icon">🔧</div>
              <span>Service</span>
            </Link>
          </nav>
        )}
      </div>
    </div>
  );
};

export default MobileApp;
