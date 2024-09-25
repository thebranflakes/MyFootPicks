import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './css/Standings.css';

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
            {[1, 2, 3].map((week) => (
              <React.Fragment key={week}>
                <tr>
                  <td colSpan={standings.length} className="week-row">Week {week}</td>
                </tr>
                <tr>
                  {standings.map((user) => (
                    <td key={user.username}>
                      {user.picks
                        .filter((pick) => pick.week === week)
                        .map((pick, index) => (
                          <div key={index}>
                            {pick.team_abbreviation} {getStatus(pick.correct)}
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
                  <div className="record">{user.record}</div>
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
