'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reservas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      numero_reserva: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      usuarioid: {
        type: Sequelize.INTEGER,
        reference:{
          model: 'usuarios',
          key: 'id'
        }
      },
      eventoid: {
        type: Sequelize.INTEGER,
        reference:{
          model: 'eventos',
          key: 'id'
        }
      },
      fecha_hora: {
        type: Sequelize.DATE,
        allowNull: false
      },
      aprobacion: {//aprobada, rechazada, pendiente
        type: Sequelize.STRING
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
    await queryInterface.dropTable('reservas');
  }
};