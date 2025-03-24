'use strict';
const {
  Model
} = require('sequelize');
const rol = require('./rol');
module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
        // 
        Usuario.belongsTo(models.Rol, {
          foreignKey: "rolid",
          as: "rols"
        });
    }
  }
  Usuario.init(
    {
      nombre: DataTypes.STRING,
      apellido: DataTypes.STRING,
      correo: DataTypes.STRING,
      fecha_nacimiento: DataTypes.DATE,
      contrasena: DataTypes.STRING,
      genero: DataTypes.STRING,
      estado: DataTypes.STRING,
      rolid: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Usuario",
      tableName: "Usuarios"
    }
  );
  return Usuario;
};