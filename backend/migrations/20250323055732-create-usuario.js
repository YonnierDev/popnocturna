'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuarios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      apellido: {
        type: Sequelize.STRING
      },
      correo: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      fecha_nacimiento: {
        type: Sequelize.DATE
      },
      contrasena: {
        type: Sequelize.STRING,
        allowNull: false,
        
      },
      genero: {
        type: Sequelize.STRING
      },
      estado: {
        type: Sequelize.BOOLEAN
      },
      imagen: {
        type: Sequelize.STRING,
        allowNull: true
      },
      rolid: {
        type: Sequelize.INTEGER,
        references: {
          model: 'rols',
          key: 'id'
        }
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
    await queryInterface.dropTable('usuarios');
  }
};