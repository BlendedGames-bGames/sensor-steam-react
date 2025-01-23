import axios from "axios";
import UserModel from '../Models/UserModel.js'; // Modelo del usuario
import UserRepository from '../Repositories/UserRepository.js'; // Repositorio del usuario
import UserService from "../Services/UserService.js";
import SensorPointModel from "../Models/SensorPointModel.js";

class SensorStackOverflowService {
  constructor(userRepository) {
    this.userService = new UserService(new UserRepository());
    this.httpClient = axios.create();
  }

  async getStackOverflowReputation(id_stackO) {
    //const id_stackO = 90525;
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

  async saveSensorPoint() {
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
      console.log('Creación de usuario de Stack Overflow exitosa.');
    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error.message);
      throw new Error('Error al actualizar los datos de Steam para el usuario.');
    }
  }
}

export default SensorStackOverflowService;