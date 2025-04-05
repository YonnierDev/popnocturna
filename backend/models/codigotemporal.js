"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Codigotemporal extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
     /* Codigotemporal.belongsTo(models.Usuario, {
        foreignKey: "usuarioid",
        as: "usuario",
      });*/
    }
  }
  Codigotemporal.init(
    {
      codtemporalid: DataTypes.INTEGER,
      codigo: DataTypes.STRING,
      correo: DataTypes.STRING,
      expiracion: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Codigotemporal",
      tableName: "Codigotemporals",
    }
  );
  return Codigotemporal;
};
