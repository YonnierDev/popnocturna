'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('Rols', [
     * {
     *   nombre: 'Propietario',
     * }
     * ], {});
    */
    await queryInterface.bulkInsert('rols', [
       {
         nombre: 'Administrador',
         createdAt: new Date(),
         updatedAt: new Date(),
       },
       {
        nombre: 'Propietario',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        //Pasar ID 3 para que el rol del usuario se creee por defecto con rol (Usuario)
        nombre: 'Usuario',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Rols', null, {});
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
