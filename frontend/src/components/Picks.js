import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { List, ListItem, ListItemText, Container, Typography } from '@mui/material';

const Picks = () => {
  const [picks, setPicks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPicks = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const response = await axios.get('http://127.0.0.1:8000/picks', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPicks(response.data);
      } catch (error) {
        console.error('Error fetching picks:', error);
      }
    };

    fetchPicks();
  }, [navigate]);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        My Picks
      </Typography>
      <List>
        {picks.map((pick) => (
          <ListItem key={pick.id}>
            <ListItemText
              primary={`Year: ${pick.year}, Week: ${pick.week}, Team: ${pick.team_name}, Pick Number: ${pick.pick_number}`}
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default Picks;
