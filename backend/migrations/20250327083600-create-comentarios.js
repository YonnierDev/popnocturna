'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('comentarios', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            usuarioid: {
                type: Sequelize.INTEGER,
                reference:{
                model: 'usuarios',
                key: 'id'
            }
            },
            contenido: {
                type: Sequelize.STRING,
                allowNull: false
            },
            fecha_hora: {
                type: Sequelize.DATE,
                allowNull: false
            },
            estado: {
                type: Sequelize.BOOLEAN
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('comentarios');
    }
};
