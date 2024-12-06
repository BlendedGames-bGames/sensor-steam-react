import { app, BrowserWindow } from 'electron';
import { fork } from 'child_process';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow;
let backendProcess;

app.on('ready', () => {
  // Crear ventana principal
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false, // Evitar redimensionar
    maximizable: false, // Evitar maximizar
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Cargar el frontend empaquetado por Vite
  const viteDistPath = path.join(__dirname, '../dist/index.html');
  mainWindow.loadFile(viteDistPath);

  // Levantar el backend como un proceso hijo
  const backendPath = path.join(__dirname, '../server.js');
  backendProcess = fork(backendPath);

  backendProcess.on('error', (error) => {
    console.error('Error en el backend:', error.message);
  });

  // Cerrar backend al cerrar la aplicación
  mainWindow.on('closed', () => {
    mainWindow = null;
    if (backendProcess) {
      backendProcess.kill();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});