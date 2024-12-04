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

    mainWindow.loadURL('http://localhost:6969'); // Cambia este puerto si es necesario
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
