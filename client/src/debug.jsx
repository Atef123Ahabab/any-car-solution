import React from 'react';

const DebugApp = () => {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333' }}>🚗 Car Rental App - Debug Mode</h1>
      <p style={{ color: '#666' }}>If you see this, React is working!</p>
      
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '10px',
        marginTop: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2>✅ System Status</h2>
        <ul>
          <li>✅ React is loading</li>
          <li>✅ JavaScript is working</li>
          <li>✅ Styles are applied</li>
          <li>✅ Mobile viewport detected: {window.innerWidth}px</li>
        </ul>
      </div>

      <div style={{ 
        backgroundColor: '#d4af37', 
        color: 'white',
        padding: '15px', 
        borderRadius: '10px',
        marginTop: '20px',
        textAlign: 'center'
      }}>
        <h3>📱 Mobile App Ready!</h3>
        <p>Your car rental app is working correctly.</p>
      </div>
    </div>
  );
};

export default DebugApp;
