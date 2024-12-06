import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Dashboard.css";

function Dashboard() {
  const [points, setPoints] = useState({
    social: 0,
    fisica: 0,
    afectivo: 0,
    cognitivo: 0,
    linguistico: 0,
  });
  const [yesterdayPoints, setYesterdayPoints] = useState(0);
  const [todayPoints, setTodayPoints] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [user, setUser] = useState({ name: "", });

  useEffect(() => {
    const fetchSensorPoints = async () => {
      try {
        const response = await axios.get("http://localhost:8080/users/allPoints");

        if (response.status === 201 && response.data.response.length > 0) { // Correguir esto, es 200 el status
          const sensorPoints = response.data.response; // Acceder al arreglo "response"
          // Validar que hay al menos un elemento en el arreglo
          if (sensorPoints.length == 1) {
            // Asignar puntos de hoy y ayer en base a la posición en el arreglo
            const today = parseFloat(sensorPoints[0] || 0); // Segundo elemento
            const yesterday = parseFloat(sensorPoints[1] || 0); // Primer elemento, si existe

            setTodayPoints(today);
            setYesterdayPoints(yesterday);
          } else {
            // Asignar puntos de hoy y ayer en base a la posición en el arreglo
            const today = parseFloat(sensorPoints[1] || 0); // Segundo elemento
            const yesterday = parseFloat(sensorPoints[0] || 0); // Primer elemento, si existe

            setTodayPoints(today);
            setYesterdayPoints(yesterday);
          }
        } else {
          setErrorMessage("No se pudieron obtener los puntos de sensor.");
        }
      } catch (error) {
        setErrorMessage("Error al comunicarse con el servidor para obtener puntos de sensor.");
      }
    };

    const fetchPoints = async () => {
      try {
        const response = await axios.get("http://localhost:8080/users/points");

        if (response.status === 200) {
          const pointsData = response.data;

          const mappedPoints = {
            social: pointsData.find((p) => p.name === "Social")?.data || 0,
            fisica: pointsData.find((p) => p.name === "Fisica")?.data || 0,
            afectivo: pointsData.find((p) => p.name === "Afectivo")?.data || 0,
            cognitivo: pointsData.find((p) => p.name === "Cognitivo")?.data || 0,
            linguistico: pointsData.find((p) => p.name === "Linguistico")?.data || 0,
          };
          setPoints(mappedPoints);
        } else {
          setErrorMessage("No se pudieron obtener los puntos.");
        }
      } catch (error) {
        console.error("Error al obtener puntos:", error.message);
        setErrorMessage("Error al comunicarse con el servidor.");
      }
    };

    const fetchUser = async () => {
      try {
        const response = await axios.get("http://localhost:8080/users/all");

        if (response.status === 201) {
          const user = response.data[0];

          // Validar si el usuario existe
          if (user) {
            const mappedUser = {
              name: user.name,
            };
            setUser(mappedUser); // Actualizar estado del usuario
          } else {
            setErrorMessage("No se encontró ningún usuario.");
          }
        } else {
          setErrorMessage("No se pudo obtener el usuario.");
        }
      } catch (error) {
        console.error("Error al obtener usuario:", error.message);
        setErrorMessage("Error al comunicarse con el servidor para obtener usuario.");
      }
    };
    fetchSensorPoints();
    fetchPoints();
    fetchUser();
  }, []);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">
          <img src="src/assets/bgames_icon.png" alt="Logo" />
        </div>
        <button className="button">Sensor Data</button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="header">
          <div className="points-box">Yesterday's points: <span>{yesterdayPoints}</span></div>
          <div className="points-box">Today's points: <span>{todayPoints}</span></div>
          <div className="profile">
            <span>{user.name}</span>
            <div className="avatar">
              <img src="" />
            </div>
          </div>
        </div>

        <div className="points-section">
          <h2>Your Points:</h2>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className="points-grid">
            <div className="point-item">Social: <span>{points.social}</span></div>
            <div className="point-item">Fisica: <span>{points.fisica}</span></div>
            <div className="point-item">Afectivo: <span>{points.afectivo}</span></div>
            <div className="point-item">Cognitivo: <span>{points.cognitivo}</span></div>
            <div className="point-item">Linguistico: <span>{points.linguistico}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;


