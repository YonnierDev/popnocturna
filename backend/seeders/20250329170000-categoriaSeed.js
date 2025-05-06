'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('categorias', [
      {
        tipo: 'Bar',
        descripcion: 'Establecimiento que sirve bebidas alcohólicas y aperitivos',
        imagen: null,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tipo: 'Discoteca',
        descripcion: 'Local de baile con música en vivo o grabada',
        imagen: null,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tipo: 'Restaurante',
        descripcion: 'Establecimiento que sirve comidas y bebidas',
        imagen: null,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tipo: 'Canchas sinteticas',
        descripcion: 'El deporte nocturno es lo mejor',
        imagen: null,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categorias', null, {});
  }
}; 