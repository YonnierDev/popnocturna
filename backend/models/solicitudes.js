"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Solicitud extends Model {
    static associate(models) {
      Solicitud.belongsTo(models.Usuario, {
        foreignKey: "usuario_id",
        as: "usuario",
      });
    }
  }

  Solicitud.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
      },
      estado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pendiente",
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Solicitud",
      tableName: "solicitudes",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Solicitud;
};
