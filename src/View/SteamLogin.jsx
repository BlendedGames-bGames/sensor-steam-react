import React, { useState } from 'react';
import axios from 'axios';

function SteamLogin({ setView }) {
  const [apiKey, setApiKey] = useState('');
  const [userIdSteam, setIDUser] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:8080/users/steam', {
        key_steam: apiKey,
        id_user_steam: userIdSteam,
      });

      if (response.status === 200) {
        setMessage('Usuario entcontrado en Steam.');
        setView('dashboard');
      } else {
        setMessage('Error al consultar.');
      }
    } catch (error) {
      setMessage('Error del servidor: ' + error.response?.data?.error || error.message);
    }
  };

  return (
    <div>
      <h1>Connect to Steam</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Steam Api Key:</label>
          <input
            type="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Steam User ID:</label>
          <input
            type="userIdSteam"
            value={userIdSteam}
            onChange={(e) => setIDUser(e.target.value)}
            required
          />
        </div>
        <button type="submit">Send</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default SteamLogin;