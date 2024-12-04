import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import UserRoutes from './src/routes/UserRoutes.js';

const app = express();
const PORT = 8080;

// Configurar CORS
app.use(cors({
  origin: 'http://localhost:6969', // Cambia al puerto donde corre tu frontend
  methods: ['POST', 'GET', 'PUT', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'] // Encabezados permitidos
}));

// Middleware para procesar JSON
app.use(bodyParser.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente.');
});

// Montar las rutas de usuario
app.use('/users', UserRoutes);

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

