import axios from "axios";
import UserModel from '../Models/UserModel.js'; // Modelo del usuario
import UserRepository from '../Repositories/UserRepository.js'; // Repositorio del usuario

class SensorRedditService {
  constructor(userRepository) {
    this.userRepository = userRepository;
    this.httpClient = axios.create();
  }

  async getRedditKarma(username) {
    const apiUrl = `https://www.reddit.com/user/${username}/about.json`;
    try {
      const response = await this.httpClient.get(apiUrl);
      if (response.status === 200) {
        const karmaLink = response.data.data.link_karma;
        const karmaComment = response.data.data.comment_karma;
        console.log("Karma de enlaces:", karmaLink);
        console.log("Karma de comentarios:", karmaComment);
        const dataUser = response.data.data.total_karma;
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

  async createRedditUser(id_reddit) {
    try {
      const users = await UserRepository.getUsers();
      const user = users[0];
      console.log("hola",user);
      if (!user) {
        throw new Error('No se encontró el usuario en la base de datos.');
      }
      user.id_reddit = id_reddit;
      console.log(user);

      await UserRepository.updateUserSteam(user);

      console.log('Creación de usuario de Reddit exitosa.');

    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error.message);
      throw new Error('Error al actualizar los datos de Steam para el usuario.');
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

  async createPoints() { }

  async getPoints() { }
}

export default SensorRedditService;