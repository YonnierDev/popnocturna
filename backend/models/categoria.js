"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Categoria extends Model {
    static associate(models) {
      Categoria.hasMany(models.Lugar, {
        foreignKey: "categoriaid",
        as: "lugares",
      });
    }
  }
  
  Categoria.init(
    {
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      tipo: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      imagen: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true, 
      }
    },
    {
      sequelize,
      modelName: "Categoria",
      tableName: "categorias",
      paranoid: true,
      timestamps: true,
    }
  );
  return Categoria;
};