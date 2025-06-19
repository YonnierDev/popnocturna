'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Verificar si ya existen comentarios
      const count = await queryInterface.sequelize.query(
        'SELECT COUNT(*) as count FROM comentarios',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (count[0].count === 0) {
        // Obtener usuarios y eventos existentes
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
          const comentarios = [
            {
              usuarioid: usuario.id,
              eventoid: evento.id,
              contenido: '¡Excelente ambiente y buena música!',
              fecha_hora: new Date(),
              estado: true,
              aprobacion: true,
              motivo_reporte: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              usuarioid: usuario.id,
              eventoid: evento.id,
              contenido: 'La música estuvo genial, volveré pronto.',
              fecha_hora: new Date(Date.now() - 86400000), // Ayer
              estado: true,
              aprobacion: true,
              motivo_reporte: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              usuarioid: usuario.id,
              eventoid: evento.id,
              contenido: 'El lugar es acogedor, pero el servicio podría mejorar.',
              fecha_hora: new Date(Date.now() - 2 * 86400000), // Hace 2 días
              estado: true,
              aprobacion: false,
              motivo_reporte: 'Contenido inapropiado',
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          ];

          await queryInterface.bulkInsert('comentarios', comentarios, {});
        } else {
          console.log('No se encontró un usuario o evento para crear comentarios de prueba');
        }
      }
    } catch (error) {
      console.error('Error en el seeder de comentarios:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // Eliminar solo los comentarios de prueba
    await queryInterface.bulkDelete('comentarios', {
      contenido: {
        [Sequelize.Op.in]: [
          '¡Excelente ambiente y buena música!',
          'La música estuvo genial, volveré pronto.',
          'El lugar es acogedor, pero el servicio podría mejorar.'
        ]
      }
    }, {});
  }
};