import SensorPointModel from "../Models/SensorPointModel.js";
import Database from "better-sqlite3";

const db = new Database("sensor-steam-db.db");

db.exec(`
    CREATE TABLE IF NOT EXISTS sensor_points (
        id_point_sensor TEXT PRIMARY KEY AUTOINCREMENT,
        id_sensor TEXT NOT NULL,
        id_players TEXT NOT NULL,
        data_point TEXT NOT NULL,
        date_time TEXT NOT NULL,
        hours_played TEXT NOT NULL
    )
`);

class SensorPointRepository {
    //crear un punto de sensor 
    static createSensorPoint(sensorPoint) {
        if (!(sensorPoint instanceof SensorPointModel)) {
            throw new Error("El punto de sensor debe ser una instancia de SensorPointModel");
        }

        const stmt = db.prepare(`
            INSERT INTO sensor_points (id_point_sensor, id_sensor, id_players, data_point, date_time, hours_played)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
            sensorPoint.id_point_sensor,
            sensorPoint.id_sensor,
            sensorPoint.id_players,
            sensorPoint.data_point,
            sensorPoint.date_time,
            sensorPoint.hours_played
        );
    }

    static getAllSensorPoints() {
        const stmt = db.prepare('SELECT * FROM sensor_points');
        const rows = stmt.all();

        // Mapear filas a instancias de SensorPointModel
        return rows.map(
            (row) =>
                new SensorPointModel(
                    row.id_point_sensor,
                    row.id_sensor,
                    row.id_players,
                    row.data_point,
                    row.date_time,
                    row.hours_played
                )
        );
    }
}

export default SensorPointRepository;