import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './css/Standings.css';

const week1StartDate = new Date('2024-09-04');
const weekDuration = 7; // Days per week
const maxWeeks = 16;

const getCurrentWeek = () => {
  const today = new Date();
  const diffTime = Math.abs(today - week1StartDate); // Difference in milliseconds
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
  const currentWeek = Math.floor(diffDays / weekDuration) + 1; // Calculate weeks passed
  return Math.min(currentWeek, maxWeeks); // Ensure it doesn't exceed max weeks
};

const currentWeek = getCurrentWeek();

const Standings = () => {
  const [standings, setStandings] = useState([]);

  useEffect(() => {
    const fetchStandings = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://127.0.0.1:8000/standings/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const sortedStandings = response.data.sort((a, b) => a.username.localeCompare(b.username));
        setStandings(sortedStandings);
      } catch (error) {
        console.error('Error fetching standings:', error);
      }
    };
  
    fetchStandings();
  }, []);

  const getStatus = (correct) => {
    if (correct === 1) return <span className="correct">&#x2714;</span>;
    if (correct === 0) return <span className="incorrect">&#x274C;</span>;
    return null;
  };

  // Function to calculate the record for each user (including ties)
  const calculateRecord = (picks) => {
    const wins = picks.filter(pick => pick.correct === 1).length;
    const losses = picks.filter(pick => pick.correct === 0).length;
    const ties = picks.filter(pick => pick.correct === 2).length;

    return ties > 0 ? `${wins} - ${losses} - ${ties}` : `${wins} - ${losses}`;
  };

  return (
    <div className="standings-container">
      <div className="table-wrapper">
        <table className="standings-table">
          <thead>
            <tr>
              {standings.map((user) => (
                <th key={user.username}>
                  <span className={`username ${user.username.length > 10 ? 'long-username' : ''} ${user.username.length > 15 ? 'very-long-username' : ''}`}>
                    {user.username}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
              {[...Array(currentWeek).keys()].map((weekIndex) => (
              <React.Fragment key={weekIndex + 1}>
                <tr>
                  <td colSpan={standings.length + 1} className="week-row">Week {weekIndex + 1}</td>
                </tr>
                <tr>
                {standings.map((user) => (
                    <td key={user.username}>
                      {user.picks
                        .filter((pick) => pick.week === weekIndex + 1)
                        .map((pick, index) => (
                          <div key={index}>
                            {pick.status === 0 
                              ? 'Hidden' 
                              : (
                                <>
                                  {pick.team_abbreviation} {getStatus(pick.correct)}
                                </>
                              )}
                          </div>
                        ))}
                    </td>
                  ))}
                </tr>
              </React.Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr>
              {standings.map((user) => (
                <th key={user.username}>
                  <span className={`username ${user.username.length > 10 ? 'long-username' : ''} ${user.username.length > 15 ? 'very-long-username' : ''}`}>
                    {user.username}
                  </span>
                </th>
              ))}
            </tr>
            <tr>
              {standings.map((user) => (
                <td key={user.username}>
                  <div className="record">{calculateRecord(user.picks)}</div>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default Standings;
