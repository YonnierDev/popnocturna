'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('reservas', [
      {
        usuarioid: 4, // Usuario Final
        eventoid: 1, // Noche de Karaoke
        fecha_hora: new Date('2024-04-15T20:00:00'),
        aprobacion: 'aprobada',
        estado: true,
        numero_reserva: 'RES-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        usuarioid: 4, // Usuario Final
        eventoid: 2, // Fiesta Retro
        fecha_hora: new Date('2024-04-20T22:00:00'),
        aprobacion: 'pendiente',
        estado: true,
        numero_reserva: 'RES-002',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        usuarioid: 4, // Usuario Final
        eventoid: 3, // Cena Degustación
        fecha_hora: new Date('2024-04-25T19:00:00'),
        aprobacion: 'rechazada',
        estado: false,
        numero_reserva: 'RES-003',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('reservas', null, {});
  }
}; 