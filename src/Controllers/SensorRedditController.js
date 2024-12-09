import axios from "axios";
import SensorRedditService from "../Services/SensorRedditService.js";

class SensorRedditController {
    constructor() {
        this.sensorRedditService = new SensorRedditService;
    }
    
    async getKarma(req, res) {
        const { username } = req.body;
        try {
        const karma = await this.sensorRedditService.getRedditKarma(username);
        return res.status(200).json({ karma });
        } catch (error) {
        console.error('Error interno del servidor:', error.message);
        return res.status(500).json({ error: 'Error interno del servidor.' });
        }
    }
}

export default SensorRedditController;