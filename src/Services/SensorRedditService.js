import axios from "axios";
import UserModel from '../Models/UserModel.js'; // Modelo del usuario
import UserRepository from '../Repositories/UserRepository.js'; // Repositorio del usuario
import SensorPointService from "../Services/SensorPointService.js";
import SensorPointRepository from "../Repositories/SensorPointRepository.js";
import UserService from "../Services/UserService.js";
import SensorPointModel from "../Models/SensorPointModel.js";
import cron from "node-cron";

class SensorRedditService {
  constructor(userRepository) {
    this.sensorPointService = new SensorPointService(new SensorPointRepository());
    this.userService = new UserService(new UserRepository());
    this.httpClient = axios.create();

    // Tarea programada para ejecutarse a las 10 PM todos los días
    cron.schedule(
      '00 22 * * *',
      async () => {
        console.log("Verificando conexión con servidores...");
        let conectado = await this.sensorPointService.checkServerStatus();

        if (!conectado) {
          console.log("No hay conexión con los servidores, reintentando cada minuto...");
          const retryInterval = setInterval(async () => {
            let reintento = await this.sensorPointService.checkServerStatus();
            if (reintento) {
              clearInterval(retryInterval);
              console.log("Conexión restablecida. Ejecutando el proceso...");
              await this.ejecutarProceso();
            }
          }, 60000); // Reintenta cada 1 minuto
        } else {
          await this.ejecutarProceso();
        }
      },
      {
        scheduled: true,
        timezone: "America/Santiago"
      }
    );
  }

  async ejecutarProceso() {
    try {
      if (this.checkUserRedditDB() == 0) {
        console.log("No existe una cuenta vinculada...");
        return;
      }
      await this.saveSensorPointReddit();
      console.log("Creando nuevo punto...");
    } catch (error) {
      console.error("Error en el proceso de Stack Overflow:", error.message);
    }
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
    try {
      console.log("=== Guardando punto de sensor de Reddit... ===");

      // Obtener usuarios y verificar existencia
      const users = await this.userService.getAllUsers();
      if (!users || users.length === 0) {
        console.error("No se encontró ningún usuario registrado.");
        return;
      }

      const user = users[0];
      console.log("Usuario obtenido:", user);

      // Obtener karma actual de Reddit
      const karma = await this.getRedditKarma(user.id_reddit);
      console.log("Karma actual de Reddit:", karma);

      // Obtener todos los puntos de sensor para Reddit
      const points = await SensorPointRepository.getAllSensorPoints("Reddit");

      // Definir la fecha actual en formato YYYY-MM-DD
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      const todayFormatted = todayDate.toISOString().split("T")[0];
      console.log("Fecha de hoy:", todayFormatted);

      if (points.length === 0) {
        // Si no hay puntos registrados, crear el primero
        console.log("No se encontraron puntos de sensor, creando el primero...");

        const firstPoint = new SensorPointModel(
          null,
          1,
          user.id_players,
          25,  // Puntos iniciales
          todayFormatted, // Fecha YYYY-MM-DD
          null, // Horas jugadas no aplican en Reddit
          karma, // Karma al momento de la creación
          null, // Reputación
          "Reddit"
        );
        await SensorPointRepository.createSensorPoint(firstPoint);
        await this.sensorPointService.sendPointsToServerStackAndReddit(25, 0, user.id_players);
        console.log("=== Primer punto de sensor creado: ===", firstPoint);
        return;
      }

      // Obtener el último punto registrado
      const lastPoint = points[points.length - 1];

      // Convertir `lastPoint.date_time` a fecha válida
      const lastPointDate = new Date(lastPoint.date_time + "T00:00:00");
      console.log("Última fecha registrada:", lastPointDate.toISOString().split("T")[0]);

      if (lastPointDate.toISOString().split("T")[0] < todayFormatted) {
        // Si la última fecha registrada es anterior a la fecha actual, creamos un nuevo punto
        console.log("Creando un nuevo punto para Reddit...");

        // Calcular los puntos basados en el karma ganado hoy
        const karmaDiferencial = Math.max(0, karma - (lastPoint.karma_player || 0));
        const updatedPoints = this.generatePointsReddit(karmaDiferencial);

        const nextPoint = new SensorPointModel(
          null,
          1,
          user.id_players,
          updatedPoints,
          todayFormatted, // Fecha actual YYYY-MM-DD
          null, // Horas jugadas no aplican en Reddit
          karma, // Karma obtenido
          null, // Reputación
          "Reddit"
        );

        await SensorPointRepository.createSensorPoint(nextPoint);
        await this.sensorPointService.sendPointsToServerStackAndReddit(updatedPoints, 0, user.id_players);
        console.log("=== Nuevo punto de sensor creado para Reddit: ===", nextPoint);
      } else {
        console.log("No se necesita crear un nuevo punto de sensor para hoy.");
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