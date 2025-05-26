"use strict";

const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Lugar extends Model {
    static associate(models) {
      Lugar.belongsTo(models.Usuario, {
        foreignKey: "usuarioid",
        as: "usuario",
      });

      Lugar.belongsTo(models.Categoria, {
        foreignKey: "categoriaid",
        as: "categoria",
      });

      Lugar.hasMany(models.Evento, {
        foreignKey: "lugarid",
        as: "eventos",
      });
    }
  }

  Lugar.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      usuarioid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      categoriaid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      ubicacion: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      imagen: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fotos_lugar: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: '',
        get() {
          const rawValue = this.getDataValue('fotos_lugar');
          return rawValue ? rawValue.split(',') : [];
        },
        set(value) {
          this.setDataValue('fotos_lugar', Array.isArray(value) ? value.join(',') : value);
        }
      },
      carta_pdf: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      aprobacion: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Lugar",
      tableName: "lugares",
      timestamps: true,
    }
  );

  return Lugar;
};
