'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Verificar si ya existen categorías
      const count = await queryInterface.sequelize.query(
        'SELECT COUNT(*) as count FROM categorias',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (count[0].count === 0) {
        const categorias = [
          {
            tipo: 'Bar',
            descripcion: 'Establecimiento que sirve bebidas alcohólicas y aperitivos',
            imagen: 'https://res.cloudinary.com/popaimagen/image/upload/v1748095030/categoria-1748095030173.png',
            estado: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            tipo: 'Discoteca',
            descripcion: 'Local de baile con música en vivo o grabada',
            imagen: 'https://res.cloudinary.com/popaimagen/image/upload/v1748097870/categoria-1748097870453.jpg',
            estado: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            tipo: 'Restaurante',
            descripcion: 'Establecimiento que sirve comidas y bebidas',
            imagen: 'https://res.cloudinary.com/popaimagen/image/upload/v1748097881/categoria-1748097881384.png',
            estado: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            tipo: 'Canchas sinteticas',
            descripcion: 'El deporte nocturno es lo mejor',
            imagen: 'https://res.cloudinary.com/popaimagen/image/upload/v1748097950/categoria-1748097950070.png',
            estado: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ];

        // Insertar categorías que no existen
        for (const categoria of categorias) {
          const [existing] = await queryInterface.sequelize.query(
            'SELECT id FROM categorias WHERE tipo = :tipo',
            {
              replacements: { tipo: categoria.tipo },
              type: queryInterface.sequelize.QueryTypes.SELECT
            }
          );

          if (!existing) {
            await queryInterface.bulkInsert('categorias', [categoria]);
          }
        }
      }
    } catch (error) {
      console.error('Error en el seeder de categorías:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // Eliminar solo las categorías de prueba
    await queryInterface.bulkDelete('categorias', {
      tipo: {
        [Sequelize.Op.in]: [
          'Bar',
          'Discoteca',
          'Restaurante',
          'Canchas sinteticas'
        ]
      }
    }, {});
  }
};