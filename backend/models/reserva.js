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
        references: {
          model: "Usuarios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      eventoid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Eventos",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      fecha_hora: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      estado: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Reserva",
    }
  );

  return Reserva;
};
