"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Calificacion extends Model {
    static associate(models) {
      Calificacion.belongsTo(models.Usuario, {
        foreignKey: "usuarioid",
        as: "usuarios",
      });
      Calificacion.belongsTo(models.Evento, {
        foreignKey: "eventoid",
        as: "eventos",
      });
    }
  }
  Calificacion.init(
    {
      usuarioid: {
        type: DataTypes.INTEGER,
      },
      eventoid: {
        type: DataTypes.INTEGER,
      },
      puntuacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      estado: {
        type: DataTypes.BOOLEAN,
      },
    },
    {
      sequelize,
      modelName: "Calificacion",
      tableName: "calificaciones",
    }
  );
  return Calificacion;
};
