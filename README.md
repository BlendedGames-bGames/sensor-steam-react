# Sensor bGames - Steam, StackOverflow & Reddit

bGames es una tecnología diseñada para crear un equilibrio entre las actividades diarias y los videojuegos. ¡Tus tareas diarias te ayudan a mejorar en los juegos! Con bGames, puedes ganar puntos en función de tus actividades diarias. Mediante sensores, se recopilan tus datos y se transforman en puntos, que se pueden utilizar para mejorar tu personaje en el juego.

La aplicacion cuenta con tres sensores, cada uno recopila informacion y transforma los datos a puntos bGames
- Sensor Steam: Recopila la horas de juego durante el dia, se se juega mucho la cantidad de puntos sera inferior.
- Sensor Reddit: Capturua el karma obtenido en el dia.
- Sensor StackOverflow: Recopila la reputacion obtenida de la cuenta duerante el dia.

# Funcionalidades del sensor:

Inicio de sesion con cuenta bGames dentro del sensor.

![PT-Sen-07-Nuevo login](https://github.com/user-attachments/assets/fd27b1da-3eeb-418b-b26e-c1ec11287632)
---
Ventana principal del sensor, muestra los datos de la cuenta bGames.

![hola final](https://github.com/user-attachments/assets/7cf2d3c5-d0c8-4553-93e4-0f78ecb4d3bd)
---

Ventana de vinculacion de cuenta de Steam.

![PT-Sen-03-Nueva vista de Steam](https://github.com/user-attachments/assets/67a073f8-230a-4ed2-9a2f-0885c77f5174)
---

Ventana de puntos generados por el sensor StackOverflow

![PT-Sen-05-Puntos ganado Stack](https://github.com/user-attachments/assets/1f0487a3-4a4f-4480-b0d9-dfd633d24cc1)
---

# Como ejecutar el sensor bGames.

- Se requiere descargar los servicios cloud de [bGames](https://github.com/BlendedGames-bGames/bGames-dev-services.git)
- Descargar la aplicacion, el link se encuentra en el archivo 'sensor-bgames.txt'
- Acceder a la carpeta 'sensor-steam-react-win32-x64' y hacer click en el ejecutable 'sensor-steam-react'

(El sensor captura los datos a las 22:00 por lo que requiere que la aplicacion este en ejecucion para el correcto funcionamiento)

---

# Instrucciones para desarrolladores:
## Clonar el repositorio
Descarga el repositorio desde GitHub ejecutando el siguiente comando:

```shell
git clone https://github.com/MoisesGodoy17/sensor-steam-react.git
```

Para ejecutar la plicacion en modo desarrollo se requiere: 
- Docker 27.2.0
- Node.js 22.11.0
- NPM 10.9.0
- Visual Studio Code (o otro IDE)
---

# Ejecutar la aplicacion
Para iniciar el proyecto, en consola ingresar el comando:
```shell
npm start
```
---
# Exportar la aplicacion
Para exportar la aplicacion, es necesario editar los archivo:
- electron.js (ruta: \sensor-steam-react\public\electron.js)
- vite.config.js
- package.json
- --
En cada archivo se encuentran las instrucciones para realizar las modificaciones. Modificado estos archivos, es necesario instalar:
```shell
npm install --save-dev @electron-forge/cli
```
Instalado la libreria es necesario contruir el front-end, con el siguiente comando:
```shell
npm run build:frontend 
```
Como ultimo paso, es necesario construir el resto del proyecto:
```shell
npm run make
```
Se creara una carpeta llamada 'Out', dentro estara la aplicacion en un formato .exe (con la ruta: \sensor-steam-react\out\sensor-steam-react-win32-x64\sensor-steam-react.exe)





