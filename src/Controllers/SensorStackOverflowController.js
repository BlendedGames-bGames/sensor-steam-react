import axios from "axios";
import SensorStackOverflowService from "../Services/SensorStackOverflowService.js";

class SensorStackOverflowController {
  constructor() {
    this.sensorStackOverflowService = new SensorStackOverflowService;
  }

  async getReputation(req, res) {
    const { id_stackoverflow } = req.body;
    console.log('id_stackoverflow:', id_stackoverflow);
    try {
      const reputation = await this.sensorStackOverflowService.getStackOverflowReputation(id_stackoverflow);
      return res.status(200).json({ reputation });
    } catch (error) {
      console.error('Error interno del servidor:', error.message);
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
  }
}

export default SensorStackOverflowController;