"use strict";

const fs = require("fs");
const path = require("path");
const { Sequelize } = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
require("dotenv").config();

let sequelize;

if (process.env.NODE_ENV === "production") {
  console.log("🔧 Usando configuración de producción con variables individuales 🔧");
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
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
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
} else {
  console.log("🔧 Usando configuración local 🔧");
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: "mysql",
      dialectModule: require("mysql2"),
      logging: false,
    }
  );
}

const db = {};

// 🔍 Verificar conexión a la base de datos
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Conexión a MySQL exitosa");
    console.log("📊 Configuración actual:", {
      database: sequelize.config.database,
      host: sequelize.config.host,
      port: sequelize.config.port,
      dialect: sequelize.config.dialect,
      ssl: sequelize.config.dialectOptions?.ssl ? "Habilitado" : "Deshabilitado"
    });
  })
  .catch((error) => {
    console.error("❌ Error de conexión a MySQL:", error);
    console.error("🔍 Detalles del error:", {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      stack: error.stack
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
