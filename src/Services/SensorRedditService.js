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

  async checkUserRedditDB(){
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
      // Obtener karma de Reddit
      const user = users[0];
      console.log("Usuario de Reddit:", user);
      const karma = await this.getRedditKarma(user.id_reddit);

      console.log("Karma de Reddit:", karma);
  
      // Verificar y obtener puntos de sensor existentes
      const points = await SensorPointRepository.getAllSensorPoints('Reddit');
  
      const newPoint = new SensorPointModel(
        null, // id (se generará automáticamente)
        1, // sensor_id
        user.id_players, // usuario
        11, // Puntaje a guardar
        new Date().toLocaleDateString(), // fecha actual
        null, // valor adicional
        karma, // valor obtenido del karma
        null, // campo adicional
        "Reddit" // tipo de sensor
      );
      console.log("===Nuevo punto de sensor creado Reddit:", newPoint, "====");
      if (points.length === 0) {
        console.log("No se encontraron puntos de sensor, creando el primero...");
        await SensorPointRepository.createSensorPoint(newPoint);
      } else {
        // Obtener el último punto de sensor y compararlo con la fecha actual
        const lastPoint = points[points.length - 1];
        if (lastPoint.date_time < new Date().toLocaleDateString()) {
          console.log("El último punto es de una fecha anterior, creando un nuevo punto...");
          await SensorPointRepository.createSensorPoint(newPoint);
          console.log("===Punto de sensor guardado exitosamente.===");
        } else {
          console.log("No se necesita crear un nuevo punto de sensor, fecha ya registrada.");
        }
      }
    } catch (error) {
      console.error("Error al guardar el punto de sensor de Reddit:", error.message);
      throw new Error("Hubo un problema al procesar el punto de sensor.");
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

  
}

export default SensorRedditService;