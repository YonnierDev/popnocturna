"use strict";
const bcrypt = require("bcrypt");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('Usuarios', [{
     *   nombre: 'John Doe',
     * apellido: 'Doe',
     * correo: '',
     * fecha_nacimiento: '2023-03-29',
     * contrasena: 'hashed_password',
     *  genero: 'M',
     * estado: 'activo',
     * rolid: 1,
     * }], {});
     */

    await queryInterface.bulkInsert(
      "usuarios",
      [
        {
          nombre: "Administrador",
          apellido: "Pro",
          correo: "administrador@gmail.com",
          fecha_nacimiento: "2023-03-29",
          contrasena: await bcrypt.hash("Admin123", 10),
          genero: "Masculino",
          estado: true,
          rolid: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: "Propietario",
          apellido: "Medio",
          correo: "propietario@gmail.com",
          fecha_nacimiento: "2023-03-29",
          contrasena: await bcrypt.hash("Prop1234", 10),
          genero: "M",
          estado: true,
          rolid: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: "Usuario",
          apellido: "Básico",
          correo: "usuario@gmail.com",
          fecha_nacimiento: "2023-03-29",
          contrasena: await bcrypt.hash("User1234", 10),
          genero: "M",
          estado: true,
          rolid: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Usuarios", null, {});
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
