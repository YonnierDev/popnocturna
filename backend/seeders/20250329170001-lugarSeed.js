'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Verificar si ya existen lugares
      const count = await queryInterface.sequelize.query(
        'SELECT COUNT(*) as count FROM lugares',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (count[0].count === 0) {
        // Obtener un usuario propietario y categorías existentes
        const [propietario] = await queryInterface.sequelize.query(
          'SELECT id FROM usuarios WHERE correo = ? LIMIT 1',
          {
            replacements: ['propietario@example.com'],
            type: queryInterface.sequelize.QueryTypes.SELECT
          }
        );

        const categorias = await queryInterface.sequelize.query(
          'SELECT id, tipo FROM categorias',
          { type: queryInterface.sequelize.QueryTypes.SELECT }
        );

        if (propietario && categorias.length > 0) {
          // Mapear categorías por nombre para fácil acceso
          const categoriasMap = {};
          categorias.forEach(cat => {
            categoriasMap[cat.tipo.toLowerCase()] = cat.id;
          });

          const lugares = [
            {
              categoriaid: categoriasMap['bar'] || categorias[0].id,
              usuarioid: propietario.id,
              nombre: 'El Rincón del Vino',
              descripcion: 'Bar acogedor con amplia selección de vinos y tapas',
              ubicacion: 'Calle del Vino 45, Ciudad',
              estado: true,
              imagen: 'https://res.cloudinary.com/popaimagen/image/upload/v1748095030/categoria-1748095030173.png',
              fotos_lugar: JSON.stringify([
                'https://res.cloudinary.com/popaimagen/image/upload/v1748095030/categoria-1748095030173.png',
                'https://res.cloudinary.com/popaimagen/image/upload/v1748095030/categoria-1748095030173.png'
              ]),
              aprobacion: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              categoriaid: categoriasMap['discoteca'] || categorias[0].id,
              usuarioid: propietario.id,
              nombre: 'Pachá Night Club',
              descripcion: 'La mejor experiencia nocturna con DJs internacionales',
              ubicacion: 'Avenida Nocturna 202',
              estado: true,
              imagen: 'https://res.cloudinary.com/popaimagen/image/upload/v1748097870/categoria-1748097870453.jpg',
              fotos_lugar: JSON.stringify([
                'https://res.cloudinary.com/popaimagen/image/upload/v1748097870/categoria-1748097870453.jpg'
              ]),
              aprobacion: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              categoriaid: categoriasMap['canchas sintéticas'] || categorias[0].id,
              usuarioid: propietario.id,
              nombre: 'Fútbol Nocturno Premium',
              descripcion: 'Canchas sintéticas iluminadas para jugar de noche',
              ubicacion: 'Calle Deportiva 78',
              estado: true,
              imagen: 'https://res.cloudinary.com/popaimagen/image/upload/v1748097950/categoria-1748097950070.png',
              fotos_lugar: JSON.stringify([
                'https://res.cloudinary.com/popaimagen/image/upload/v1748097950/categoria-1748097950070.png'
              ]),
              aprobacion: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          ];

          await queryInterface.bulkInsert('lugares', lugares, {});
        } else {
          console.log('No se encontró un usuario propietario o categorías para crear lugares de prueba');
        }
      }
    } catch (error) {
      console.error('Error en el seeder de lugares:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // Eliminar solo los lugares de prueba
    await queryInterface.bulkDelete('lugares', {
      nombre: {
        [Sequelize.Op.in]: [
          'El Rincón del Vino',
          'Pachá Night Club',
          'Fútbol Nocturno Premium'
        ]
      }
    }, {});
  }
};