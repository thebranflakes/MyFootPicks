import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './css/Picks.css';

const teamMap = {
  1: { id: 1, abbreviation: "ARI", name: "Arizona Cardinals" },
  2: { id: 2, abbreviation: "ATL", name: "Atlanta Falcons" },
  3: { id: 3, abbreviation: "BAL", name: "Baltimore Ravens" },
  4: { id: 4, abbreviation: "BUF", name: "Buffalo Bills" },
  5: { id: 5, abbreviation: "CAR", name: "Carolina Panthers" },
  6: { id: 6, abbreviation: "CHI", name: "Chicago Bears" },
  7: { id: 7, abbreviation: "CIN", name: "Cincinnati Bengals" },
  8: { id: 8, abbreviation: "CLE", name: "Cleveland Browns" },
  9: { id: 9, abbreviation: "DAL", name: "Dallas Cowboys" },
  10: { id: 10, abbreviation: "DEN", name: "Denver Broncos" },
  11: { id: 11, abbreviation: "DET", name: "Detroit Lions" },
  12: { id: 12, abbreviation: "GB", name: "Green Bay Packers" },
  13: { id: 13, abbreviation: "HOU", name: "Houston Texans" },
  14: { id: 14, abbreviation: "IND", name: "Indianapolis Colts" },
  15: { id: 15, abbreviation: "JAX", name: "Jacksonville Jaguars" },
  16: { id: 16, abbreviation: "KC", name: "Kansas City Chiefs" },
  17: { id: 17, abbreviation: "LV", name: "Las Vegas Raiders" },
  18: { id: 18, abbreviation: "LAC", name: "Los Angeles Chargers" },
  19: { id: 19, abbreviation: "LAR", name: "Los Angeles Rams" },
  20: { id: 20, abbreviation: "MIA", name: "Miami Dolphins" },
  21: { id: 21, abbreviation: "MIN", name: "Minnesota Vikings" },
  22: { id: 22, abbreviation: "NE", name: "New England Patriots" },
  23: { id: 23, abbreviation: "NO", name: "New Orleans Saints" },
  24: { id: 24, abbreviation: "NYG", name: "New York Giants" },
  25: { id: 25, abbreviation: "NYJ", name: "New York Jets" },
  26: { id: 26, abbreviation: "PHI", name: "Philadelphia Eagles" },
  27: { id: 27, abbreviation: "PIT", name: "Pittsburgh Steelers" },
  28: { id: 28, abbreviation: "SF", name: "San Francisco 49ers" },
  29: { id: 29, abbreviation: "SEA", name: "Seattle Seahawks" },
  30: { id: 30, abbreviation: "TB", name: "Tampa Bay Buccaneers" },
  31: { id: 31, abbreviation: "TEN", name: "Tennessee Titans" },
  32: { id: 32, abbreviation: "WSH", name: "Washington Commanders" }
};

const week1StartDate = new Date('2024-09-04');
const weekDuration = 7;
const maxWeeks = 16;

const getCurrentWeek = () => {
  const today = new Date();
  const diffTime = Math.abs(today - week1StartDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const currentWeek = Math.floor(diffDays / weekDuration) + 1;
  return Math.min(currentWeek, maxWeeks);
};

const Picks = () => {
  const [availableTeams, setAvailableTeams] = useState(Object.values(teamMap));
  const [pick1, setPick1] = useState('');
  const [pick2, setPick2] = useState('');
  const [userPicks, setUserPicks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());

  useEffect(() => {
    // Reset the picks when changing weeks
    setPick1('');
    setPick2('');
    fetchUserPicks();
  }, [selectedWeek]);

  const fetchUserPicks = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://127.0.0.1:8000/picks', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Filter picks for the selected week
      const picksForSelectedWeek = response.data.filter(pick => pick.year === 2024 && pick.week === selectedWeek);

      // Separate picks based on pick_number
      const pick1Data = picksForSelectedWeek.find(pick => pick.pick_number === 1);
      const pick2Data = picksForSelectedWeek.find(pick => pick.pick_number === 2);

      setUserPicks(picksForSelectedWeek);

      // Set state for the current picks if they exist
      setPick1(pick1Data ? pick1Data.team_abbreviation : '');
      setPick2(pick2Data ? pick2Data.team_abbreviation : '');

      // Exclude already picked teams from availableTeams
      const pickedTeamIds = picksForSelectedWeek.map(pick => pick.team_id);
      const filteredTeams = Object.values(teamMap).filter(
        team => !pickedTeamIds.includes(team.id)
      );
      setAvailableTeams(filteredTeams);
      
    } catch (error) {
      console.error('Error fetching user picks:', error);
    }
  };

  const handlePickSubmit = async (pickNumber, teamAbbreviation) => {
    const token = localStorage.getItem('token');

    const teamId = Object.values(teamMap).find(team => team.abbreviation === teamAbbreviation)?.id;

    if (!teamId) {
      console.error('Invalid team selected, could not find team ID for abbreviation:', teamAbbreviation);
      alert('Invalid team selected');
      return;
    }

    try {
      await axios.post('http://127.0.0.1:8000/picks', {
        team_id: teamId,
        week: selectedWeek,
        pick_number: pickNumber,
        year: 2024
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(`Pick ${pickNumber} submitted successfully!`);
      fetchUserPicks();  // Refresh the picks after submission
    } catch (error) {
      console.error(`Error submitting pick ${pickNumber}:`, error);
      alert('Failed to submit the pick. Please try again.');
    }
  };

  const handleDeletePick = async (pickId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://127.0.0.1:8000/picks/${pickId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(`Pick deleted successfully!`);
      fetchUserPicks();  // Refresh picks after deletion
    } catch (error) {
      console.error(`Error deleting pick:`, error);
      alert('Failed to delete the pick. Please try again.');
    }
  };

  const handlePick1Submit = () => handlePickSubmit(1, pick1);
  const handlePick2Submit = () => handlePickSubmit(2, pick2);

  return (
    <div className="picks-container">
      <div className="dropdowns">
        <label>Select Week:</label>
        <select value={selectedWeek} onChange={(e) => setSelectedWeek(Number(e.target.value))}>
          {[...Array(maxWeeks).keys()].map(week => (
            <option key={week + 1} value={week + 1}>
              Week {week + 1}
            </option>
          ))}
        </select>
      </div>

      <div className="pick-section">
        <div className="pick">
          <h3>Your current pick 1:</h3>
          {userPicks.some(pick => pick.pick_number === 1) ? (
            <>
              <p>{userPicks.find(pick => pick.pick_number === 1)?.team_name}</p>
              <button className="delete-button" onClick={() => handleDeletePick(userPicks.find(pick => pick.pick_number === 1)?.id)}>
                Delete Pick 1
              </button>
            </>
          ) : (
            <>
              <select value={pick1} onChange={(e) => setPick1(e.target.value)}>
                <option value="">Select a team</option>
                {availableTeams.map(team => (
                  <option key={team.id} value={team.abbreviation}>
                    {team.name}
                  </option>
                ))}
              </select>
              <button onClick={handlePick1Submit}>Submit Pick 1</button>
            </>
          )}
        </div>

        <div className="pick">
          <h3>Your current pick 2:</h3>
          {userPicks.some(pick => pick.pick_number === 2) ? (
            <>
              <p>{userPicks.find(pick => pick.pick_number === 2)?.team_name}</p>
              <button className="delete-button" onClick={() => handleDeletePick(userPicks.find(pick => pick.pick_number === 2)?.id)}>
                Delete Pick 2
              </button>
            </>
          ) : (
            <>
              <select value={pick2} onChange={(e) => setPick2(e.target.value)}>
                <option value="">Select a team</option>
                {availableTeams.map(team => (
                  <option key={team.id} value={team.abbreviation}>
                    {team.name}
                  </option>
                ))}
              </select>
              <button onClick={handlePick2Submit}>Submit Pick 2</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Picks;