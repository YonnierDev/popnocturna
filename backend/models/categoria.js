'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Categoria extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
      static associate(models) {
      // un rol puede tener muchos usuarios (1:N)
      Categoria.hasMany(models.Categoria, {
        foreignKey: "lugarid",
        as: "lugares",
      });
    }
    
  }
  Categoria.init({
    tipo: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Categoria',
    tableName: 'categorias'
  });
  return Categoria;
};