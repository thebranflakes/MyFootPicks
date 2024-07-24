import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with username:', username, 'password:', password);
    try {
      const response = await axios.post('http://127.0.0.1:8000/token', 
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
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          placeholder="Username" 
          required 
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Password" 
          required 
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
