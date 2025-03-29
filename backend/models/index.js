"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
//const config = require(__dirname + "/../config/config.json")[env];
const mysql = require("mysql2");

const config = {
  username: "ugxck9xkaenzpwg5",
    password: "6HS2sfal2xxMcn5gPQZ2",
    database: "b4gvydqqzxj7kiecj1bu",
    host: "b4gvydqqzxj7kiecj1bu-mysql.services.clever-cloud.com",
    dialect: "mysql",
    port: 3306,
    dialectModule: mysql,
};

const db = {}
let sequelize;

  sequelize = new Sequelize(config.database, config.username, config.password, config);


// 🔍 Verificar conexión a la base de datos
sequelize
  .authenticate()
  .then(() => console.log("✅ Conexión a MySQL exitosa"))
  .catch((error) => console.error("❌ Error de conexión a MySQL:", error));

fs.readdirSync(__dirname)
  .filter((file) => {
    return file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js" && file.indexOf(".test.js") === -1;
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
