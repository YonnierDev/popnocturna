'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Insertar lugares de ejemplo
    await queryInterface.bulkInsert('lugares', [
      {
        nombre: 'BBC NORTE',
        descripcion: 'Acogedor bar de cerveza con una amplia selección de etiquetas nacionales e internacionales.',
        ubicacion: 'Cra. 9 #54a Norte',
        estado: true,
        categoriaid: 1, // Bar
        usuarioid: 3,   // Propietario
        fotos_lugar: JSON.stringify([
          'https://res.cloudinary.com/popaimagen/image/upload/v1748095030/lugar-1-1.jpg',
          'https://res.cloudinary.com/popaimagen/image/upload/v1748095030/lugar-1-2.jpg'
        ]),
        carta_pdf: 'https://res.cloudinary.com/popaimagen/raw/upload/v1748095030/carta-rincon-del-vino.pdf',
        aprobacion: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'ARENA ROSE',
        descripcion: 'La mejor discoteca de la ciudad con música electrónica y ambiente premium.',
        ubicacion: 'Boulevard Rose, Av. Panamericana #14 Norte-2 a 14 Norte-82',
        estado: true,
        categoriaid: 2, // Discoteca
        usuarioid: 3,   // Propietario
        fotos_lugar: JSON.stringify([
          'https://res.cloudinary.com/popaimagen/image/upload/v1748097870/lugar-2-1.jpg',
          'https://res.cloudinary.com/popaimagen/image/upload/v1748097870/lugar-2-2.jpg'
        ]),
        carta_pdf: null,
        aprobacion: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'MACABI',
        descripcion: 'Canchas sintéticas para partidos nocturnos con todas las comodidades.',
        ubicacion: 'Variante Norte',
        estado: true,
        categoriaid: 4, // Canchas sintéticas
        usuarioid: 3,   // Propietario
        fotos_lugar: JSON.stringify([
          'https://res.cloudinary.com/popaimagen/image/upload/v1748097950/lugar-3-1.jpg',
          'https://res.cloudinary.com/popaimagen/image/upload/v1748097950/lugar-3-2.jpg'
        ]),
        carta_pdf: 'https://res.cloudinary.com/popaimagen/raw/upload/v1748097950/tarifas-futbol-nocturno.pdf',
        aprobacion: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'La Terraza del Chef',
        descripcion: 'Restaurante gourmet con terraza y vista panorámica de la ciudad.',
        ubicacion: 'Calle 80 #12-34, Piso 15',
        estado: true,
        categoriaid: 3, // Restaurante
        usuarioid: 3,   // Propietario
        fotos_lugar: JSON.stringify([
          'https://res.cloudinary.com/popaimagen/image/upload/v1748097881/lugar-4-1.jpg',
          'https://res.cloudinary.com/popaimagen/image/upload/v1748097881/lugar-4-2.jpg'
        ]),
        carta_pdf: 'https://res.cloudinary.com/popaimagen/raw/upload/v1748097881/carta-terraza-chef.pdf',
        aprobacion: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'El Bodegón',
        descripcion: 'Tradicional bar de tapas y vinos con ambiente rústico y acogedor.',
        ubicacion: 'Carrera 10 #25-30, Centro Histórico',
        estado: true,
        categoriaid: 1, // Bar
        usuarioid: 3,   // Propietario
        fotos_lugar: JSON.stringify([
          'https://res.cloudinary.com/popaimagen/image/upload/v1748098000/lugar-5-1.jpg',
          'https://res.cloudinary.com/popaimagen/image/upload/v1748098000/lugar-5-2.jpg'
        ]),
        carta_pdf: 'https://res.cloudinary.com/popaimagen/raw/upload/v1748098000/carta-bodegon.pdf',
        aprobacion: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('lugares', null, {});
  }
};