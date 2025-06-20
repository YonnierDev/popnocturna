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
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
      timestamps: true,
      underscored: false,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    }
  );
  return Rol;
};