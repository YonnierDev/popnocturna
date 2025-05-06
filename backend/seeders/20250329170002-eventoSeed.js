'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('eventos', [
      {
        lugarid: 1, // Bar Central
        usuarioid: 3, // Propietario
        nombre: 'Noche de Karaoke',
        capacidad: 100,
        precio: 25.00,
        descripcion: 'Noche especial de karaoke con premios',
        fecha_hora: new Date('2024-04-15T20:00:00'),
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        lugarid: 2, // Club Nocturno
        usuarioid: 3, // Propietario
        nombre: 'Fiesta Retro',
        capacidad: 200,
        precio: 35.00,
        descripcion: 'Fiesta con música de los 80s y 90s',
        fecha_hora: new Date('2024-04-20T22:00:00'),
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        lugarid: 3, // Restaurante Gourmet
        usuarioid: 3, // Propietario
        nombre: 'Cena Degustación',
        capacidad: 50,
        precio: 75.00,
        descripcion: 'Menú degustación con maridaje de vinos',
        fecha_hora: new Date('2024-04-25T19:00:00'),
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('eventos', null, {});
  }
}; 