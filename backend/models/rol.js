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
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
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
      paranoid: true,
      timestamps: true,
    }
  );
  return Rol;
};