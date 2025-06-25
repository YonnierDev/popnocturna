"use strict";

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
        allowNull: false
      },
      apellido: {
        type: Sequelize.STRING,
        allowNull: false
      },
      correo: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      fecha_nacimiento: {
        type: Sequelize.DATE,
        allowNull: false
      },
      contrasena: {
        type: Sequelize.STRING,
        allowNull: false
      },
      genero: {
        type: Sequelize.STRING,
        allowNull: false
      },
      estado: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      imagen: {
        type: Sequelize.STRING,
        allowNull: true
      },
      rolid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'rols',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      device_token: {
          type: DataTypes.STRING,
          allowNull: true,
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
