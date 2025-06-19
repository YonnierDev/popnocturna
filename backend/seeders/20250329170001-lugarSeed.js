'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('lugares', [
      {
        categoriaid: 1, // Bar
        usuarioid: 3, // Propietario
        nombre: 'El Rincón del Vino',
        descripcion: 'Bar acogedor con amplia selección de vinos y tapas',
        ubicacion: 'Calle del Vino 45, Ciudad',
        estado: true,
        imagen: 'https://res.cloudinary.com/popaimagen/image/upload/v1748095030/categoria-1748095030173.png',
        aprobacion: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        categoriaid: 2, // Discoteca
        usuarioid: 3, // Propietario
        nombre: 'Pachá Night Club',
        descripcion: 'La mejor experiencia nocturna con DJs internacionales',
        ubicacion: 'Avenida Nocturna 202',
        estado: true,
        imagen: 'https://res.cloudinary.com/popaimagen/image/upload/v1748097870/categoria-1748097870453.jpg',
        aprobacion: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        categoriaid: 4, // Canchas sintéticas
        usuarioid: 3, // Propietario
        nombre: 'Fútbol Nocturno Premium',
        descripcion: 'Canchas sintéticas iluminadas para jugar de noche',
        ubicacion: 'Calle Deportiva 78',
        estado: true,
        imagen: 'https://res.cloudinary.com/popaimagen/image/upload/v1748097950/categoria-1748097950070.png',
        aprobacion: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('lugares', null, {});
  }
}; 