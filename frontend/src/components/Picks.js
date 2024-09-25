import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

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
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Year</TableCell>
            <TableCell>Week</TableCell>
            <TableCell>Team</TableCell>
            <TableCell>Pick Number</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {picks.map((pick) => (
            <TableRow key={pick.id}>
              <TableCell>{pick.year}</TableCell>
              <TableCell>{pick.week}</TableCell>
              <TableCell>{pick.team_name}</TableCell>
              <TableCell>{pick.pick_number}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
};

export default Picks;
