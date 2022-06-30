var mysql = require('mysql2/promise')

const QUERIES = {
  register: 'INSERT INTO users (name, password, email) VALUES (?, ?, ?)',
  getUser: 'SELECT * FROM users WHERE name = ?',
  getById: 'SELECT * FROM users WHERE id = ?',
  getPage: 'SELECT name, email, surname, image, gender FROM users LIMIT ?, 10',
  updateName: 'UPDATE users SET name = ? where id = ?',
  updateSurName: 'UPDATE users SET surname = ? where id = ?',
  updateEmail: 'UPDATE users SET email = ? where id = ?',
  updateImage: 'UPDATE users SET image = ? where id = ?',
  updateGender: 'UPDATE users SET gender = ? where id = ?',
}

class DataBase {
  static connection = undefined

  constructor() {
    if (DataBase.connection == undefined) {
      DataBase.connection = mysql.createPool({
        host: 'localhost',
        user: 'dev',
        password: 'toor',
        database: 'test',
      })
    }
  }

  async getPage(page) {
    const [rows] = await DataBase.connection.execute(QUERIES.getPage, [page - 1])
    return rows
  }

  async getUser(name) {
    const [rows] = await DataBase.connection.execute(QUERIES.getUser, [name])
    return rows
  }

  async getUserById(id) {
    const [rows] = await DataBase.connection.execute(QUERIES.getById, [id])
    return rows
  }

  async register(name, password, email) {
    let values = [name, password, email]
    return DataBase.connection.execute(QUERIES.register, values)
  }

  async updateName(newName, id) {
    return DataBase.connection.execute(QUERIES.updateName, [newName, id])
  }

  async updateSurName(newSurName, id) {
    return DataBase.connection.execute(QUERIES.updateSurName, [newSurName, id])
  }

  async updateEmail(email, id) {
    return await DataBase.connection.execute(QUERIES.updateEmail, [email, id])
  }

  async updateGender(gender, id) {
    return await DataBase.connection.execute(QUERIES.updateGender, [gender, id])
  }

  async updateImage(image, id) {
    return await DataBase.connection.execute(QUERIES.updateImage, [image, id])
  }
}

exports.db = new DataBase()
