import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import MobileApp from './components/MobileApp';
import ThemeToggle from './components/ThemeToggle';
import Home from './pages/Home';
import Cars from './pages/Cars';
import CarDetails from './pages/CarDetails';
import MyBookings from './pages/MyBookings';
import Statistics from './pages/Statistics';
import Servicing from './pages/Servicing';
import Reports from './pages/Reports';
import Chat from './pages/Chat';
import Login from './components/Login';
import CustomerDashboard from './components/CustomerDashboard';
import OwnerDashboard from './components/OwnerDashboard';
import ManageCars from './pages/Owner/Managecars';
import ManageBookings from './pages/Owner/Managebookings';
import AddCar from './pages/AddCar';
import AccountDetails from './pages/AccountDetails';
import "./App.css";
import "./Styles/styles/AIAssistant.css";
import "./Styles/styles/AIAssistantSections.css";
import "./Styles/styles/ThemeToggle.css";
import ConversationsList from './components/ConversationsList';

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();
  const isOwnerPath = location.pathname.startsWith('/owner');

  return (
    <div className="app-container">
      <ThemeToggle />
      <MobileApp>
        {!isOwnerPath && <Navbar setShowLogin={setShowLogin} />}
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/cars" element={<Cars />} />
            <Route path="/car-details/:id" element={<CarDetails />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/servicing" element={<Servicing />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/chat" element={<Chat />} />
            
            {/* Customer Dashboard */}
            <Route path="/dashboard" element={<CustomerDashboard />} />
            
            {/* Owner Routes */}
            <Route path="/owner-dashboard" element={<OwnerDashboard />} />
            <Route path="/manage-cars" element={<ManageCars />} />
            <Route path="/add-car" element={<AddCar />} />
            <Route path="/account-details" element={<AccountDetails />} />
            <Route path="/manage-bookings" element={<ManageBookings />} />
          </Routes>
        </main>
        
        {showLogin && <Login setShowLogin={setShowLogin} />}
      </MobileApp>
    </div>
  );
};

export default App;