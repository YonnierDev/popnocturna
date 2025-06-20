"use strict";
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface, Sequelize) {
    // Obtener los roles por nombre
    const [superAdminRole] = await queryInterface.sequelize.query(
      'SELECT id FROM rols WHERE nombre = "Super Administrador" LIMIT 1',
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    const [adminRole] = await queryInterface.sequelize.query(
      'SELECT id FROM rols WHERE nombre = "Administrador" LIMIT 1',
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    const [propietarioRole] = await queryInterface.sequelize.query(
      'SELECT id FROM rols WHERE nombre = "Propietario" LIMIT 1',
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    const [usuarioRole] = await queryInterface.sequelize.query(
      'SELECT id FROM rols WHERE nombre = "Usuario" LIMIT 1',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Insertar usuarios básicos
    await queryInterface.bulkInsert('usuarios', [
      {
        nombre: "Super",
        apellido: "Admin",
        correo: "superadmin@gmail.com",
        fecha_nacimiento: new Date("1990-01-01"),
        contrasena: await bcrypt.hash("Super-123", 10),
        genero: "Masculino",
        estado: true,
        rolid: superAdminRole.id, // Super Administrador
        imagen: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: "Admin",
        apellido: "Sistema",
        correo: "admin@gamil.com",
        fecha_nacimiento: new Date("1990-01-01"),
        contrasena: await bcrypt.hash("Admin-123", 10),
        genero: "Masculino",
        estado: true,
        rolid: adminRole.id, // Administrador
        imagen: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: "Propietario",
        apellido: "Negocio",
        correo: "propietario@gmail.com",
        fecha_nacimiento: new Date("1990-01-01"),
        contrasena: await bcrypt.hash("Prop-123", 10),
        genero: "Masculino",
        estado: true,
        rolid: propietarioRole.id, // Propietario
        imagen: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: "Usuario",
        apellido: "Simple",
        correo: "usuario@gmail.com",
        fecha_nacimiento: new Date("1990-01-01"),
        contrasena: await bcrypt.hash("User-123", 10),
        genero: "Femenino",
        estado: true,
        rolid: usuarioRole.id, // Usuario
        imagen: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuarios', null, {});
  }
};
