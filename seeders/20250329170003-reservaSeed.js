'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Insertar reservas de ejemplo para el usuario con ID 4
    await queryInterface.bulkInsert('reservas', [
      {
        usuarioid: 4, // Usuario con rol Usuario
        eventoid: 1,   // Asumiendo que existe un evento con ID 1
        fecha_hora: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Una semana desde ahora
        aprobacion: 'aprobada',
        estado: true,
        numero_reserva: 'RES-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        usuarioid: 4, // Usuario con rol Usuario
        eventoid: 2,   // Asumiendo que existe un evento con ID 2
        fecha_hora: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 días desde ahora
        aprobacion: 'pendiente',
        estado: true,
        numero_reserva: 'RES-002',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('reservas', null, {});
  }
};