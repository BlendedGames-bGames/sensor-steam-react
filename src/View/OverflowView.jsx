import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/OverflowView.css';

function OverflowView() {
  const [message, setMessage] = useState('');
  const [hasPlayer, setHasPlayer] = useState(false);
  const [todayPoints, setTodayPoints] = useState(0);
  const [yesterdayPoints, setYesterdayPoints] = useState(0);
  const [isWaiting, setIsWaiting] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:8080/users/all');

        if (response.status === 201) {
          const user = response.data[0];

          if (user.id_player_stack != null) {
            console.log(user.id_player_stack);
            setHasPlayer(true);
          } else {
            setHasPlayer(false);
            setMessage('No se encontró ningún usuario.');
          }
        } else {
          setMessage('No se pudo obtener el usuario.');
        }
      } catch (error) {
        setMessage('Error al comunicarse con el servidor para obtener usuario.');
      }
    };

    const fetchSensorPoints = async () => {
      try {
        const response = await axios.post('http://localhost:8080/users/allPoints', {
          tipe_sensor: 'StackOverflow',
        });

        if (response.status === 200 && response.data.data.length > 0) {
          const sensorPoints = response.data.data;
          const today = parseFloat(sensorPoints[0] || 0);
          const yesterday = parseFloat(sensorPoints[1] || 0);

          setTodayPoints(today);
          setYesterdayPoints(yesterday);
        } else {
          setMessage('No se pudieron obtener los puntos de sensor.');
        }
      } catch (error) {
        setMessage('Error al comunicarse con el servidor para obtener puntos de sensor.');
      }
    };

    fetchSensorPoints();
    fetchUser();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log('Login Stack Overflow');
      const clientId = '30672'; // Tu client_id registrado en Stack Overflow
      const redirectUri = 'http://localhost:8080/users/callback-stack-overflow'; // URL exacta registrada en Stack Overflow
      const scope = 'read_inbox,private_info';
      const state = 'xyz123'; // Valor aleatorio para prevención CSRF

      const authUrl = `https://stackoverflow.com/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;

      window.open(authUrl, '_blank');

      let attempts = 0;
      const intervalId = setInterval(async () => {
        attempts++;
        try {
          const response = await fetch('http://localhost:8080/users/check-stack-overflow-user');
          if (response.ok) {
            const data = await response.json();
            if (data.userCreated) {
              setMessage('Usuario creado exitosamente.');
              setHasPlayer(true);
              clearInterval(intervalId);
            }
          }
        } catch (error) {
          console.error('Error en la solicitud:', error.message);
        }
        if (attempts >= 12) {
          clearInterval(intervalId);
          setMessage('Tiempo de espera agotado. El usuario no se creó.');
        }
      }, 5000);
    } catch (error) {
      setMessage('Error del servidor: ' + error.response?.data?.error || error.message);
    }
  };

  return (
    <div className="login-container">
      {hasPlayer ? (
        <div className="points-container">
          <h1>Your Points</h1>
          <div className="points-box1">Today's points: <span>{todayPoints}</span></div>
          <div className="points-box1">Yesterday's points: <span>{yesterdayPoints}</span></div>
          <div className="points-box2"><span>{message}</span></div>
        </div>
      ) : (
        <div className="login-form">
          <h1>Connect to Stack Overflow</h1>
          <p>{message}</p>
          <button type="submit" onClick={handleLogin}>Login with Stack Overflow</button>
        </div>
      )}
    </div>
  );
}

export default OverflowView;

