const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'mysql',
  dialectModule: require('mysql2'),
  host: process.env.DB_HOST || 'switchback.proxy.rlwy.net',
  port: process.env.DB_PORT || 17828,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'DBqfNjqKjCCWQCebQOzvscLmHossBNQv',
  database: process.env.DB_NAME || 'railway',
  logging: console.log,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    connectTimeout: 60000
  }
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexión exitosa a la base de datos');
    
    // Listar tablas
    const [tables] = await sequelize.query('SHOW TABLES');
    console.log('Tablas en la base de datos:', tables);
    
    // Verificar datos en la tabla de roles
    const [roles] = await sequelize.query('SELECT * FROM rols');
    console.log('Roles en la base de datos:', roles);
    
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
  } finally {
    await sequelize.close();
  }
}

testConnection();
