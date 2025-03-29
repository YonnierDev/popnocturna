'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Calificacion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // un rol puede tener muchos usuarios (1:N)
      /*
      Calificacion.belongsTo(models.Usuario, {
        foreignKey: "usuarioid",
        as: "usuarios"
      });
      Calificacion.belongsTo(models.Evento, {
          foreignKey: "eventoid",
          as: "eventos"
      });
      */
    }
  }
  Calificacion.init(
    {
      usuarioid: DataTypes.INTEGER,
      eventoid: DataTypes.INTEGER,
      puntuacion: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Calificacion",
      tableName: "Calificaciones"
    }
  );
  return Calificacion;
};