import React, { useState } from 'react';
import axios from 'axios';

function RedditLogin() { // Recibe setView como prop
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
    <div>
      <h1>Usuario Reddit</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="idReddit"
            value={idReddit}
            onChange={(e) => setReddit(e.target.value)}
            required
          />
        </div>
        <button type="submit">Verificar Usuario</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default RedditLogin;