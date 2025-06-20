'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Insertar calificaciones de ejemplo para el usuario con ID 4
    await queryInterface.bulkInsert('calificaciones', [
      {
        usuarioid: 4, // Usuario con rol Usuario
        eventoid: 1,   // Asumiendo que existe un evento con ID 1
        puntuacion: 5, // Máxima puntuación
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        usuarioid: 4, // Usuario con rol Usuario
        eventoid: 2,   // Asumiendo que existe un evento con ID 2
        puntuacion: 4, // Buena puntuación
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        usuarioid: 4, // Usuario con rol Usuario
        eventoid: 3,   // Asumiendo que existe un evento con ID 3
        puntuacion: 3, // Puntuación media
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    // Eliminar todas las calificaciones
    await queryInterface.bulkDelete('calificaciones', null, {});
  }
};