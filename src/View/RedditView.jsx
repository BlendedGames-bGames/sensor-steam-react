import React, { useState } from 'react';
import axios from 'axios';
import '../styles/RedditView.css';

function RedditView() { // Recibe setView como prop
  const [idReddit, setReddit] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.get('http://localhost:8080/users/reddit', {
        idReddit,
      });
      if (response.status === 200) {
        setMessage('Usuario creado exitosamente.');
      } else {
        setMessage('Error al crear el usuario.');
      }
    } catch (error) {
      setMessage('Error del servidor: ' + error.response?.data?.error || error.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      console.log('Login Reddit');
      const clientId = 'L4WM_WKSe6i5hRk55iTe0A';
      const state = 'abc123xyz789'; // Genera un valor aleatorio único
      const redirectUri = 'http://localhost:8080/users/callback';
      const scope = 'identity';

      const authUrl = `https://www.reddit.com/api/v1/authorize?client_id=${clientId}&response_type=code&state=${state}&redirect_uri=${redirectUri}&scope=${scope}`;

      // Abre el enlace de autorización en una nueva pestaña
      window.open(authUrl, '_blank');

      // Abre el enlace de autorización en una nueva pestaña
      window.open(authUrl, '_blank');
      if (response.status === 200) {
        setMessage('Usuario logueado exitosamente.');
      } else {
        setMessage('Error al crear el usuario.');
      }
    } catch (error) {
      setMessage('Error del servidor: ' + error.response?.data?.error || error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h3>Connect to Reddit</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="ID Reddit"
            value={idReddit}
            onChange={(e) => setReddit(e.target.value)}
            required
          />
          <button type="submit">Send</button>
        </form>
        <p>{message}</p>

        <button type="submit" onClick={handleLogin} >Login whith Reddit</button>
      </div>
    </div>
  );
}

export default RedditView;