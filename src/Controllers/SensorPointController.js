import SensorPointRepository from "../Repositories/SensorPointRepository.js";
import SensorPointService from "../Services/SensorPointService.js";

class SensorPointController {
    constructor() {
        const sensorPointRepository = new SensorPointRepository();
        this.sensorPointService = new SensorPointService(sensorPointRepository);
    }

    async getHoursPlayed(req, res) {
        try {
            const response = await this.sensorPointService.getHoursPlayed();
            res.status(200).json({
                message: 'Horas jugadas obtenidas exitosamente.',
                data: response
            });
        } catch (error) {
            console.error('Error al obtener las horas jugadas:', error.message);
            res.status(500).json({
                message: 'Error interno del servidor al obtener las horas jugadas.',
                error: error.message
            });
        }
    }
    
    async saveSensorPoint(req, res) {
        try {
            const response = await this.sensorPointService.saveSensorPoint();
            res.status(200).json({
                message: 'Punto de sensor guardado exitosamente.',
                data: response
            });
        } catch (error) {
            console.error('Error al guardar el punto de sensor:', error.message);
            res.status(500).json({
                message: 'Error interno del servidor al guardar el punto de sensor.',
                error: error.message
            });
        }
    }
    
    async getAllSensorPoints(req, res) {
        try {
            const { tipe_sensor } = req.body;
            console.log(tipe_sensor);
    
            // Validación de entrada
            if (!tipe_sensor || typeof tipe_sensor !== 'string') {
                return res.status(400).json({
                    message: 'El campo "tipe_sensor" es obligatorio y debe ser una cadena de texto.'
                });
            }
            console.log("Hola!!!!!!!!!!!");
            const response = await this.sensorPointService.getAllSensorPoints(tipe_sensor);
            res.status(200).json({
                message: 'Puntos de sensor obtenidos exitosamente.',
                data: response
            });
        } catch (error) {
            console.error('Error al obtener los puntos de sensor:', error.message);
            res.status(500).json({
                message: 'Error interno del servidor al obtener los puntos de sensor.',
                error: error.message
            });
        }
    }    
}

export default SensorPointController;
