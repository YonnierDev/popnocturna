require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'tu_contraseña_local',
    database: process.env.DB_NAME || 'popnocturna',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    dialectModule: require('mysql2'),
    logging: false,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : {}
    }
  },
  test: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'tu_contraseña_local',
    database: process.env.DB_NAME || 'popnocturna_test',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    dialectModule: require('mysql2'),
    logging: false,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : {}
    }
  },
  production: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'DBqfNjqKjCCWQCebQOzvscLmHossBNQv',
    database: process.env.DB_NAME || 'railway',
    host: process.env.DB_HOST || 'switchback.proxy.rlwy.net',
    port: process.env.DB_PORT || 17828,
    dialect: 'mysql',
    dialectModule: require('mysql2'),
    logging: console.log,  // Habilita el logging para depuración
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      },
      connectTimeout: 60000  // Aumenta el tiempo de espera de conexión
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    retry: {
      max: 3,  // Número de intentos de reconexión
      timeout: 30000  // Tiempo entre intentos
    }
  }
};