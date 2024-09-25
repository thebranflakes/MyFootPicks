import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './css/Profile.css';
import { YEAR } from '../config';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [picks, setPicks] = useState([]);
  const [record, setRecord] = useState({ wins: 0, losses: 0, ties: 0 });
  const [loading, setLoading] = useState(true);
  const [favoriteColor, setFavoriteColor] = useState('');
  const [favoriteTeam, setFavoriteTeam] = useState('');

  const colors = [
    "Red", 
    "Green", 
    "Blue", 
    "Yellow", 
    "Orange", 
    "Purple", 
    "Pink", 
    "Brown", 
    "Gray", 
    "Black", 
    "White", 
    "Cyan", 
    "Magenta", 
    "Lime", 
    "Maroon", 
    "Navy", 
    "Olive", 
    "Teal", 
    "Tan",
    "Aquamarine", 
    "Fuchsia", 
    "Silver", 
    "Gold", 
    "Coral", 
    "DarkRed", 
    "DarkGreen", 
    "DarkBlue"
  ];

  const teams = [
    "Cardinals", 
    "Falcons", 
    "Ravens", 
    "Bills", 
    "Panthers", 
    "Bears", 
    "Bengals", 
    "Browns", 
    "Cowboys", 
    "Broncos", 
    "Lions", 
    "Packers", 
    "Texans", 
    "Colts", 
    "Jaguars", 
    "Chiefs", 
    "Raiders", 
    "Chargers", 
    "Rams", 
    "Dolphins", 
    "Vikings", 
    "Patriots", 
    "Saints", 
    "Giants", 
    "Jets", 
    "Eagles", 
    "Steelers", 
    "49ers", 
    "Seahawks", 
    "Buccaneers", 
    "Titans", 
    "Commanders"
  ];
  

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        const profileResponse = await axios.get('http://127.0.0.1:8000/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(profileResponse.data);
        setFavoriteColor(profileResponse.data.favorite_color || '');
        setFavoriteTeam(profileResponse.data.favorite_team || '');

        // Fetch all picks for the user
        const picksResponse = await axios.get('http://127.0.0.1:8000/picks', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Calculate W-L-T record from all picks
        let wins = 0, losses = 0, ties = 0;
        picksResponse.data.forEach(pick => {
          if (pick.correct === 1) {
            wins++;
          } else if (pick.correct === 0) {
            losses++;
          } else if (pick.correct === 2) {
            ties++;
          }
        });

        // Filter picks for the year 2024
        const filteredPicks = picksResponse.data.filter(pick => pick.year === YEAR);

        setPicks(filteredPicks);
        setRecord({ wins, losses, ties });
        setLoading(false); // Set loading to false after all data is loaded

      } catch (error) {
        console.error('Error fetching profile or picks:', error);
        setLoading(false); // Ensure loading state is cleared on error
      }
    };

    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.put('http://127.0.0.1:8000/users/me', {
        favorite_color: favoriteColor,
        favorite_team: favoriteTeam
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    }
  };

  const getStatus = (correct) => {
    if (correct === 1) return <span className="correct">&#x2714;</span>;
    if (correct === 0) return <span className="incorrect">&#x274C;</span>;
    if (correct === 2) return <span className="tie">&#x223C;</span>;
    return null;
  };

  if (loading) {
    return <p>Loading...</p>; // Simple loading message
  }

  return (
    <div className="container">
      <h2>{user?.username}'s Profile</h2>
      {user ? (
        <div className="profile-info">
          <p>Email: {user.email}</p>
          <div>
            <label>Favorite Color:</label>
            <select 
              value={favoriteColor} 
              onChange={e => setFavoriteColor(e.target.value)}
            >
              <option value="" disabled>Select a color</option>
              {colors.map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Favorite Team:</label>
            <select 
              value={favoriteTeam} 
              onChange={e => setFavoriteTeam(e.target.value)}
            >
              <option value="" disabled>Select a team</option>
              {teams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>
          <button onClick={handleUpdate}>Update Profile</button>
        </div>
      ) : (
        <p>Loading...</p>
      )}

      {/* Display All-Time Record */}
      <h3>All-Time Record</h3>
      <p className="record">
        {record.wins} Wins - {record.losses} Losses
        {record.ties > 0 && ` - ${record.ties} Ties`}
      </p>

      {/* Picks Table */}
      <h3>2024 Picks</h3>
      <table className="picks-table">
        <thead>
          <tr>
            <th>Week</th>
            <th>Pick 1</th>
            <th>Pick 2</th>
          </tr>
        </thead>
        <tbody>
          {picks.reduce((acc, pick, index, array) => {
            if (index % 2 === 0) {
              const nextPick = array[index + 1];
              acc.push(
                <tr key={pick.week}>
                  <td>{pick.week}</td>
                  <td>
                    {pick.abbreviation}{' '}
                    {getStatus(pick.correct)}
                  </td>
                  <td>
                    {nextPick && (
                      <>
                        {nextPick.abbreviation}{' '}
                        {getStatus(nextPick.correct)}
                      </>
                    )}
                  </td>
                </tr>
              );
            }
            return acc;
          }, [])}
        </tbody>
      </table>
    </div>
  );
};

export default Profile;
