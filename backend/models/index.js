"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";

let sequelize;

if (process.env.DATABASE_URL) {
  // Para producción (Railway)
  console.log("🔧 Usando configuración de producción con DATABASE_URL");
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  // Para desarrollo local
  console.log("🔧 Usando configuración local");
  const config = require(__dirname + "/../config/config.json")[env];
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
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
      port: sequelize.config.port
    });
  })
  .catch((error) => {
    console.error("❌ Error de conexión a MySQL:", error);
    console.error("🔍 Detalles del error:", {
      message: error.message,
      code: error.code,
      errno: error.errno
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
