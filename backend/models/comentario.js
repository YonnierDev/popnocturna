"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Comentario extends Model {
    static associate(models) {
      Comentario.belongsTo(models.Usuario, {
        foreignKey: "usuarioid",
        as: "usuario",
      });

      Comentario.belongsTo(models.Evento, {
        foreignKey: "eventoid",
        as: "evento",
      });
    }
  }

  Comentario.init(
    {
      usuarioid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      eventoid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      contenido: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fecha_hora: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      aprobacion: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0, // 0 = pendiente, 1 = aceptado, 2 = rechazado
        comment: '0 = pendiente, 1 = aceptado, 2 = rechazado'
      },
      motivo_reporte: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Motivo por el cual el comentario fue reportado o rechazado'
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
