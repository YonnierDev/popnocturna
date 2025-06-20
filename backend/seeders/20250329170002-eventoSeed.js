'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Insertar eventos de ejemplo
    await queryInterface.bulkInsert('eventos', [
      {
        lugarid: 1, 
        usuarioid: 3, 
        nombre: 'Noche de Vinos',
        capacidad: 50,
        precio: 30.00,
        descripcion: 'Degustación de vinos nacionales e internacionales',
        fecha_hora: new Date('2025-12-25T20:00:00'),
        estado: true,
        portada: JSON.stringify(['https://res.cloudinary.com/popaimagen/image/upload/sample1.jpg']),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        lugarid: 2, 
        usuarioid: 3, 
        nombre: 'Fiesta Blanca',
        capacidad: 300,
        precio: 40.00,
        descripcion: 'La mejor fiesta temática de la ciudad, vestimenta blanca obligatoria',
        fecha_hora: new Date('2025-08-28T23:00:00'),
        estado: true,
        portada: JSON.stringify(['https://res.cloudinary.com/popaimagen/image/upload/sample2.jpg']),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        lugarid: 3, 
        usuarioid: 3, 
        nombre: 'Torneo Relámpago',
        capacidad: 16,
        precio: 20.00,
        descripcion: 'Torneo de fútbol 5 con premios en efectivo',
        fecha_hora: new Date('2024-09-22T19:00:00'),
        estado: true,
        portada: JSON.stringify(['https://res.cloudinary.com/popaimagen/image/upload/sample3.jpg']),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        lugarid: 4, 
        usuarioid: 3, 
        nombre: 'Cena con Estrellas',
        capacidad: 40,
        precio: 75.00,
        descripcion: 'Cena gourmet con menú degustación y maridaje',
        fecha_hora: new Date('2025-10-30T20:00:00'),
        estado: true,
        portada: JSON.stringify(['https://res.cloudinary.com/popaimagen/image/upload/sample4.jpg']),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        lugarid: 5, 
        usuarioid: 3, 
        nombre: 'Noche de Tapas',
        capacidad: 35,
        precio: 25.00,
        descripcion: 'Degustación de tapas españolas con vino de la casa',
        fecha_hora: new Date('2025-09-27T20:30:00'),
        estado: true,
        portada: JSON.stringify(['https://res.cloudinary.com/popaimagen/image/upload/sample5.jpg']),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('eventos', null, {});
  }
};