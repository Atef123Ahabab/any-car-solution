import React, { useState, useEffect } from 'react';
import ChatSystem from './ChatSystem';
import '../Styles/styles/StartChatModal.css';

const StartChatModal = ({ isOpen, onClose }) => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  const currentUser = {
    id: localStorage.getItem('userId'),
    type: localStorage.getItem('userType') || 'customer'
  };

  useEffect(() => {
    if (isOpen) {
      fetchCars();
    }
  }, [isOpen]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/cars');
      const data = await response.json();
      
      if (data.success) {
        // Filter cars based on user type
        const filteredCars = currentUser.type === 'customer' 
          ? data.cars.filter(car => car.ownerId !== currentUser.id)
          : data.cars.filter(car => car.ownerId === currentUser.id);
        setCars(filteredCars);
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (car) => {
    try {
      const response = await fetch('http://localhost:3000/api/chat/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carId: car._id,
          customerId: currentUser.type === 'customer' ? currentUser.id : car.customerId,
          ownerId: currentUser.type === 'owner' ? currentUser.id : car.ownerId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSelectedCar(car);
        setConversationId(data.conversation._id);
        setShowChat(true);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="start-chat-overlay">
        <div className="start-chat-container">
          <div className="start-chat-header">
            <h2>Start a Conversation</h2>
            <button className="start-chat-close-btn" onClick={onClose}>
              ✕
            </button>
          </div>

          <div className="start-chat-content">
            {loading ? (
              <div className="start-chat-loading">
                <p>Loading cars...</p>
              </div>
            ) : cars.length === 0 ? (
              <div className="no-cars">
                <p>No cars available for chat</p>
                <span>
                  {currentUser.type === 'customer' 
                    ? 'Browse cars to start chatting with owners'
                    : 'Add cars to your listing to receive customer messages'
                  }
                </span>
              </div>
            ) : (
              <div className="cars-grid">
                {cars.map((car) => (
                  <div key={car._id} className="chat-car-card" onClick={() => handleStartChat(car)}>
                    <div className="chat-car-image">
                      <img 
                        src={car.images && car.images.length > 0 
                          ? `http://localhost:3000${car.images[0].url}`
                          : `http://localhost:3000/uploads/placeholder-car.jpg`
                        }
                        alt={`${car.year} ${car.make} ${car.model}`}
                      />
                    </div>
                    <div className="chat-car-info">
                      <h4>{car.year} {car.make} {car.model}</h4>
                      <p className="chat-car-price">${car.pricing?.dailyRate}/day</p>
                      <p className="chat-car-location">{car.location?.city}, {car.location?.state}</p>
                    </div>
                    <div className="chat-action">
                      <span>💬 Start Chat</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showChat && selectedCar && (
        <ChatSystem
          isOpen={showChat}
          onClose={() => {
            setShowChat(false);
            setSelectedCar(null);
            onClose();
          }}
          conversationId={conversationId}
          receiverId={currentUser.type === 'customer' ? selectedCar.ownerId : selectedCar.customerId}
          receiverName={currentUser.type === 'customer' ? 'Owner' : 'Customer'}
          carTitle={`${selectedCar.year} ${selectedCar.make} ${selectedCar.model}`}
        />
      )}
    </>
  );
};

export default StartChatModal;
