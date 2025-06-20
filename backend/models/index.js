"use strict";

const fs = require("fs");
const path = require("path");
const { Sequelize } = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
require("dotenv").config();

let sequelize;

console.log("🔧 Iniciando servidor...");
sequelize = new Sequelize(
  process.env.DB_NAME || "railway",
  process.env.DB_USERNAME || "root",
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || "gondola.proxy.rlwy.net",
    port: process.env.DB_PORT || "30422",
    dialect: "mysql",
    dialectModule: require("mysql2"),
    logging: false,
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
    console.log("🔌 Host:", sequelize.config.host);
    console.log("🗄️ Base de datos:", sequelize.config.database);
    console.log("🔑 Usuario:", sequelize.config.username);
    console.log("🔒 SSL:", sequelize.config.dialectOptions?.ssl ? "✅ Habilitado" : "❌ Deshabilitado");
    console.log("🌐 Puerto:", sequelize.config.port);
    
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
    console.error("\n❌ ERROR DE CONEXIÓN A MYSQL");
    console.error("📝 Mensaje:", error.message);
    console.error("🔍 Configuración actual:", {
      host: sequelize.config.host,
      database: sequelize.config.database,
      port: sequelize.config.port,
      dialect: sequelize.config.dialect,
      ssl: sequelize.config.dialectOptions?.ssl ? "Habilitado" : "Deshabilitado"
    });
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
