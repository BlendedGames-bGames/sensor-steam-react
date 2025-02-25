import SensorPointRepository from "../Repositories/SensorPointRepository.js";
import UserService from "../Services/UserService.js";
import UserRepository from "../Repositories/UserRepository.js";
import axios from 'axios';
import SensorPointModel from "../Models/SensorPointModel.js";
import cron from "node-cron";

class SensorPointService {
  constructor(sensorPointRepository) {
    this.sensorPointRepository = sensorPointRepository;
    this.userService = new UserService(new UserRepository());
    this.httpClient = axios.create();

    // Tarea programada para ejecutarse a las 10 PM todos los días
    cron.schedule(
      '00 22 * * *',
      async () => {
        console.log("Verificando conexión con servidores...");
        let conectado = await this.checkServerStatus();

        if (!conectado) {
          console.log("No hay conexión con los servidores, reintentando cada minuto...");
          const retryInterval = setInterval(async () => {
            let reintento = await this.checkServerStatus();
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

  async checkServerStatus() {
    console.log("Verificando conexión con los servidores...");
    let apiUrl1 = 'http://localhost:3002/';
    let apiUrl2 = 'http://localhost:3001/';
    let apiUrl3 = 'http://localhost:3010/';
    try {
      const [response1, response2, response3] = await Promise.all([
        this.httpClient.get(apiUrl1),
        this.httpClient.get(apiUrl2),
        this.httpClient.get(apiUrl3)
      ]);
      // /await this.httpClient.get(apiUrl);
      if (response1.status === 200 && response2.status === 200 && response3.status === 200) {
        console.log("Todos los servidores están en línea.");
        return true;
      }
    } catch (error) {
      console.error("Error de conexión con los servidores:", error.message);
      return false;
    }
  }

  async ejecutarProceso() {
    try {
      if (this.checkUserSteamDB() == 0) {
        console.log("No existe una cuenta vinculada...");
        return;
      }
      await this.saveSensorPoint();
      console.log("Creando nuevo punto...");
    } catch (error) {
      console.error("Error en el proceso de Stack Overflow:", error.message);
    }
  }

  async checkUserSteamDB() {
    const users = await UserRepository.getUsers();
    const user = users[0];
    if (user.key_steam && user.id_user_steam) {
      console.log('El usuario tiene cuenta de Reddit');
      return 1;
    }
    console.log('El usuario no tiene cuenta de Reddit');
    return 0;
  }

  async setDataSteam(key_steam, id_user_steam) {
    const apiUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${key_steam}&steamid=${id_user_steam}&include_appinfo=true&include_played_free_games=true`;

    try {
      const response = await this.httpClient.get(apiUrl);

      if (response.status === 200) {
        const users = await this.userService.getAllUsers();
        const user = users[0];

        if (!user) {
          throw new Error('No se encontró el usuario en la base de datos.');
        }

        user.key_steam = key_steam;
        user.id_user_steam = id_user_steam;

        console.log(user);

        await UserRepository.updateUser(user);
        await this.saveSensorPoint();


        console.log('Credenciales de Steam actualizadas');
        return true; // Devuelve éxito
      } else {
        throw new Error('Error en la respuesta de la API de Steam.');
      }
    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error.message);
      throw new Error('Error al actualizar los datos de Steam para el usuario.');
    }
  }

  async getHoursPlayed() {
    const user = await this.userService.getAllUsers();
    const apiKey = user[0].key_steam;
    const steamId = user[0].id_user_steam;

    console.log('🔑 API Key:', apiKey);
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
        console.log(`Total de horas jugadas: ${totalMinutes}`);
        return totalMinutes;
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
      console.log("=== Guardando punto de sensor de Steam... ===");
      // Obtener horas jugadas
      const hoursPlayed = await this.getHoursPlayed();
      // Obtener el primer usuario de la base de datos
      const users = await this.userService.getAllUsers();
      if (!users || users.length === 0) {
        console.error("No se encontró ningún usuario registrado.");
        return;
      }
      const user = users[0];
      console.log("Usuario obtenido:", user);

      // Obtener todos los puntos de sensor de la base de datos para "Steam"
      const points = await SensorPointRepository.getAllSensorPoints('Steam');

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
          25,
          todayFormatted, // Guardar fecha como YYYY-MM-DD
          hoursPlayed,
          null,
          null,
          "Steam"
        );

        await SensorPointRepository.createSensorPoint(firstPoint);
        await this.sendPointsToServerStackAndReddit(25, this.randomInt(), user.id_players);
        console.log("=== Primer punto de sensor creado: ===", firstPoint);
        return;
      }

      // Obtener el último punto registrado
      const lastPoint = points[points.length - 1];

      // Convertir `lastPoint.date_time` a una fecha válida
      const lastPointDate = new Date(lastPoint.date_time + "T00:00:00"); // Forzar formato correcto
      console.log("Última fecha registrada:", lastPointDate.toISOString().split("T")[0]);

      if (lastPointDate.toISOString().split("T")[0] < todayFormatted) {
        console.log("Último punto es de una fecha anterior, creando un nuevo punto...");
        console.log("Diferencia de horas jugadas:", hoursPlayed - lastPoint.hours_played);

        // Calcular los puntos basados en la diferencia de horas jugadas
        const updatedPoints = this.calcularPuntos(hoursPlayed - lastPoint.hours_played);

        const nextPoint = new SensorPointModel(
          null,
          1,
          user.id_players,
          updatedPoints,
          todayFormatted, // Guardar fecha como YYYY-MM-DD
          hoursPlayed,
          null,
          null,
          "Steam"
        );
        await SensorPointRepository.createSensorPoint(nextPoint);
        await this.sendPointsToServerStackAndReddit(updatedPoints, this.randomInt(), user.id_players);
        console.log("=== Nuevo punto de sensor creado para Steam: ===", nextPoint);
      } else {
        console.log("No se necesita crear un nuevo punto de sensor para hoy.");
      }
    } catch (error) {
      console.error("Error al guardar el punto de sensor:", error.message);
    }
  }

  calcularPuntos(minutosJugados) {
    let puntos = 0;
    console.log("Minutos jugados:", minutosJugados);
    const horasJugadas = minutosJugados / 60; // Convierte minutos a horas
    console.log("Horas jugadas:", horasJugadas);

    if (horasJugadas <= 1) {
      // Jugar entre 0 a 60 minutos otorga puntos entre 10 y 150
      puntos = Math.round(10 + (horasJugadas * 140));
    } else if (horasJugadas > 1 && horasJugadas <= 2) {
      // Jugar entre 61 a 120 minutos otorga puntos entre 150 y 50
      puntos = Math.round(150 - ((horasJugadas - 1) * 100));
    } else {
      // Más de 120 minutos de juego otorgan 10 puntos fijos
      puntos = 10;
    }
    return puntos;
  }


  async getAllSensorPoints(tipe_sensor) {
    try {
      const points = await SensorPointRepository.getAllSensorPoints(tipe_sensor);
      console.log("Puntos de sensor obtenidos:", points);
      let pointsOutput = [points[points.length - 1].data_point];
      if (points.length >= 2) {
        console.log("Puntos de sensor obtenidos:", points.length);
        pointsOutput = [points[points.length - 1].data_point, points[points.length - 2].data_point];
        console.log("Puntos de sensor obtenidos:", pointsOutput);
        return pointsOutput;
      }
      return pointsOutput;
    } catch (error) {
      console.error("No se pudieron obtener los puntos del sensor", error.message);
    }
  }

  async sendPointsToServerStackAndReddit(points, id_attributes, id_player) {
    const totalPoints = await this.getPointBgames(id_player, id_attributes);
    console.log("|||||--------Puntos de Bgames:", totalPoints);
    try {
      // Crear objeto con los puntos a enviar, con los mismos parámetros que recibe el endpoint
      const pointsToSend = {
        id_player: id_player,
        new_data: points + totalPoints,
        id_attributes: id_attributes,
      };

      console.log("Puntos a enviar al servidor:", pointsToSend);

      // Verificar conexión con el servidor
      const isConnected = await this.checkConnection();
      if (!isConnected) {
        console.error("No se pudo establecer conexión con el servidor. Los puntos no se enviarán.");
        return;
      }
      // Enviar puntos al servidor
      const response = await axios.put("http://localhost:3002/player_attributes_single", pointsToSend);
      console.log("Respuesta del servidor:", response.data);
    } catch (error) {
      console.error("Error al enviar los puntos al servidor:", error.message);
    }
  }

  async checkConnection() {
    try {
      const response = await axios.get("http://localhost:3010/");
      if (response.status === 200) {
        console.log("Conexión exitosa con el servidor.");
        return true; // Conexión exitosa
      }
    } catch (error) {
      console.error("Error al conectarse con el servidor:", error.message);
      return false; // Conexión fallida
    }
  }

  randomInt() {
    return Math.floor(Math.random() * 5);
  }

  async getPointBgames(id_players, id_attributes) {
    const apiUrl = `http://localhost:3001/player_all_attributes/${id_players}`;
    try {
      const response = await this.httpClient.get(apiUrl);

      if (response.status === 200) {
        // Transformar los datos de la API en instancias de PointsBgmaesModel
        const pointsBgamesFromApi = response.data;
        return pointsBgamesFromApi[id_attributes].data;
      } else {
        console.error('Error en la API: estado no esperado', response.status);
        return []; // Devuelve un array vacío si el estado no es 200
      }
    } catch (error) {
      console.error('Error al obtener datos de la API:', error.message);
      return []; // Manejo de errores: devolver un array vacío
    }
  }
}



export default SensorPointService;