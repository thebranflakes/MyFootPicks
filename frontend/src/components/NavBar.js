import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './css/NavBar.css';

const NavBar = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    
    // Call the backend logout endpoint
    const response = await fetch('http://localhost:8000/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
    });

    if (response.ok) {
      // Remove the token from local storage
      localStorage.removeItem('token');
      // Redirect to login page
      navigate('/login');
    } else {
      alert('Logout failed');
    }
  };

  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        {isAuthenticated && <li><Link to="/profile">Profile</Link></li>}
        {isAuthenticated && <li><Link to="/makepicks">Make Picks</Link></li>}
        {isAuthenticated && <li><Link to="/standings">Standings</Link></li>}
        {isAuthenticated && <li><Link to="/chat">Chat</Link></li>}
        {isAuthenticated ? (
          <li><Link to="/login" onClick={handleLogout}>Logout</Link></li>
        ) : (
          <li><Link to="/login">Login</Link></li>
        )}
      </ul>
    </nav>
  );
};

export default NavBar;
