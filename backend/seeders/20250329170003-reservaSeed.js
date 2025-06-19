'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Verificar si ya existen reservas
      const count = await queryInterface.sequelize.query(
        'SELECT COUNT(*) as count FROM reservas',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (count[0].count === 0) {
        // Obtener un usuario y un evento existentes
        const [usuario] = await queryInterface.sequelize.query(
          'SELECT id FROM usuarios WHERE correo = ? LIMIT 1',
          {
            replacements: ['usuario@example.com'],
            type: queryInterface.sequelize.QueryTypes.SELECT
          }
        );

        const [evento] = await queryInterface.sequelize.query(
          'SELECT id FROM eventos LIMIT 1',
          { type: queryInterface.sequelize.QueryTypes.SELECT }
        );

        if (usuario && evento) {
          await queryInterface.bulkInsert('reservas', [
            {
              usuarioid: usuario.id,
              eventoid: evento.id,
              fecha_hora: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Una semana desde ahora
              aprobacion: 'aprobada',
              estado: true,
              numero_reserva: 'RES-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
              cantidad_entradas: 2,
              monto_total: 60.00,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              usuarioid: usuario.id,
              eventoid: evento.id,
              fecha_hora: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 días desde ahora
              aprobacion: 'pendiente',
              estado: true,
              numero_reserva: 'RES-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
              cantidad_entradas: 4,
              monto_total: 120.00,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          ], {});
        } else {
          console.log('No se encontró un usuario o evento para crear reservas de prueba');
        }
      }
    } catch (error) {
      console.error('Error en el seeder de reservas:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // Eliminar solo las reservas de prueba (las que empiezan con 'RES-')
    await queryInterface.bulkDelete('reservas', {
      numero_reserva: {
        [Sequelize.Op.like]: 'RES-%'
      }
    }, {});
  }
};