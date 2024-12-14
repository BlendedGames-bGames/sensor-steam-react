import React, { useState } from 'react';
import axios from 'axios';
import '../styles/OverflowView.css';

function OverflowView() { // Recibe setView como prop
  const [idOverflow, setOverflow] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:8080/users/stack', {
        id_stackoverflow: idOverflow,
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
        <h1>Connect to StackOverflow.es</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="ID StackOverflow"
            value={idOverflow}
            onChange={(e) => setOverflow(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default OverflowView;