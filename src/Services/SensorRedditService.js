import axios from "axios";

class SensorRedditService {
  constructor() {
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

  async checkUserReddit() {}

  async createRedditUser() { }

  async createPoints() { }

  async getPoints() { }
}

export default SensorRedditService;