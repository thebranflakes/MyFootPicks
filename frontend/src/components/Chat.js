import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './css/Chat.css';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Fetch messages from the server
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/chat_messages/`);
        // Sort messages oldest to newest for bottom-up display
        setMessages(response.data.reverse());
      } catch (error) {
        console.error('Error fetching chat messages:', error);
      }
    };

    fetchMessages();
  }, []);

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    try {
      const response = await axios.post('${API_BASE_URL}/chat_messages/', {
        message: newMessage,
      });
      setMessages((prevMessages) => [...prevMessages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Render each message
  const renderMessage = (msg) => (
    <div
      className={`chat-message ${msg.username === 'YourUsername' ? 'current-user' : 'other-user'}`}
      key={msg.id}
    >
      <img src={msg.image_url} alt={`${msg.username}'s avatar`} />
      <div className="message-content">
        <div className="message-header">
          <span className="username" style={{ color: msg.favoriteColor }}>{msg.username}</span>
          <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
        </div>
        <div className="message-text">{msg.message}</div>
      </div>
    </div>
  );

  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>
      <form className="chat-input" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Type a message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
