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
      usuarioid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id',
          onDelete: 'CASCADE'
        }
      },
      categoriaid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'categorias',
          key: 'id',
          onDelete: 'CASCADE'
        }
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false
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
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
        allowNull: false,
        defaultValue: false
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