'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Evento extends Model {
    static associate(models) {
      // Relaciones vacías para evitar errores
    }
  }

  Evento.init({}, { 
    sequelize, 
    modelName: 'Evento',
    tableName: 'eventos', // Aunque no exista la tabla
  });

  return Evento;
};
