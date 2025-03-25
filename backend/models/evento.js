"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Evento extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Asociación con Lugar
      Evento.belongsTo(models.Lugar, {
        foreignKey: "lugarid",
        as: "lugares",
      });

      /* Asociación con Comentario
      Evento.belongsTo(models.Comentario, {
        foreignKey: "comentarioid",
        as: "comentarios",
      });
      */
    }
  }
  Evento.init(
    {
      lugarid: DataTypes.INTEGER,
      comentarioid: DataTypes.INTEGER,
      aforo: DataTypes.INTEGER,
      precio: DataTypes.DECIMAL,
      descripcion: DataTypes.STRING,
      fecha_hora: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Evento",
      tableName: "eventos",
    }
  );
  return Evento;
};
