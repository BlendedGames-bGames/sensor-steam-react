import axios from "axios";
import UserModel from '../Models/UserModel.js'; // Modelo del usuario
import UserRepository from '../Repositories/UserRepository.js'; // Repositorio del usuario
import SensorPointService from "../Services/SensorPointService.js";
import SensorPointRepository from "../Repositories/SensorPointRepository.js";
import UserService from "../Services/UserService.js";
import SensorPointModel from "../Models/SensorPointModel.js";

class SensorRedditService {
  constructor(userRepository) {
    this.sensorPointService = new SensorPointService(new SensorPointRepository());
    this.userService = new UserService(new UserRepository());
    this.httpClient = axios.create();
  }

  async getRedditKarma(username) {
    const apiUrl = `https://www.reddit.com/user/${username}/about.json`;
    try {
      const response = await this.httpClient.get(apiUrl);
      if (response.status === 200) {
        const dataUser = response.data.total_karma;
        console.log("Karma del usuario:", dataUser);
        if (!dataUser) {
          console.log("No se encontro informacion del usuario en Reddit");
          return 0;
        }
        console.log("Karma del usuario:", dataUser);
        return dataUser;
      } else {
        console.error("Error al obtener los datos de Reddit:", response.status);
        return 0;
      }
    } catch (error) {
      console.error("Error al comunicarse con la API de Reddit:", error.message);
      return 0;
    }
  }

  async checkUserRedditDB() {
    const users = await UserRepository.getUsers();
    const user = users[0];
    if (user.id_reddit) {
      console.log('El usuario tiene cuenta de Reddit');
      return 1;
    }
    console.log('El usuario no tiene cuenta de Reddit');
    return 0;
  }

  async saveSensorPointReddit() {
    console.log("Guardando punto de sensor de Reddit...");
    try {
      // Obtener usuarios y verificar existencia
      const users = await this.userService.getAllUsers();
      if (!users || users.length === 0) {
        console.error("No se encontró ningún usuario registrado.");
        return;
      }
  
      // Obtener usuario y karma de Reddit
      const user = users[0];
      console.log("Usuario de Reddit:", user);
      const karma = await this.getRedditKarma(user.id_reddit);
      console.log("Karma de Reddit obtenido:", karma);
  
      // Obtener puntos de sensor existentes para Reddit
      const points = await SensorPointRepository.getAllSensorPoints("Reddit");
  
      const newPoint = new SensorPointModel(
        null, // id (se generará automáticamente)
        1, // sensor_id
        user.id_players, // id del jugador
        25, // puntos iniciales
        new Date().toISOString().split("T")[0], // Formato YYYY-MM-DD
        null, // horas jugadas
        karma, // karma que el jugador tiene al crear el punto
        null, // reputación
        "Reddit" // tipo de sensor
      );
  
      console.log("===Nuevo punto de sensor creado para Reddit:", newPoint, "====");
  
      if (points.length === 0) {
        // Si no hay puntos registrados, crear el primero
        console.log("No se encontraron puntos de sensor, creando el primero...");
        await SensorPointRepository.createSensorPoint(newPoint);
      } else {
        // Obtener el último punto registrado
        const lastPoint = points[points.length - 1];
  
        // Convertir fechas para comparación
        const lastPointDate = new Date(lastPoint.date_time);
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0); // Aseguramos comparar solo la fecha
  
        if (lastPointDate.getTime() < todayDate.getTime()) {
          // Si la última fecha registrada es anterior a la fecha actual, creamos un nuevo punto
          console.log("El último punto es de una fecha anterior, creando un nuevo punto...");
          console.log("Karma obtenido hoy:", karma);
  
          // Calcular los puntos basados en el karma
          // Se resta el karma del punto anterior para obtener el karma ganado en el día
          const updatedPoints = this.generatePointsReddit(
            Math.max(0, karma - (lastPoint.karma_player || 0)));
  
          const nextPoint = new SensorPointModel(
            null,
            1,
            user.id_players,
            updatedPoints,
            todayDate.toISOString().split("T")[0], // Fecha actual en formato YYYY-MM-DD
            null, // horas jugadas
            karma, // karma obtenido
            null, // reputación
            "Reddit" // tipo de sensor
          );
          await SensorPointRepository.createSensorPoint(nextPoint);
          console.log("===Nuevo punto de sensor creado para Reddit:", nextPoint, "====");
        } else {
          console.log("No se necesita crear un nuevo punto de sensor para hoy.");
        }
      }
    } catch (error) {
      console.error("Error al guardar el punto de sensor de Reddit:", error.message);
    }
  }  

  async createRedditUser(id_reddit) {
    try {
      const users = await UserRepository.getUsers();
      const user = users[0];
      if (!user) {
        throw new Error('No se encontró el usuario en la base de datos.');
      }
      user.id_reddit = id_reddit;
      await UserRepository.updateUser(user); // guarda el id del usuario de reddit
      await this.saveSensorPointReddit();
      console.log('Creación de usuario de Reddit exitosa.');
    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error.message);
      throw new Error('Error al actualizar los datos de Steam para el usuario.');
    }
  }


  generatePointsReddit(karma_earned) {
    let points;

    if (karma_earned >= 1 && karma_earned <= 10) {
      points = karma_earned * 10;
    } else if (karma_earned >= 11) {
      points = 110; // recompensa por ganar más de 10 puntos de karma en el día 
    } else if (karma_earned == 0) {
      points = 10; // puntos de compensación por no ganar karma
    } else {
      points = 5; // puntos mínimos si no cae en los rangos anteriores
    }
    return points;
  }
}

export default SensorRedditService;