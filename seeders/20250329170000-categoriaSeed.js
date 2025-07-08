'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Insertar categorías básicas
    await queryInterface.bulkInsert('categorias', [
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
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categorias', null, {});
  }
};