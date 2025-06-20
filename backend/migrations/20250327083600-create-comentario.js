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
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      eventoid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'eventos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      aprobacion: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '0 = pendiente, 1 = aceptado, 2 = rechazado'
      },
      motivo_reporte: {
        type: Sequelize.STRING,
        allowNull: true
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
