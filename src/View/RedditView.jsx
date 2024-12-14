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

    // Llamar al endpoint de verificación cada 5 segundos durante 1 minuto
    let attempts = 0;
    const intervalId = setInterval(async () => {
      attempts++;

      try {
        const response = await fetch('http://localhost:8080/users/check-reddit-user');
        if (response.ok) {
          const data = await response.json();
          if (data.userCreated) {
            // Si el usuario fue creado, muestra un mensaje y detén el intervalo
            setMessage('Usuario creado exitosamente.');
            clearInterval(intervalId);
          }
        } else {
          console.error('Error al verificar usuario:', response.status);
        }
      } catch (error) {
        console.error('Error en la solicitud:', error.message);
      }

      // Detener después de 12 intentos (1 minuto)
      if (attempts >= 12) {
        clearInterval(intervalId);
        setMessage('Tiempo de espera agotado. El usuario no se creó.');
      }
    }, 5000); // Cada 5 segundos
  } catch (error) {
    setMessage('Error del servidor: ' + error.response?.data?.error || error.message);
  }
};

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Connect to Reddit</h1>
        <p>{message}</p>
        <button type="submit" onClick={handleLogin} >Login whith Reddit</button>
      </div>
    </div>
  );
}

export default RedditView;