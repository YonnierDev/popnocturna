"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("eventos", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      lugarid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "lugares",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      usuarioid: {
        type: Sequelize.INTEGER,
        allowNull: true, // Puede ser false si quieres que siempre haya un usuario asociado
        references: {
          model: "usuarios",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL", // Mejor SET NULL que CASCADE para no borrar eventos si se borra un usuario
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      capacidad: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      precio: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      descripcion: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      fecha_hora: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      estado: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("eventos");
  },
};
