"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Evento extends Model {
    static associate(models) {
      Evento.belongsTo(models.Lugar, {
        foreignKey: "lugarid",
        as: "lugar",
      });

      Evento.belongsTo(models.Comentario, {
        foreignKey: "comentarioid",
        as: "comentario",
      });

      Evento.hasMany(models.Reserva, {
        foreignKey: "eventoid",
        as: "reservas",
      });
      
      Evento.hasMany(models.Calificacion, {
        foreignKey: "eventoid",
        as: "calificaciones",
      }); 
    }
  }

  Evento.init(
    {
      lugarid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      comentarioid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      capacidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      precio: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fecha_hora: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      estado: {
        type: DataTypes.BOOLEAN,
      },
    },
    {
      sequelize,
      modelName: "Evento",
      tableName: "eventos",
    }
  );
  return Evento;
};
