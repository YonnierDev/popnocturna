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
        references: {
          model: 'categorias',
          key: 'id'
        }
      },
      usuarioid: {
        type: Sequelize.INTEGER,
        references: {
          model: 'usuarios',
          key: 'id'
        }
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      descripcion: {
        type: Sequelize.STRING,
        allowNull: false
      },
      ubicacion: {
        type: Sequelize.STRING,
        allowNull: false
      },
      estado: {
        type: Sequelize.BOOLEAN
      },
      imagen: {
        type: Sequelize.STRING,
        allowNull: true
      },
      fotos_lugar: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: '[]'
      },
      carta_pdf: {
        type: Sequelize.STRING,
        allowNull: true
      },
      aprobacion: {
        type: Sequelize.BOOLEAN,
        allowNull: false
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