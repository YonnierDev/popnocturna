"use strict";

const { Model, Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Evento extends Model {
    static associate(models) {
      Evento.belongsTo(models.Lugar, {
        foreignKey: "lugarid",
        as: "lugar",
      });

      Evento.hasMany(models.Comentario, {
        foreignKey: "eventoid",
        as: "comentarios",
      });

      Evento.hasMany(models.Reserva, {
        foreignKey: "eventoid",
        as: "reservas",
      });

      Evento.hasMany(models.Calificacion, {
        foreignKey: "eventoid",
        as: "calificaciones",
      });

      // Comentar la relación con Usuario
      // Evento.belongsTo(models.Usuario, {
      //   foreignKey: "usuarioid",
      //   as: "usuario",
      // });
    }
  }

  Evento.init(
    {
      lugarid: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      nombre: {
        type: DataTypes.STRING,
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
        defaultValue: true,
      },

      // Comentar el campo usuarioid
      // usuarioid: {
      //   type: DataTypes.INTEGER,
      //   allowNull: false,
      // },
      
    },
    {
      sequelize,
      modelName: "Evento",
      tableName: "eventos",
    }
  );

  return Evento;
};
