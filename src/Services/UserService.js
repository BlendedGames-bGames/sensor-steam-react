import axios from 'axios';
import UserModel from '../Models/UserModel.js'; // Modelo del usuario
import UserRepository from '../Repositories/UserRepository.js'; // Repositorio del usuario
import SensorPointService from "../Services/SensorPointService.js";
import SensorPointRepository from "../Repositories/SensorPointRepository.js";

class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
    this.httpClient = axios.create();
  }

  async createUser(email, password) {
    const apiUrl = `http://localhost:3010/player_by_email/${email}`;

    try {
      // Llamada a la API externa
      const response = await this.httpClient.get(apiUrl);

      if (response.status === 200) {
        const userFromApi = response.data; // Datos del usuario desde la API

        // Validar si el usuario existe y la contraseña coincide
        if (userFromApi && userFromApi.password === password) {
          console.log(`Nombre: ${userFromApi.name}`);
          console.log(`Email: ${userFromApi.email}`);
          console.log(`ID: ${userFromApi.id_players}`);

          // Crear una instancia de UserModel
          const user = new UserModel(
            userFromApi.id_players,
            userFromApi.name,
            userFromApi.email,
            userFromApi.password,
            userFromApi.key_steam || null, // Opcional
            userFromApi.id_user_steam || null, // Opcional
            userFromApi.id_reddit || null // Opcional
          );

          // Guardar el usuario en el repositorio
          await UserRepository.createUser(user);
          //await this.sensorPointService.saveSensorPointReddit(); // Guarda el primer puntos al
          console.log('Usuario guardado en la base de datos');
          return 1; // Usuario encontrado y guardado
        } else {
          return 0; // Usuario no encontrado o contraseña incorrecta
        }
      } else {
        return 0; // Error en la respuesta de la API
      }
    } catch (error) {
      console.error('Error al llamar a la API:', error.message);
      return 0; // Error durante la llamada a la API
    }
  }

  async getAllUsers() {
    try {
      const users = await UserRepository.getUsers(); // Llamar al método estático del repositorio
      return users; // Retornar la lista de usuarios
    } catch (error) {
      console.error('Error al obtener usuarios:', error.message);
      throw new Error('No se pudieron obtener los usuarios.');
    }
  }

  async setDataSteam(key_steam, id_user_steam) {
    const apiUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${key_steam}&steamid=${id_user_steam}&include_appinfo=true&include_played_free_games=true`;
  
    try {
      const response = await this.httpClient.get(apiUrl);
  
      if (response.status === 200) {
        const users = await UserRepository.getUsers();
        const user = users[0];
  
        if (!user) {
          throw new Error('No se encontró el usuario en la base de datos.');
        }
  
        user.key_steam = key_steam;
        user.id_user_steam = id_user_steam;

        console.log(user);
  
        await UserRepository.updateUser(user);
        
  
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
}



export default UserService;