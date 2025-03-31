require('dotenv').config();

module.exports = {
  // Para cuando programas en tu computadora
  development: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'popnocturna_dev',
    host: 'localhost',
    dialect: 'mysql',
    port: 3306
  },

  // Para cuando haces pruebas
  test: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'popnocturna_test',
    host: 'localhost',
    dialect: 'mysql',
    port: 3306
  },

  // Para cuando la app esté en internet (Vercel + Clever Cloud)
  production: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: 3306,
    ssl: true
  }
};