"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    static associate(models) {
      Usuario.belongsTo(models.Rol, {
        foreignKey: "rolid",
        as: "rol",
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

      Usuario.hasMany(models.Evento, {
        foreignKey: "usuarioid",
        as: "eventos",
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
        validate: {
          isIn: {
            args: [['Masculino', 'Femenino', 'Otro']],
            msg: 'Género no válido. Debe ser Masculino, Femenino u Otro',
            ignoreCase: true
          }
        }
      },
      estado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      imagen: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      rolid: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
