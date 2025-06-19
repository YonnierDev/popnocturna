'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('eventos', [
      {
        lugarid: 1, // El Rincón del Vino
        usuarioid: 3, // Propietario
        nombre: 'Noche de Vinos',
        capacidad: 50,
        precio: 30.00,
        descripcion: 'Degustación de vinos nacionales e internacionales',
        fecha_hora: new Date('2024-06-25T20:00:00'),
        estado: true,
        portada: JSON.stringify(['https://res.cloudinary.com/popaimagen/image/upload/sample1.jpg']),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        lugarid: 2, // Pachá Night Club
        usuarioid: 3, // Propietario
        nombre: 'Fiesta Blanca',
        capacidad: 300,
        precio: 40.00,
        descripcion: 'La mejor fiesta temática de la ciudad, vestimenta blanca obligatoria',
        fecha_hora: new Date('2024-06-28T23:00:00'),
        estado: true,
        portada: JSON.stringify(['https://res.cloudinary.com/popaimagen/image/upload/sample2.jpg']),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        lugarid: 3, // Fútbol Nocturno Premium
        usuarioid: 3, // Propietario
        nombre: 'Torneo Relámpago',
        capacidad: 16,
        precio: 20.00,
        descripcion: 'Torneo de fútbol 5 con premios en efectivo',
        fecha_hora: new Date('2024-06-22T19:00:00'),
        estado: true,
        portada: JSON.stringify(['https://res.cloudinary.com/popaimagen/image/upload/sample3.jpg']),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('eventos', null, {});
  }
}; 