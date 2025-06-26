'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notificacion extends Model {
    static associate(models) {
      Notificacion.belongsTo(models.Usuario, {
        foreignKey: 'remitente_id',
        as: 'remitente',
      });

      Notificacion.belongsTo(models.Usuario, {
        foreignKey: 'receptor_id',
        as: 'receptor',
      });
    }
  }

  Notificacion.init({
    remitente_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    receptor_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cuerpo: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    imagen: {
      type: DataTypes.STRING,
      allowNull: true
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    leida: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Notificacion',
    tableName: 'notificaciones',
    timestamps: true
  });

  return Notificacion;
};
