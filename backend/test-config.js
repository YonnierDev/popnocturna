const config = require('./config/config');

console.log('Configuración de producción:');
console.log({
  host: config.production.host,
  port: config.production.port,
  username: config.production.username,
  database: config.production.database,
  dialect: config.production.dialect,
  dialectOptions: {
    ssl: config.production.dialectOptions.ssl
  }
});
