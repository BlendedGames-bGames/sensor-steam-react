import UserModel from '../Models/UserModel.js'; // Importar la clase correctamente
import Database from 'better-sqlite3'; // Usar import para módulos ESM

const db = new Database('sensor-steam-db.db');

// Crear la tabla si no existe
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id_players TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    key_steam TEXT,
    id_user_steam TEXT
  )
`);

class UserRepository {
  // Crear un usuario
  static createUser(user) {
    if (!(user instanceof UserModel)) {
      throw new Error('El usuario debe ser una instancia de UserModel');
    }

    const stmt = db.prepare(`
      INSERT INTO users (id_players, name, email, password, key_steam, id_user_steam)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      user.id_players,
      user.name,
      user.email,
      user.password,
      user.key_steam,
      user.id_user_steam
    );
  }

  // Obtener todos los usuarios
  static getUsers() {
    const stmt = db.prepare('SELECT * FROM users');
    const rows = stmt.all();

    // Mapear filas a instancias de UserModel
    return rows.map(
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
  }

  // Buscar un usuario por ID
  static findUserById(id_players) {
    const stmt = db.prepare('SELECT * FROM users WHERE id_players = ?');
    const row = stmt.get(id_players);

    // Retornar null si el usuario no existe
    if (!row) {
      return null;
    }

    // Retornar una instancia de UserModel
    return new UserModel(
      row.id_players,
      row.name,
      row.email,
      row.password,
      row.key_steam,
      row.id_user_steam
    );
  }

  static updateUser(user) {
    if (!(user instanceof UserModel)) {
      throw new Error('El usuario debe ser una instancia de UserModel');
    }

    const stmt = db.prepare(`
      UPDATE users
      SET name = ?, email = ?, password = ?, key_steam = ?, id_user_steam = ?
      WHERE id_players = ?
    `);
    stmt.run(
      user.name,
      user.email,
      user.password,
      user.key_steam,
      user.id_user_steam,
      user.id_players
    );
  }
}

export default UserRepository; // Exportar la clase como default