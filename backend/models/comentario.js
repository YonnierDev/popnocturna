'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Comentario extends Model {
        static associate(models) {
            Comentario.belongsTo(models.Usuario, {
                foreignKey: "usuarioid",
                as: "usuarios"
            });
        }
    }

    Comentario.init(
        {
            usuarioid: DataTypes.INTEGER,
            contenido: DataTypes.STRING,
            fecha_hora: DataTypes.DATE
        },
        {
            sequelize,
            modelName: "Comentario",
            tableName: "comentarios"
        }
    );

    return Comentario;
};
