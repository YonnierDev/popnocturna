'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Rol extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // un rol puede tener muchos usuarios (1:N)
      Rol.hasMany(models.Usuario, {
        foreignKey: "rolid",
        as: "usuarios",
      });
    }
  }
  Rol.init(
    {
      nombre: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Rol", //nombre del modelo
      tableName: "rols", //nombre de la tabla en la base de datos
    }
  );
  return Rol;
};