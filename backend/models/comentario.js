"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Comentario extends Model {
    static associate(models) {
      
      Comentario.belongsTo(models.Usuario, {
        foreignKey: "usuarioid",
        as: "usuarios",
      });
    }
  }

  Comentario.init(
    {
      usuarioid: {
        type: DataTypes.INTEGER,
      },
      contenido: {
        type: DataTypes.STRING,
        allowNull: false
      },
      fecha_hora: {
        type: DataTypes.DATE,
        allowNull: false
      },
      estado: {
        type: DataTypes.BOOLEAN,
      },
    },
    {
      sequelize,
      modelName: "Comentario",
      tableName: "comentarios",
    }
  );

  return Comentario;
};
