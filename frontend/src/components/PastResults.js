import React, { useState, useEffect } from 'react';

const PastResults = () => {
  const [year, setYear] = useState(2023); // Default to the most recent year
  const [picks, setPicks] = useState([]);
  const [users, setUsers] = useState([]);

  // Fetch users to display their usernames
  useEffect(() => {
    fetch(`http://localhost:8000/users`)
      .then(response => response.json())
      .then(data => setUsers(data))
      .catch(error => console.error('Error fetching users:', error));
  }, []);

  // Fetch picks data when the year changes
  useEffect(() => {
    fetch(`http://localhost:8000/picks/${year}`)
      .then(response => response.json())
      .then(data => setPicks(data))
      .catch(error => console.error('Error fetching picks:', error));
  }, [year]);

  const handleYearChange = (e) => {
    setYear(e.target.value);
  };

  return (
    <div>
      <h1>Past Results</h1>
      <div>
        <label htmlFor="year">Select Year: </label>
        <select id="year" value={year} onChange={handleYearChange}>
          <option value={2023}>2023</option>
          <option value={2022}>2022</option>
          <option value={2021}>2021</option>
          <option value={2020}>2020</option>
          <option value={2019}>2019</option>
          <option value={2018}>2018</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>Week</th>
            {users.map(user => (
              <th key={user.id}>{user.username}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 16 }, (_, i) => i + 1).map(week => (
            <tr key={week}>
              <td>Week {week}</td>
              {users.map(user => (
                <td key={user.id}>
                  {picks
                    .filter(pick => pick.user_id === user.id && pick.week === week)
                    .map(pick => (
                      <div key={pick.id}>
                        {pick.team_name} {pick.correct ? '✔️' : '❌'}
                      </div>
                    ))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            {users.map(user => (
              <td key={user.id}>
                {picks.filter(pick => pick.user_id === user.id && pick.correct).length}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default PastResults;
