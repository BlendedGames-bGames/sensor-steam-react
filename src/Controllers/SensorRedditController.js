import axios from "axios";
import SensorRedditService from "../Services/SensorRedditService.js";

class SensorRedditController {
    constructor() {
        this.sensorRedditService = new SensorRedditService;
    }

    async getKarma(req, res) {
        const { username } = req.body;
        try {
            const karma = await this.sensorRedditService.getRedditKarma(username);
            return res.status(200).json({ karma });
        } catch (error) {
            console.error('Error interno del servidor:', error.message);
            return res.status(500).json({ error: 'Error interno del servidor.' });
        }
    }

    async checkUserReddit(req, res) {
        const authorizationCode = req.query.code; // Captura el código de autorización
        const state = req.query.state; // Valida el estado (para evitar ataques CSRF)

        if (!authorizationCode) {
            return res.status(400).send("Authorization code missing");
        }

        try {
            // Intercambiar el código por un access_token
            const response = await axios.post(
                'https://www.reddit.com/api/v1/access_token',
                new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: authorizationCode,
                    redirect_uri: 'http://localhost:8080/users/callback',
                }),
                {
                    auth: {
                        username: 'L4WM_WKSe6i5hRk55iTe0A',
                        password: 'GtMl7EHFoewCpQaznDgJoexJKrfAwg'
                    },
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                }
            );

            /* -- Este es el link para validar a un usario --
            https://www.reddit.com/api/v1/authorize?client_id=
            L4WM_WKSe6i5hRk55iTe0A&response_type=code&state=
            abc123xyz789&redirect_uri=http://localhost:8080/users/callback&scope=identity
            */
            const accessToken = response.data.access_token;
            res.send(`Access token: ${accessToken}`);
            console.log('Access token:', accessToken);
            axios.get('https://oauth.reddit.com/api/v1/me', {
                headers: {
                  'Authorization': `Bearer ${accessToken}`, // Encabezado con el token
                  'Content-Type': 'application/json'
                }
              })
                .then(response => {
                  console.log('Karma total:', response.data.total_karma); // Muestra la información del usuario
                })
                .catch(error => {
                  if (error.response) {
                    console.error('Error en la respuesta:', error.response.status, error.response.data);
                  } else {
                    console.error('Error en la solicitud:', error.message);
                  }
                });

        } catch (error) {
            console.error(error);
            res.status(500).send("Error exchanging authorization code");
        }
    }
}

export default SensorRedditController;