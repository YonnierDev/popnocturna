"use strict";

const fs = require("fs");
const path = require("path");
const { Sequelize } = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
require("dotenv").config();

let sequelize;

console.log("🔧 Iniciando conexión a base de datos...");

// Validar que todas las variables de entorno estén definidas y no sean vacías
const requiredEnvVars = {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD
};

// Mostrar valores de entorno
console.log("=== 🚀 CONFIGURACIÓN DE BASE DE DATOS ===");
console.log("🔌 Host:", requiredEnvVars.DB_HOST);
console.log("🔌 Puerto:", requiredEnvVars.DB_PORT);
console.log("🗄️ Base de datos:", requiredEnvVars.DB_NAME);
console.log("🔑 Usuario:", requiredEnvVars.DB_USERNAME);
console.log("🔒 SSL: Habilitado");
console.log("🔄 Dialecto: mysql");
console.log("=== ⚙️ POOL DE CONEXIONES ===");
console.log("   ├─ Máximo:", 30);
console.log("   ├─ Mínimo:", 1);
console.log("   ├─ Tiempo de adquisición:", 60000, "ms");
console.log("   └─ Tiempo de inactividad:", 60000, "ms");
console.log("🔧 Opciones de conexión:");
console.log("   ├─ Logging:", process.env.NODE_ENV === "development");
console.log("   └─ Timeout de conexión:", 60000, "ms");

// Verificar cada variable
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value || value === '') {
    console.error(`❌ Variable de entorno requerida no definida: ${key}`);
    process.exit(1);
  }
});

sequelize = new Sequelize(
  requiredEnvVars.DB_NAME,
  requiredEnvVars.DB_USERNAME,
  requiredEnvVars.DB_PASSWORD,
  {
    host: requiredEnvVars.DB_HOST,
    port: parseInt(requiredEnvVars.DB_PORT),
    dialect: "mysql",
    dialectModule: require("mysql2"),
    logging: process.env.NODE_ENV === "development",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 30,
      min: 1,
      acquire: 60000,
      idle: 60000,
    },
    define: {
      timestamps: true,
      underscored: true,
      underscoredAll: true
    }
  }
);

const db = {};

// 🔍 Verificar conexión a la base de datos
sequelize
  .authenticate()
  .then(() => {
    console.log("\n=== 🚀 ESTADO DEL SERVIDOR ===");
    console.log("📡 URL: http://localhost:7000");
    console.log("🌍 Entorno:", process.env.NODE_ENV || "development");
    console.log("⏰ Hora del servidor:", new Date().toLocaleString());
    
    console.log("\n=== ✅ CONEXIÓN A BASE DE DATOS ===");
    console.log("🔌 Host:", requiredEnvVars.DB_HOST);
    console.log("🗄️ Base de datos:", requiredEnvVars.DB_NAME);
    console.log("🔑 Usuario:", requiredEnvVars.DB_USERNAME);
    console.log("🔒 SSL:", "✅ Habilitado");
    console.log("🌐 Puerto:", requiredEnvVars.DB_PORT);
    
    console.log("\n=== ⚙️ CONFIGURACIÓN DE CONEXIONES ===");
    console.log("📊 Pool de conexiones:");
    console.log("   ├─ Máximo:", sequelize.config.pool?.max);
    console.log("   ├─ Mínimo:", sequelize.config.pool?.min);
    console.log("   ├─ Tiempo de inactividad:", sequelize.config.pool?.idle, "ms");
    console.log("   └─ Tiempo de adquisición:", sequelize.config.pool?.acquire, "ms");
    
    console.log("\n=== 🔧 OTRAS CONFIGURACIONES ===");
    console.log("📝 Logging:", sequelize.options.logging ? "✅ Habilitado" : "❌ Deshabilitado");
    console.log("⏰ Zona horaria:", sequelize.options.timezone);
    console.log("🔄 Dialecto:", sequelize.config.dialect);
    console.log("================================\n");
  })
  .catch((error) => {
    console.error("❌ ERROR DE CONEXIÓN A MYSQL");
    console.error("📝 Mensaje:", error.message);
    console.error("🔍 Configuración de conexión:");
    console.error("🔌 Host:", process.env.DB_HOST);
    console.error("🔌 Puerto:", process.env.DB_PORT);
    console.error("🔌 Base de datos:", process.env.DB_NAME);
    console.error("🔌 Usuario:", process.env.DB_USERNAME);
    console.error("🔒 SSL:", "Habilitado");
  });

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
