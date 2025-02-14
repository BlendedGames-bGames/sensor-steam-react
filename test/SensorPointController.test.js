import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import SensorPointController from '../src/Controllers/SensorPointController.js';
import SensorPointService from '../src/Services/SensorPointService.js';

jest.mock('../src/Services/SensorPointService.js'); // Mock del servicio

describe('SensorPointController - Pruebas de Integración', () => {
  let app, sensorPointController, mockSensorPointService;

  beforeEach(() => {
    // Configurar un servidor Express de prueba
    app = express();
    app.use(express.json());

    // Mock del servicio de puntos de sensor
    mockSensorPointService = {
      saveSensorPoint: jest.fn(),
      getAllSensorPoints: jest.fn()
    };

    // Crear una instancia del controlador con el mock inyectado
    sensorPointController = new SensorPointController();
    sensorPointController.sensorPointService = mockSensorPointService;

    // Definir las rutas de prueba
    app.post('/sensor-point/save', (req, res) => sensorPointController.saveSensorPoint(req, res));
    app.post('/sensor-point/all', (req, res) => sensorPointController.getAllSensorPoints(req, res));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /*** Pruebas para `saveSensorPoint` ***/

  /*** Prueba 1: Crear un punto por primera vez ***/
  test('Debe guardar el primer punto correctamente', async () => {
    mockSensorPointService.saveSensorPoint.mockResolvedValue({ points: 25 });

    const response = await request(app).post('/sensor-point/save');

    expect(response.status).toBe(200);
  });


  /*** Pruebas para `getAllSensorPoints` ***/

  /*** Prueba 2: Obtener puntos correctamente ***/
  test('Debe obtener los puntos de sensor correctamente', async () => {
    mockSensorPointService.getAllSensorPoints.mockResolvedValue([10, 20]);

    const response = await request(app)
      .post('/sensor-point/all')
      .send({ tipe_sensor: 'Steam' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Puntos de sensor obtenidos exitosamente.',
      data: [10, 20]
    });
  });

  /*** Prueba 3: No debe obtener puntos sin `tipe_sensor` ***/
  test('Debe devolver error 400 si no se proporciona tipe_sensor', async () => {
    const response = await request(app).post('/sensor-point/all').send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'El campo "tipe_sensor" es obligatorio y debe ser una cadena de texto.'
    });
  });

  /*** Prueba 4: Error en el servidor ***/
  test('Debe devolver error 500 si ocurre un fallo en el servidor', async () => {
    mockSensorPointService.getAllSensorPoints.mockRejectedValue(new Error('Error interno'));

    const response = await request(app)
      .post('/sensor-point/all')
      .send({ tipe_sensor: 'Steam' });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: 'Error interno del servidor al obtener los puntos de sensor.',
      error: 'Error interno'
    });
  });
});
