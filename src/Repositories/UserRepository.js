import sqlite3 from 'sqlite3';
import UserModel from '../Models/UserModel.js';

// Inicializar conexión con la base de datos
const db = new sqlite3.Database('./sensor-steam-db.db');

// Crear la tabla si no existe
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id_players TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      password TEXT NOT NULL,
      key_steam TEXT,
      id_user_steam TEXT
    )
  `);
});

class UserRepository {
  // Crear un usuario
  static createUser(user) {
    if (!(user instanceof UserModel)) {
      throw new Error('El usuario debe ser una instancia de UserModel');
    }

    const query = `
      INSERT INTO users (id_players, name, email, password, key_steam, id_user_steam)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    return new Promise((resolve, reject) => {
      db.run(
        query,
        [user.id_players, user.name, user.email, user.password, user.key_steam, user.id_user_steam],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID); // Retorna el ID del último usuario insertado
          }
        }
      );
    });
  }

  // Obtener todos los usuarios
  static getUsers() {
    const query = 'SELECT * FROM users';

    return new Promise((resolve, reject) => {
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Mapear filas a instancias de UserModel
          const users = rows.map(
            (row) =>
              new UserModel(
                row.id_players,
                row.name,
                row.email,
                row.password,
                row.key_steam,
                row.id_user_steam
              )
          );
          resolve(users);
        }
      });
    });
  }

  // Buscar un usuario por ID
  static findUserById(id_players) {
    const query = 'SELECT * FROM users WHERE id_players = ?';

    return new Promise((resolve, reject) => {
      db.get(query, [id_players], (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (!row) {
            resolve(null);
          } else {
            // Retornar una instancia de UserModel
            const user = new UserModel(
              row.id_players,
              row.name,
              row.email,
              row.password,
              row.key_steam,
              row.id_user_steam
            );
            resolve(user);
          }
        }
      });
    });
  }

  // Actualizar un usuario
  static updateUser(user) {
    if (!(user instanceof UserModel)) {
      throw new Error('El usuario debe ser una instancia de UserModel');
    }

    const query = `
      UPDATE users
      SET name = ?, email = ?, password = ?, key_steam = ?, id_user_steam = ?
      WHERE id_players = ?
    `;

    return new Promise((resolve, reject) => {
      db.run(
        query,
        [
          user.name,
          user.email,
          user.password,
          user.key_steam,
          user.id_user_steam,
          user.id_players,
        ],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        }
      );
    });
  }
}

export default UserRepository;