import express from 'express';
import UserController from '../Controllers/UserController.js';
import PointsBgamesController from '../Controllers/PointsBgamesController.js';
import SensorPointController from '../Controllers/SensorPointController.js';

const router = express.Router();
const userController = new UserController();
const pointsBgamesController = new PointsBgamesController();
const sensorPointController = new SensorPointController();

// Ruta para crear un usuario
router.post('/create', (req, res) => userController.createUser(req, res));
router.get('/all', (req, res) => userController.getAllUsers(req, res));
router.get('/check', (req, res) => userController.userCheckDB(req, res));
router.post('/steam', (req, res) => userController.setDataSteam(req, res));
router.get('/checkSteam', (req, res) => userController.userCheckSteam(req, res));
router.get('/points', (req, res) => pointsBgamesController.savePointsBgames(req, res));
router.get('/hoursSteam', (req, res) => sensorPointController.getHoursPlayed(req, res));
router.get('/savePoint', (req, res) => sensorPointController.saveSensorPoint(req, res));
router.get('/allPoints', (req, res) => sensorPointController.getAllSensorPoints(req, res));

// Exporta el router como default
export default router;