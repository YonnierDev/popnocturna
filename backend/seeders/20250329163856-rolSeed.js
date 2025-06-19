'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Primero, verifica si ya existen registros
    const count = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM rols',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Si no hay registros, inserta los datos
    if (count[0].count === 0) {
      await queryInterface.bulkInsert('rols', [
        {
          nombre: 'Super Administrador',
          estado: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Administrador',
          estado: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          nombre: 'Propietario',
          estado: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ], {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('rols', null, {});
  }
};