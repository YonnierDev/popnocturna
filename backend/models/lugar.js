"use strict";

const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Lugar extends Model {
    static associate(models) {
      Lugar.belongsTo(models.Usuario, {
        foreignKey: "usuarioid",
        as: "usuarios",
      });

      Lugar.belongsTo(models.Categoria, {
        foreignKey: "categoriaid",
        as: "categorias",
      });

      Lugar.hasMany(models.Evento, {
        foreignKey: "lugarid",
        as: "eventos",
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
      estado: {
        type: DataTypes.BOOLEAN,       
      }
    },
    {
      sequelize,
      modelName: "Lugar",
      tableName: "lugares",
    }
  );

  return Lugar;
};
