'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Insertar comentarios de ejemplo para el usuario con ID 4
    await queryInterface.bulkInsert('comentarios', [
      {
        usuarioid: 4, // Usuario con rol Usuario
        eventoid: 1,   // Asumiendo que existe un evento con ID 1
        contenido: '¡Excelente ambiente y buena música!',
        fecha_hora: new Date(),
        estado: true,
        aprobacion: 1, // 1 = aprobado
        motivo_reporte: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        usuarioid: 4, // Usuario con rol Usuario
        eventoid: 2,   // Asumiendo que existe un evento con ID 2
        contenido: 'La música estuvo genial, volveré pronto.',
        fecha_hora: new Date(Date.now() - 86400000), // Ayer
        estado: true,
        aprobacion: 0, // 0 = pendiente
        motivo_reporte: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        usuarioid: 4, // Usuario con rol Usuario
        eventoid: 1,   // Asumiendo que existe un evento con ID 1
        contenido: 'El lugar es acogedor, pero el servicio podría mejorar.',
        fecha_hora: new Date(Date.now() - 2 * 86400000), // Hace 2 días
        estado: true,
        aprobacion: 0, // 0 = pendiente
        motivo_reporte: 'Contenido inapropiado',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('comentarios', null, {});
  }
};