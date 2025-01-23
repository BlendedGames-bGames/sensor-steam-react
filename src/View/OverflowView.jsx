import React, { useState } from 'react';
import axios from 'axios';
import '../styles/OverflowView.css';

function OverflowView() {
  const [message, setMessage] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Login Stack Overflow');
    const clientId = '30672';  // Tu client_id registrado en Stack Overflow
    const redirectUri = 'http://localhost:8080/users/callback-stack-overflow'; // URL exacta registrada en Stack Overflow
    const scope = 'read_inbox,private_info';
    const state = 'xyz123';  // Un valor aleatorio para prevención CSRF

    const authUrl = `https://stackoverflow.com/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;

    window.open(authUrl, '_blank');
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Connect to Stack Overflow</h1>
        <p>{message}</p>
        <button type="submit" onClick={handleLogin}>Login with Stack Overflow</button>
      </div>
    </div>
  );
}

export default OverflowView;
