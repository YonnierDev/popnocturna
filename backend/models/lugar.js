"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Lugar extends Model {
    static associate(models) {
      // Asociación con Usuario
      Lugar.belongsTo(models.Usuario, {
        foreignKey: "usuarioid",
        as: "usuarios",
      });
      
      // Asociación con Categoría
      Lugar.belongsTo(models.Categoria, {
        foreignKey: "categoriaid",
        as: "categorias",
      });

    }
  }

  Lugar.init(
    {
      categoriaid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      usuarioid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ubicacion: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Lugar",
      tableName: "lugares",
    }
  );

  return Lugar;
};
