"use strict";
const bcrypt = require("bcrypt");
const { Op } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Verificar si ya existen usuarios
      const userCount = await queryInterface.sequelize.query(
        'SELECT COUNT(*) as count FROM usuarios',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (userCount[0].count === 0) {
        // Crear roles si no existen
        const rolesToCreate = [
          { nombre: 'Super Administrador', estado: true },
          { nombre: 'Administrador', estado: true },
          { nombre: 'Propietario', estado: true }
        ];

        // Insertar roles si no existen
        for (const rol of rolesToCreate) {
          const [existingRole] = await queryInterface.sequelize.query(
            'SELECT id FROM rols WHERE nombre = :nombre',
            {
              replacements: { nombre: rol.nombre },
              type: queryInterface.sequelize.QueryTypes.SELECT
            }
          );

          if (!existingRole) {
            await queryInterface.bulkInsert('rols', [{
              ...rol,
              createdAt: new Date(),
              updatedAt: new Date()
            }]);
          }
        }

        // Obtener los roles
        const roles = await queryInterface.sequelize.query(
          `SELECT id, nombre FROM rols WHERE nombre IN (:roles) ORDER BY 
           CASE nombre 
             WHEN 'Super Administrador' THEN 1 
             WHEN 'Administrador' THEN 2 
             WHEN 'Propietario' THEN 3 
             WHEN 'Admin' THEN 4
             ELSE 5 
           END`,
          {
            replacements: { roles: ['Super Administrador', 'Administrador', 'Propietario', 'Admin'] },
            type: queryInterface.sequelize.QueryTypes.SELECT
          }
        );

        if (roles && roles.length >= 3) {
          const superAdminRol = roles.find(r => r.nombre === 'Super Administrador');
          const adminRol = roles.find(r => r.nombre === 'Administrador');
          const propietarioRol = roles.find(r => r.nombre === 'Propietario');
          const adminSimpleRol = roles.find(r => r.nombre === 'Admin');
          
          await queryInterface.bulkInsert('usuarios', [
            {
              nombre: "Super",
              apellido: "Admin",
              correo: "superadmin@example.com",
              fecha_nacimiento: new Date("1990-01-01"),
              contrasena: await bcrypt.hash("Super-123", 10),
              genero: "Masculino",
              estado: true,
              rolid: superAdminRol.id,
              imagen: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              nombre: "Admin",
              apellido: "Sistema",
              correo: "admin@example.com",
              fecha_nacimiento: new Date("1990-01-01"),
              contrasena: await bcrypt.hash("Admin-123", 10),
              genero: "Masculino",
              estado: true,
              rolid: adminRol.id,
              imagen: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              nombre: "Propietario",
              apellido: "Negocio",
              correo: "propietario@example.com",
              fecha_nacimiento: new Date("1990-01-01"),
              contrasena: await bcrypt.hash("Propietario-123", 10),
              genero: "Masculino",
              estado: true,
              rolid: propietarioRol.id,
              imagen: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              nombre: "Admin",
              apellido: "Simple",
              correo: "admin.simple@example.com",
              fecha_nacimiento: new Date("1990-01-01"),
              contrasena: await bcrypt.hash("AdminSimple-123", 10),
              genero: "Femenino",
              estado: true,
              rolid: adminSimpleRol.id,
              imagen: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          ], {});
        } else {
          console.log('No se encontraron todos los roles necesarios');
        }
      }
    } catch (error) {
      console.error('Error en el seeder de usuarios:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    // Eliminar solo los usuarios de prueba
    await queryInterface.bulkDelete('usuarios', {
      correo: {
        [Op.in]: [
          'superadmin@example.com',
          'admin@example.com',
          'propietario@example.com'
        ]
      }
    }, {});
  }
};
