import React, { useState } from 'react';
import axios from 'axios';
import '../styles/RedditView.css';

function RedditView() { // Recibe setView como prop
  const [idReddit, setReddit] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:8080/users/reddit', {
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
          />
          <button type="submit">Send</button>
        </form>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default RedditView;