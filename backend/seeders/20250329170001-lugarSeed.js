'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Verificar si ya existen lugares
      const [results] = await queryInterface.sequelize.query(
        'SELECT COUNT(*) as count FROM lugares',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      // Verificar si ya hay datos
      if (results && results.count > 0) {
        console.log('Ya existen lugares en la base de datos, omitiendo seeder');
        return;
      }

      // Obtener un usuario propietario (usando el primer usuario disponible si no existe el de ejemplo)
      let [propietario] = await queryInterface.sequelize.query(
        'SELECT id FROM usuarios WHERE correo = ? LIMIT 1',
        {
          replacements: ['propietario@example.com'],
          type: queryInterface.sequelize.QueryTypes.SELECT,
          plain: true
        }
      );

      // Si no existe el usuario de ejemplo, obtener el primer usuario disponible
      if (!propietario) {
        [propietario] = await queryInterface.sequelize.query(
          'SELECT id FROM usuarios ORDER BY id LIMIT 1',
          { type: queryInterface.sequelize.QueryTypes.SELECT, plain: true }
        );
      }

      if (!propietario) {
        console.warn('No se encontró ningún usuario para asignar como propietario');
        return;
      }

      // Obtener categorías existentes
      const categorias = await queryInterface.sequelize.query(
        'SELECT id, LOWER(tipo) as tipo FROM categorias',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (!categorias || categorias.length === 0) {
        console.warn('No se encontraron categorías para asignar a los lugares');
        return;
      }

      // Mapear categorías por nombre para fácil acceso
      const categoriasMap = {};
      categorias.forEach(cat => {
        categoriasMap[cat.tipo.toLowerCase()] = cat.id;
      });

      // URLs de imágenes de ejemplo (puedes reemplazarlas con tus propias URLs)
      const imagenesEjemplo = {
        bar: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
        discoteca: 'https://images.unsplash.com/photo-1516450360452-1e9f3e6fa40d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        cancha: 'https://images.unsplash.com/photo-1574629810360-7efbbe195d86?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        restaurante: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        barberia: 'https://images.unsplash.com/photo-1585747860715-2ba90756f392?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
      };

      // Función para generar fotos adicionales basadas en una imagen principal
      const generarFotosAdicionales = (imagenPrincipal, cantidad = 2) => {
        const fotos = [imagenPrincipal];
        for (let i = 0; i < cantidad; i++) {
          // Simular variaciones de la misma imagen (en un caso real, serían imágenes diferentes)
          fotos.push(imagenPrincipal);
        }
        return fotos.join(',');
      };

      const lugares = [
        {
          categoriaid: categoriasMap['bar'] || categorias[0].id,
          usuarioid: propietario.id,
          nombre: 'El Rincón del Vino',
          descripcion: 'Bar acogedor con amplia selección de vinos y tapas',
          ubicacion: 'Calle del Vino 45, Ciudad',
          estado: true,
          imagen: imagenesEjemplo.bar,
          fotos_lugar: generarFotosAdicionales(imagenesEjemplo.bar, 3),
          carta_pdf: null,
          aprobacion: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          categoriaid: categoriasMap['discoteca'] || categorias[0].id,
          usuarioid: propietario.id,
          nombre: 'Pachá Night Club',
          descripcion: 'La mejor experiencia nocturna con DJs internacionales',
          ubicacion: 'Avenida Nocturna 202',
          estado: true,
          imagen: imagenesEjemplo.discoteca,
          fotos_lugar: generarFotosAdicionales(imagenesEjemplo.discoteca, 4),
          carta_pdf: null,
          aprobacion: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          categoriaid: categoriasMap['canchas sintéticas'] || categoriasMap['deportes'] || categorias[0].id,
          usuarioid: propietario.id,
          nombre: 'Fútbol Nocturno Premium',
          descripcion: 'Canchas sintéticas iluminadas para jugar de noche',
          ubicacion: 'Calle Deportiva 78',
          estado: true,
          imagen: imagenesEjemplo.cancha,
          fotos_lugar: generarFotosAdicionales(imagenesEjemplo.cancha, 2),
          carta_pdf: null,
          aprobacion: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          categoriaid: categoriasMap['restaurante'] || categorias[0].id,
          usuarioid: propietario.id,
          nombre: 'La Mesa de Oro',
          descripcion: 'Restaurante gourmet con especialidades locales e internacionales',
          ubicacion: 'Avenida Gourmet 123',
          estado: true,
          imagen: imagenesEjemplo.restaurante,
          fotos_lugar: generarFotosAdicionales(imagenesEjemplo.restaurante, 3),
          carta_pdf: 'https://ejemplo.com/cartas/la-mesa-de-oro.pdf',
          aprobacion: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          categoriaid: categoriasMap['barberia'] || categorias[0].id,
          usuarioid: propietario.id,
          nombre: 'Barbería Clásica',
          descripcion: 'Cortes clásicos y modernos con un toque de elegancia',
          ubicacion: 'Calle del Estilo 56',
          estado: true,
          imagen: imagenesEjemplo.barberia,
          fotos_lugar: generarFotosAdicionales(imagenesEjemplo.barberia, 2),
          carta_pdf: null,
          aprobacion: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      // Insertar los lugares en lotes para mejor rendimiento
      await queryInterface.bulkInsert('lugares', lugares, {});
      console.log(`Se insertaron ${lugares.length} lugares de ejemplo`);
      
    } catch (error) {
      console.error('Error en el seeder de lugares:', error);
      // No relanzar el error para no detener el proceso de migración
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Eliminar solo los lugares de ejemplo
      await queryInterface.bulkDelete('lugares', {
        nombre: {
          [Sequelize.Op.in]: [
            'El Rincón del Vino',
            'Pachá Night Club',
            'Fútbol Nocturno Premium',
            'La Mesa de Oro',
            'Barbería Clásica'
          ]
        }
      });
      console.log('Se eliminaron los lugares de ejemplo');
    } catch (error) {
      console.error('Error al eliminar lugares de ejemplo:', error);
      throw error;
    }
  }
};