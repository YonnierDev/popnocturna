'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Insertar roles básicos
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

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('rols', null, {});
  }
};