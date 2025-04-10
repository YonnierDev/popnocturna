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
      tipo: DataTypes.STRING,
      estado: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Categoria",
      tableName: "categorias",
    }
  );
  return Categoria;
};