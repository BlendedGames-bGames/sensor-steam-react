import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import UserController from '../src/Controllers/UserController.js';
import UserService from '../src/Services/UserService.js';

jest.mock('../src/Services/UserService.js'); // Mock del servicio de usuarios

describe('UserController - Pruebas de Integración', () => {
  let app, userController, mockUserService;

  beforeEach(() => {
    // Crear un servidor Express para la prueba
    app = express();
    app.use(express.json());

    // Mockear métodos de UserService
    mockUserService = {
      createUser: jest.fn()
    };

    // Crear una instancia del controlador con el mock inyectado
    userController = new UserController(mockUserService);

    // Definir la ruta de prueba
    app.post('/users/create', (req, res) => userController.createUser(req, res));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /*** Prueba 1: Crear usuario exitosamente ***/
  test('Debe crear un usuario correctamente', async () => {
    // Simular que el usuario aún no existe en la base de datos
    mockUserService.createUser.mockResolvedValue({ id_players: 1, email: 'test@test.cl' });
  
    const response = await request(app)
      .post('/users/create')
      .send({ email: 'test@test.cl', password: 'asd123' });
  
    expect(response.status).toBe(201);
  });

  /*** Prueba 2: Crear un usuario que ya existe ***/
  test('Debe crear un usuario correctamente', async () => {
    // Simular que existe un usuario igual
    mockUserService.createUser.mockResolvedValue({ id_players: 1, email: 'test@test.cl' });
  
    const response = await request(app)
      .post('/users/create')
      .send({ email: 'test@test.cl', password: 'asd123' });
  
    expect(response.status).toBe(400);
  });

  /*** Prueba 3: Error cuando faltan datos ***/
  test('Debe devolver un error 400 si falta el email o la contraseña', async () => {
    const response = await request(app).post('/users/create').send({ email: 'test@example.com' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'El email y la contraseña son obligatorios.' });
  });

  /*** Prueba 4: Error interno del servidor ***/
  test('Debe devolver un error 400 si ocurre una excepción en el servidor', async () => {
    mockUserService.createUser.mockRejectedValue(new Error('Error en el servidor'));

    const response = await request(app)
      .post('/users/create')
      .send({ email: 'test@example.com', password: 'secure123' });

    expect(response.status).toBe(400);
  });
});

