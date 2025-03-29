'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('lugares', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      categoriaid: {
        type: Sequelize.INTEGER,
        reference:{
          model: 'categorias',
          key: 'id'
        }
      },
      usuarioid: {
        type: Sequelize.INTEGER,
        reference:{
          model: 'usuarios',
          key: 'id'
        }
      },
      descripcion: {
        type: Sequelize.STRING
      },
      ubicacion: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('lugares');
  }
};