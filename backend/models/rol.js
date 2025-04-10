"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Rol extends Model {
    static associate(models) {
      Rol.hasMany(models.Usuario, {
        foreignKey: "rolid",
        as: "usuarios",
      });
    }
  }
  Rol.init(
    {
      nombre: {
        type: DataTypes.STRING,
      },
      estado: {
        type: DataTypes.BOOLEAN,
      },
    },
    {
      sequelize,
      modelName: "Rol",
      tableName: "rols",
    }
  );
  return Rol;
};