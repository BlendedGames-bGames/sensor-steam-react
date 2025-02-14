import axios from "axios";
import UserModel from '../Models/UserModel.js'; // Modelo del usuario
import UserRepository from '../Repositories/UserRepository.js'; // Repositorio del usuario
import UserService from "../Services/UserService.js";
import SensorPointModel from "../Models/SensorPointModel.js";
import SensorPointService from "../Services/SensorPointService.js";
import SensorPointRepository from "../Repositories/SensorPointRepository.js";
import cron from "node-cron";

class SensorStackOverflowService {
  constructor(userRepository) {
    this.userService = new UserService(new UserRepository());
    this.sensorPointService = new SensorPointService(new SensorPointRepository());
    this.httpClient = axios.create();

    cron.schedule(
      '00 22 * * *', // La funcion se ejecutara cada dia a las 10 PM
      async () => {
        try {
          console.log("Ejecutando saveSensorPointStackOverflow a las 10 PM...");
          await this.saveSensorPointStackOverflow(); 
          console.log("Proceso de Stack Overflow completado.");
        } catch (error) {
          console.error("Error en el proceso de Stack Overflow:", error);
        }
      },
      {
        scheduled: true,
        timezone: "America/Santiago"
      }
    );
  }

  async getStackOverflowReputation(id_stackO) {
    console.log("ID de usuario en StackOverflow:", id_stackO);
    const apiUrl = `https://api.stackexchange.com/2.3/users/${id_stackO}?site=stackoverflow`;
    try {
      const response = await this.httpClient.get(apiUrl);
      if (response.status === 200) {
        const dataUser = response.data.items[0].reputation;
        if (!dataUser) {
          console.log("No se encontro informacion del usuario en StackOverflow.es");
          return 0;
        }
        console.log("Reputacion del usuario:", dataUser);
        return dataUser;
      } else {
        console.error("Error al obtener los datos de Stack Overflow:", response.status);
        return 0;
      }
    } catch (error) {
      console.error("Error al comunicarse con la API de Stack Overflow:", error.message);
      return 0;
    }
  }

  async checkUserStackOverflowDB() {
    const users = await UserRepository.getUsers();
    const user = users[0];
    if (user.id_player_stack) {
      console.log('El usuario tiene cuenta de StackOverflow');
      return 1;
    }
    console.log('El usuario no tiene cuenta de StackOverflow');
    return 0;
  }

  async saveSensorPointStackOverflow() {
    console.log("Guardando punto de sensor de StackOverflow...");
    try {
      // Obtener usuarios y verificar existencia
      const users = await this.userService.getAllUsers();
      if (!users || users.length === 0) {
        console.error("No se encontró ningún usuario registrado.");
        return;
      }

      // Obtener usuario y reputation de StackOverflow
      const user = users[0];
      console.log("Usuario de StackOverflow:", user);
      const reputation = await this.getStackOverflowReputation(user.id_player_stack);
      console.log("reputation de StackOverflow obtenido:", reputation);

      // Obtener puntos de sensor existentes para StackOverflow
      const points = await SensorPointRepository.getAllSensorPoints("StackOverflow");

      const newPoint = new SensorPointModel(
        null, // id (se generará automáticamente)
        1, // sensor_id
        user.id_players, // id del jugador
        25, // puntos iniciales
        new Date().toISOString().split("T")[0], // Formato YYYY-MM-DD
        null, // horas jugadas
        null, // reputation que el jugador tiene al crear el punto
        reputation, // reputación
        "StackOverflow" // tipo de sensor
      );

      console.log("===Nuevo punto de sensor creado para StackOverflow:", newPoint, "====");

      if (points.length === 0) {
        // Si no hay puntos registrados, crear el primero
        console.log("No se encontraron puntos de sensor, creando el primero...");
        await this.sensorPointService.sendPointsToServerStackAndReddit(25, 3, user.id_players);
        await SensorPointRepository.createSensorPoint(newPoint);

      } else {
        // Obtener el último punto registrado
        const lastPoint = points[points.length - 1];

        // Convertir fechas correctamente
        const lastPointDate = new Date(lastPoint.date_time + "T00:00:00"); // Asegura que se tome como local
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0); // Asegura comparar solo la fecha

        // Imprimir valores para depuración
        console.log("Last Point Date (raw):", lastPoint.date_time);
        console.log("Converted Last Point Date:", lastPointDate.toISOString());
        console.log("Today Date:", todayDate.toISOString());

        if (lastPointDate.getTime() < todayDate.getTime()) {
          console.log("---------------------------lastPointDate:", lastPointDate.getTime());
          console.log("---------------------------todayDate:", todayDate.getTime());
          // Si la última fecha registrada es anterior a la fecha actual, creamos un nuevo punto
          console.log("El último punto es de una fecha anterior, creando un nuevo punto...");
          console.log("reputation obtenido hoy:", reputation);

          // Calcular los puntos basados en el reputation
          // Se resta el reputation del punto anterior para obtener el reputation ganado en el día
          const updatedPoints = this.generatePointsStackOverflow(
            Math.max(0, reputation - (lastPoint.reputation_player || 0)));

          const nextPoint = new SensorPointModel(
            null,
            1,
            user.id_players,
            updatedPoints,
            todayDate.toISOString().split("T")[0], // Fecha actual en formato YYYY-MM-DD
            null, // horas jugadas
            null,
            reputation, // reputación
            "StackOverflow" // tipo de sensor
          );
          await SensorPointRepository.createSensorPoint(nextPoint);
          await this.sensorPointService.sendPointsToServerStackAndReddit(updatedPoints, 3, user.id_players);
          console.log("===Nuevo punto de sensor creado para StackOverflow:", nextPoint, "====");
        } else {
          console.log("==No se necesita crear un nuevo punto de sensor para hoy==");
        }
      }
    } catch (error) {
      console.error("Error al guardar el punto de sensor de StackOverflow:", error.message);
    }
  }

  async createStackOverflowUser(id_player_stack, name_stack) {
    console.log('Creando usuario de Stack Overflow...');
    console.log('ID de usuario en Stack Overflow:', id_player_stack);
    console.log('Nombre de usuario en Stack Overflow:', name_stack);
    try {
      const users = await UserRepository.getUsers();
      const user = users[0];
      if (!user) {
        throw new Error('No se encontró el usuario en la base de datos.');
      }
      user.id_player_stack = id_player_stack;
      user.name_stack = name_stack;

      console.log('Usuario:', user);
      await UserRepository.updateUser(user); // guarda el id y el nombre del usuario de StackOverflow
      await this.saveSensorPointStackOverflow();
      console.log('Creación de usuario de Stack Overflow exitosa.');
    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error.message);
      throw new Error('Error al actualizar los datos de Steam para el usuario.');
    }
  }

  generatePointsStackOverflow(reputation) {
    console.log("Reputation:", reputation); 
    let puntos = 0;
    if (reputation >= 1 && reputation <= 50) {
      puntos = reputation * 2;
      console.log("187 Puntos obtenidos:", puntos);
      return puntos;
    }
    else if (reputation >= 51) { // recompensa por ganar más de 50 puntos de reputacion en StackOverflow
      puntos = 110;
      console.log("192 Puntos obtenidos:", puntos);
      return puntos;
    }
    else if (reputation == 0) {
      puntos = 10;
      console.log("197 Puntos obtenidos:", puntos);
      return puntos;
    }
    else { //Caso en que la reputacion disminuya respecto al dia anterior
      puntos = 5;
      console.log("202 Puntos obtenidos:", puntos);
      puntos = 10;
    }
  }
}

export default SensorStackOverflowService;