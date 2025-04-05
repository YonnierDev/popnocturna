"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    static associate(models) {
      Usuario.belongsTo(models.Rol, {
        foreignKey: "rolid",
        as: "rols",
      });

      Usuario.hasMany(models.Lugar, {
        foreignKey: "usuarioid",
        as: "lugares",
      });

      Usuario.hasMany(models.Reserva, {
        foreignKey: "usuarioid",
        as: "reservas",
      });

      Usuario.hasMany(models.Comentario, {
        foreignKey: "usuarioid",
        as: "comentarios",
      });

      Usuario.hasMany(models.Calificacion, {
        foreignKey: "usuarioid",
        as: "calificaciones",
      });
      
    }
  }

  Usuario.init(
    {
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      apellido: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      correo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      fecha_nacimiento: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      contrasena: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      genero: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      estado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      rolid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3,
        references: {
          model: "Rol",
          key: "rolid",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    },
    {
      sequelize,
      modelName: "Usuario",
      tableName: "usuarios",
    }
  );

  return Usuario;
};
