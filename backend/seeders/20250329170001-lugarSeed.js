'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('lugares', [
      {
        categoriaid: 1, // Bar
        usuarioid: 3, // Propietario
        nombre: 'Bar Central',
        descripcion: 'Bar moderno en el centro de la ciudad',
        ubicacion: 'Calle Principal 123',
        estado: true,
        imagen: null,
        aprobacion: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        categoriaid: 2, // Discoteca
        usuarioid: 3, // Propietario
        nombre: 'Club Nocturno',
        descripcion: 'La mejor discoteca de la ciudad',
        ubicacion: 'Avenida Principal 456',
        estado: true,
        imagen: null,
        aprobacion: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        categoriaid: 3, // Restaurante
        usuarioid: 3, // Propietario
        nombre: 'Restaurante Gourmet',
        descripcion: 'Cocina internacional de alta calidad',
        ubicacion: 'Plaza Central 789',
        estado: true,
        imagen: null,
        aprobacion: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('lugares', null, {});
  }
}; 