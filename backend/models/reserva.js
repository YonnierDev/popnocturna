"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Reserva extends Model {
    static associate(models) {
      Reserva.belongsTo(models.Usuario, {
        foreignKey: "usuarioid",
        as: "usuarios",
      });

      Reserva.belongsTo(models.Evento, {
        foreignKey: "eventoid",
        as: "eventos",
      });
    }
  }

  Reserva.init(
    {
      usuarioid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      eventoid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      fecha_hora: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      aprobacion: {
        type: DataTypes.STRING,
      },
      estado: {
        type: DataTypes.BOOLEAN,
      },
    },
    {
      sequelize,
      modelName: "Reserva",
      tableName: "reservas",
    }
  );

  return Reserva;
};
