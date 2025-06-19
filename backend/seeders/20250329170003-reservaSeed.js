'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('reservas', [
      {
        usuarioid: 4, // Usuario Final
        eventoid: 1, // Noche de Vinos
        fecha_hora: new Date('2024-06-25T20:00:00'),
        aprobacion: 'aprobada',
        estado: true,
        numero_reserva: 'RES-001',
        cantidad_personas: 2,
        monto_total: 60.00,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        usuarioid: 4, // Usuario Final
        eventoid: 2, // Fiesta Blanca
        fecha_hora: new Date('2024-06-28T23:00:00'),
        aprobacion: 'pendiente',
        estado: true,
        numero_reserva: 'RES-002',
        cantidad_personas: 4,
        monto_total: 160.00,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        usuarioid: 4, // Usuario Final
        eventoid: 3, // Torneo Relámpago
        fecha_hora: new Date('2024-06-22T19:00:00'),
        aprobacion: 'rechazada',
        estado: false,
        numero_reserva: 'RES-003',
        cantidad_personas: 5,
        monto_total: 100.00,
        motivo_rechazo: 'Cupo completo',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('reservas', null, {});
  }
}; 