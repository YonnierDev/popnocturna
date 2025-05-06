'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('Rols', [
     * {
     *   nombre: 'Propietario',
     * }
     * ], {});
    */
    await queryInterface.bulkInsert('rols', [
      {
        nombre: 'Super Administrador',
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'Administrador',
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'Propietario',
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'Usuario',
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('rols', null, {});
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
