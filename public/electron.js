
//-- Copiar si se quiere exportar la aplicacion
/*
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
*/
/*
import { app, BrowserWindow } from 'electron';

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: false, // Deshabilitar redimensionar
        maximizable: false, // Deshabilitar botón de maximizar
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    mainWindow.loadURL('http://localhost:6969');
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
*/

import { app, BrowserWindow, Tray, Menu } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path'; // ✅ Importa 'join' desde 'path'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow;
let tray;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: false,
        maximizable: false,
        icon: join(__dirname, 'icono.ico'), // ✅ Ahora sí puedes usar 'join'
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    mainWindow.loadURL('http://localhost:6969');

    // Oculta la ventana en vez de cerrarla
    mainWindow.on('close', (e) => {
        e.preventDefault();
        mainWindow.hide();
    });
}

app.on('ready', () => {
    createWindow();

    tray = new Tray(join(__dirname, 'icono.ico')); // ✅ También corregido aquí
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Mostrar', click: () => mainWindow.show() },
        { label: 'Salir', click: () => {
            tray.destroy();
            app.quit();
        } }
    ]);
    tray.setToolTip('Mi App en Segundo Plano');
    tray.setContextMenu(contextMenu);

    app.setLoginItemSettings({
        openAtLogin: true,
    });
});

app.on('window-all-closed', (e) => {
    e.preventDefault();
});

