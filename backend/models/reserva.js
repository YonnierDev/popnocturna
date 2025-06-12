"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Reserva extends Model {
    static associate(models) {
      Reserva.belongsTo(models.Usuario, {
        foreignKey: "usuarioid",
        as: "usuario",
      });

      Reserva.belongsTo(models.Evento, {
        foreignKey: "eventoid",
        as: "evento",
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
      numero_reserva: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      cantidad_entradas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 1
        }
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
