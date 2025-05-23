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
        unique: true,
        allowNull: false
      },
      estado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
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