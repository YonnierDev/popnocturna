'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('calificaciones', [
      {
        usuarioid: 4, // Usuario Final
        eventoid: 1, // Noche de Karaoke
        puntuacion: 5,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        usuarioid: 4, // Usuario Final
        eventoid: 2, // Fiesta Retro
        puntuacion: 4,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        usuarioid: 4, // Usuario Final
        eventoid: 3, // Cena Degustación
        puntuacion: 3,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('calificaciones', null, {});
  }
}; 