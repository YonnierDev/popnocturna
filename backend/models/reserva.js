'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Evento extends Model {
    static associate(models) {
      // Un evento pertenece a un usuario
      Evento.belongsTo(models.Usuario, {
        foreignKey: 'fk_id_usuario',
        as: 'creador'
      });

      // Un evento pertenece a un lugar
      Evento.belongsTo(models.Lugar, {
        foreignKey: 'fk_id_lugar',
        as: 'lugar'
      });
    }
  }
  Evento.init({
    aforo: DataTypes.INTEGER,
    precio: DataTypes.FLOAT,
    descripcion: DataTypes.STRING,
    fecha_hora: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Evento',
    tableName: 'eventos',
  });
  return Evento;
};