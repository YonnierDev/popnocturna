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
          nombre: "Super",
          apellido: "Admin",
          correo: "superadmin@gmail.com",
          fecha_nacimiento: "1990-01-01",
          contrasena: await bcrypt.hash("Super-123", 10),
          genero: "Masculino",
          estado: true,
          rolid: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: "Admin",
          apellido: "Sistema",
          correo: "admin@gmail.com",
          fecha_nacimiento: "1990-01-01",
          contrasena: await bcrypt.hash("Admin-123", 10),
          genero: "Masculino",
          estado: true,
          rolid: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: "Propietario",
          apellido: "Negocio",
          correo: "propietario@gmail.com",
          fecha_nacimiento: "1990-01-01",
          contrasena: await bcrypt.hash("Prop-123", 10),
          genero: "Masculino",
          estado: true,
          rolid: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: "Usuario",
          apellido: "Final",
          correo: "usuario@gmail.com",
          fecha_nacimiento: "1990-01-01",
          contrasena: await bcrypt.hash("User-123", 10),
          genero: "Masculino",
          estado: true,
          rolid: 4,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("usuarios", null, {});
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
