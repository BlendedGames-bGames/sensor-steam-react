import SensorPointRepository from "../Repositories/SensorPointRepository.js";
import UserService from "../Services/UserService.js";
import UserRepository from "../Repositories/UserRepository.js";
import axios from 'axios';
import SensorPointModel from "../Models/SensorPointModel.js";

class SensorPointService {
  constructor(sensorPointRepository) {
    this.sensorPointRepository = sensorPointRepository;
    this.userService = new UserService(new UserRepository());
    this.httpClient = axios.create();
  }

  async getHoursPlayed() {
    const user = await this.userService.getAllUsers();
    const apiKey = user[0].key_steam;
    const steamId = user[0].id_user_steam;
    const apiUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true`;

    try {
      const response = await axios.get(apiUrl);
      if (response.status === 200) {
        const games = response.data.response.games;

        if (!games) {
          console.log('No se encontraron juegos para este usuario.');
          return 0;
        }
        // Calcular el tiempo total jugado
        const totalMinutes = games.reduce((sum, game) => sum + (game.playtime_forever || 0), 0);
        const totalHours = (totalMinutes / 60).toFixed(2); // Convertir a horas y redondear
        console.log(`Total de horas jugadas: ${totalHours}`);
        return totalHours;
      } else {
        console.error('Error al obtener los datos de Steam:', response.status);
        return 0;
      }
    } catch (error) {
      console.error('Error al comunicarse con la API de Steam:', error.message);
      return 0;
    }
  }

  async saveSensorPoint() {
    try {
      // Obtener horas jugadas
      const hoursPlayed = await this.getHoursPlayed();

      // Obtener el primer usuario de la base de datos
      const users = await this.userService.getAllUsers();
      if (!users || users.length === 0) {
        console.error("No se encontró ningún usuario registrado.");
        return;
      }
      const user = users[0];

      // Obtener todos los puntos de sensor de la base de datos
      const points = await SensorPointRepository.getAllSensorPoints();

      // Definir un nuevo punto de sensor
      const newPoint = new SensorPointModel(
        null,
        1,
        user.id_players,
        10,
        new Date().toLocaleDateString(),
        hoursPlayed,
        null,
        null,
        "Steam"
      );
      console.log("===Nuevo punto de sensor creado:", newPoint, "====");

      // Lógica para verificar y crear puntos de sensor
      if (points.length === 0) {
        // Si no hay puntos de sensor registrados, crear el primero
        console.log("No se encontraron puntos de sensor, creando el primero...");
        await SensorPointRepository.createSensorPoint(newPoint);
      } else {
        // Comparar la fecha del último punto registrado
        const lastPoint = points[points.length - 1];
        if (lastPoint.date_time < new Date().toLocaleDateString()) { // Si el último punto es de una fecha anterior a la actual se crea un nuevo punto
          console.log("El último punto es de una fecha anterior, creando un nuevo punto...");
          const newPoint = new SensorPointModel(
            null,
            1,
            user.id_players,
            10,
            new Date().toLocaleDateString(),
            hoursPlayed + 999,
            null,
            null,
            "Steam");
          console.log("===Nuevo punto de sensor creado:", newPoint, "====");

          await SensorPointRepository.createSensorPoint(newPoint);
        } else {
          console.log("No se necesita crear un nuevo punto de sensor.");
        }
      }
    } catch (error) {
      console.error("Error al guardar el punto de sensor:", error.message);
    }
  }

  async getAllSensorPoints() {
    try {
      const points = await SensorPointRepository.getAllSensorPoints();
      console.log("Puntos de sensor obtenidos:", points);
      let pointsOutput = [points[points.length - 1].data_point];
      if (points.length >= 2) {
        console.log("Puntos de sensor obtenidos:", points.length);
        pointsOutput = [points[points.length - 1].data_point, points[points.length - 2].data_point];
        console.log("Puntos de sensor obtenidos:", pointsOutput);
        return pointsOutput ;
      }
      return pointsOutput;
    } catch (error) {
      console.error("No se pudieron obtener los puntos del sensor", error.message);
    }
  }
}



export default SensorPointService;