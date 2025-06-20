require('dotenv').config();

// Configuración común para todos los entornos
const commonConfig = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql',
  dialectModule: require('mysql2'),
  logging: process.env.NODE_ENV === 'production' ? console.log : true,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    connectTimeout: 60000  // Aumenta el tiempo de espera de conexión
  },
  pool: {
    max: 30,
    min: 1,
    acquire: 60000,
    idle: 60000
  },
  retry: {
    max: 3,  // Número de intentos de reconexión
    timeout: 30000  // Tiempo entre intentos
  }
};

module.exports = {
  development: commonConfig,
  test: commonConfig,
  production: commonConfig
};