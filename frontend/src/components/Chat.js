import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/chat_messages');
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://127.0.0.1:8000/chat_messages', { message }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMessage('');
      const response = await axios.get('http://127.0.0.1:8000/chat_messages');
      setMessages(response.data);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div>
      <h2>Chat</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="Type a message" 
          required 
        />
        <button type="submit">Send</button>
      </form>
      <ul>
        {messages.map(msg => (
          <li key={msg.id}>{msg.username}: {msg.message}</li>
        ))}
      </ul>
    </div>
  );
};

export default Chat;
