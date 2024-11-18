import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './css/Login.css'; // Import the CSS file for styling
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with username:', username, 'password:', password);
    try {
      const response = await axios.post(`${API_BASE_URL}/token`, 
        new URLSearchParams({
          username: username,
          password: password
        }), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
      localStorage.setItem('token', response.data.access_token);
      console.log('Token received:', response.data.access_token);
      navigate('/profile');
    } catch (error) {
      console.error('There was an error logging in!', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            placeholder="Email" 
            required 
          />
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Password" 
            required 
          />
          <button type="submit" className="login-button">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
