import React from 'react';
import { Camera } from 'lucide-react';

const Header = ({ currentPage }) => {
  return (
    <header className="header">
      <div className="logo">
        <Camera size={24} />
        <h1>SecureAccess</h1>
      </div>
      <h2 className="page-title">
        {currentPage === 'login' && 'Login'}
        {currentPage === 'register' && 'Register'}
        {currentPage === 'dashboard' && 'Dashboard'}
        {currentPage === 'bookSlot' && 'Book a Slot'}
        {currentPage === 'notifications' && 'Notifications'}
      </h2>
    </header>
  );
};

export default Header;