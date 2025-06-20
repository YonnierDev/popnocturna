require('dotenv').config();

// Configuración común para todos los entornos
const commonConfig = {
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'CjYhunQqMsgsXJDIuhDMaedErgqQphTW',
  database: process.env.DB_NAME || 'railway',
  host: process.env.DB_HOST || 'gondola.proxy.rlwy.net',
  port: parseInt(process.env.DB_PORT) || 30422,
  dialect: 'mysql',
  dialectModule: require('mysql2'),
  logging: process.env.NODE_ENV === 'production' ? console.log : false,
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
};

// Validar configuración
if (!commonConfig.username || !commonConfig.password || !commonConfig.database || !commonConfig.host || !commonConfig.port) {
  console.error('❌ Configuración de base de datos incompleta');
  console.error('Username:', commonConfig.username);
  console.error('Password:', commonConfig.password ? '***' : 'No definida');
  console.error('Database:', commonConfig.database);
  console.error('Host:', commonConfig.host);
  console.error('Port:', commonConfig.port);
  process.exit(1);
}

console.log('🔧 Configuración de base de datos:');
console.log('🔌 Host:', commonConfig.host);
console.log('🔌 Puerto:', commonConfig.port);
console.log('🔌 Base de datos:', commonConfig.database);
console.log('🔌 Usuario:', commonConfig.username);
console.log('🔒 SSL:', 'Habilitado');

module.exports = {
  development: commonConfig,
  test: commonConfig,
  production: commonConfig
};