'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('comentarios', [
      {
        usuarioid: 4, // Usuario Final
        eventoid: 1, // Noche de Karaoke
        contenido: '¡Excelente ambiente y buena música!',
        fecha_hora: new Date('2024-04-15T23:00:00'),
        estado: true,
        aprobacion: 'aceptado',
        motivo_reporte: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        usuarioid: 4, // Usuario Final
        eventoid: 2, // Fiesta Retro
        contenido: 'La música retro estuvo genial, volveré pronto.',
        fecha_hora: new Date('2024-04-20T23:00:00'),
        estado: true,
        aprobacion: 'aceptado',
        motivo_reporte: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        usuarioid: 4, // Usuario Final
        eventoid: 3, // Cena Degustación
        contenido: 'La comida estuvo deliciosa, pero el servicio fue lento.',
        fecha_hora: new Date('2024-04-25T21:00:00'),
        estado: true,
        aprobacion: 'pendiente',
        motivo_reporte: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('comentarios', null, {});
  }
}; 