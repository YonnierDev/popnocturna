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

      Evento.belongsTo(models.Usuario, {
        foreignKey: "usuarioid",
        as: "usuario",
      });
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
      portada: {
        type: DataTypes.TEXT, // Cambiado para coincidir con longtext y manejar JSON string
        allowNull: true,
        defaultValue: '[]', // Default como string JSON vacío
        get() {
          const rawValue = this.getDataValue('portada');
          try {
            return rawValue ? JSON.parse(rawValue) : [];
          } catch (e) {
            // Si hay un error al parsear (ej. no es un JSON válido), devolver array vacío
            console.warn(`Error al parsear JSON de 'portada' para evento ID ${this.id}:`, rawValue, e);
            return [];
          }
        },
        set(value) {
          // Asegurar que siempre se guarde un string JSON válido
          this.setDataValue('portada', Array.isArray(value) ? JSON.stringify(value) : JSON.stringify([]));
        },
      },
      estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      usuarioid: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
