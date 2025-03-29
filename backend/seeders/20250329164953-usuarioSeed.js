'use strict';
const bcrypt = require('bcrypt');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
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
  
    await queryInterface.bulkInsert('Usuarios', [
      {
      nombre: 'Admin',
      apellido: 'admin',
      correo: 'admin1',
      fecha_nacimiento: '2023-03-29',
      contrasena: await bcrypt.hash('Admin123', 10),
      genero: 'M',
      estado: 'activo',
      rolid: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      },
      {
        nombre: 'Admin2',
        apellido: 'admin',
        correo: 'admin2',
        fecha_nacimiento: '2023-03-29',
        contrasena: await bcrypt.hash('Admin1234', 10),
        genero: 'M',
        estado: 'activo',
        rolid: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Usuarios', null, {});
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
