import axios from "axios";

class SensorStackOverflowService {
  constructor() {
    this.httpClient = axios.create();
  }

  async getStackOverflowReputation(id_stackO) {
    //const id_stackO = 90525;
    console.log("ID de usuario en StackOverflow:", id_stackO);
    const apiUrl = `https://api.stackexchange.com/2.3/users/${id_stackO}?site=es.stackoverflow`;
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
}

export default SensorStackOverflowService;