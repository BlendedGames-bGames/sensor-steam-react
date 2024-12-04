import SensorPointRepository from "../Repositories/SensorPointRepository.js";
import SensorPointService from "../Services/SensorPointService.js";

class SensorPointController {
    constructor() {
        const sensorPointRepository = new SensorPointRepository();
        this.sensorPointService = new SensorPointService(sensorPointRepository);
    }

    async getHoursPlayed(req, res) {
        const response = await this.sensorPointService.getHoursPlayed();
        res.status(201).json({ message: 'Usuario creado exitosamente.', response });
    }

    async saveSensorPoint(req, res) {
        const response = await this.sensorPointService.saveSensorPoint();
        res.status(201).json({ message: 'Punto de sensor guardado exitosamente.', response });
    }

    async getAllSensorPoints(req, res) {
        const response = await this.sensorPointService.getAllSensorPoints();
        res.status(201).json({ message: 'Puntos de sensor obtenidos exitosamente.', response });
    }
}

export default SensorPointController;
