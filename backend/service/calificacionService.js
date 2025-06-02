const { Calificacion, Evento, Usuario, Lugar } = require("../models");
const { Op } = require('sequelize');

class CalificacionService {
  // Métodos para administradores (roles 1 y 2)
  async listarTodasLasCalificaciones({ page = 1, limit = 10 }) {
    try {
      const offset = (page - 1) * limit;
      return await Calificacion.findAndCountAll({
        include: [
          { 
            model: Usuario, 
            as: "usuario", 
            attributes: ["id", "nombre", "correo"] 
          },
          { 
            model: Evento, 
            as: "evento", 
            attributes: ["id", "nombre", "descripcion"] 
          }
        ],
        order: [["createdAt", "DESC"]],
        limit: parseInt(limit, 10),
        offset,
      });
    } catch (error) {
      console.error("Error al listar todas las calificaciones:", error);
      throw error;
    }
  }

  // Método para listar calificaciones de un evento (usuarios normales)
  async listarCalificacionesDeEvento(eventoid, { page = 1, limit = 10 }) {
    try {
      const offset = (page - 1) * limit;
      return await Calificacion.findAndCountAll({
        where: { eventoid },
        include: [
          { 
            model: Usuario, 
            as: "usuario", 
            attributes: ["id", "nombre"] 
          }
        ],
        order: [["createdAt", "DESC"]],
        limit: parseInt(limit, 10),
        offset,
      });
    } catch (error) {
      console.error("Error al listar calificaciones del evento:", error);
      throw error;
    }
  }

  // Método para propietarios - ver calificaciones de sus eventos
  async listarCalificacionesDeMisEventos(propietarioId, { page = 1, limit = 10, eventoid }) {
    try {
      const offset = (page - 1) * limit;
      const where = {};
      
      if (eventoid) {
        where.id = eventoid;
      }
  
      return await Calificacion.findAndCountAll({
        where: { estado: true }, // Solo calificaciones activas
        include: [
          {
            model: Evento,
            as: "evento",
            where: { 
              usuarioid: propietarioId,
              ...where
            },
            attributes: ["id", "nombre"]
          },
          {
            model: Usuario,
            as: "usuario",
            attributes: ["id", "nombre"]
          }
        ],
        order: [["createdAt", "DESC"]],
        limit: parseInt(limit, 10),
        offset,
      });
    } catch (error) {
      console.error("Error al listar calificaciones de mis eventos:", error);
      throw error;
    }
  }

  async listarMisCalificaciones(usuarioid, { page = 1, limit = 10, eventoid }) {
    try {
      const offset = (page - 1) * limit;
      const where = { usuarioid };
      
      if (eventoid) {
        where.eventoid = eventoid;
      }
  
      return await Calificacion.findAndCountAll({
        where,
        include: [
          {
            model: Evento,
            as: "evento",
            attributes: ["id", "nombre", "fecha_hora"]
          }
        ],
        order: [["createdAt", "DESC"]],
        limit: parseInt(limit, 10),
        offset,
      });
    } catch (error) {
      console.error("Error al listar mis calificaciones:", error);
      throw error;
    }
  }

  async verCalificacionAdmin(id) {
    try {
      const calificacion = await Calificacion.findByPk(id, {
        include: [
          { model: Usuario, as: "usuario", attributes: ["id", "nombre", "correo"] },
          {
            model: Evento,
            as: "evento",
            attributes: ["id", "nombre"],
            include: [
              { model: Lugar, as: "lugar", attributes: ["id", "nombre"] }
            ]
          }
        ],
      });

      if (!calificacion) {
        throw new Error("Calificación no encontrada");
      }

      return calificacion;
    } catch (error) {
      console.error("Error al ver calificación (admin):", error);
      throw error;
    }
  }

  async actualizarCalificacionAdmin(id, { puntuacion }) {
    try {
      console.log('=== Inicio actualizarCalificacionAdmin ===');
      console.log('Actualizando calificación:', { id, puntuacion });

      const calificacion = await Calificacion.findByPk(id);
      if (!calificacion) {
        console.log('Error: Calificación no encontrada');
        throw new Error("Calificación no encontrada");
      }

      await calificacion.update({ puntuacion });
      console.log('Calificación actualizada exitosamente');
      return calificacion;
    } catch (error) {
      console.error("Error al actualizar calificación (admin):", error);
      throw error;
    }
  }

  async eliminarCalificacionAdmin(id) {
    try {
      console.log('=== Inicio eliminarCalificacionAdmin ===');
      console.log('ID de calificación a eliminar (admin):', id);
  
      // Buscar la calificación incluyendo eliminadas
      const calificacion = await Calificacion.findOne({
        where: { id },
        paranoid: false // Incluye eliminadas
      });
  
      if (!calificacion) {
        console.log('❌ Error: Calificación no encontrada');
        throw new Error("Calificación no encontrada");
      }
  
      // Si ya está eliminada
      if (calificacion.deletedAt) {
        console.log('La calificación ya estaba eliminada');
        return { 
          mensaje: 'La calificación ya estaba eliminada',
          eliminadaPreviamente: true
        };
      }
  
      // Soft delete
      await calificacion.destroy();
      console.log('✅ Calificación desactivada exitosamente (admin)');
      
      return { 
        mensaje: 'Calificación desactivada correctamente',
        eliminadaPreviamente: false
      };
  
    } catch (error) {
      console.error("❌ Error en eliminarCalificacionAdmin:", error);
      throw error;
    }
  }

  // Métodos para propietarios (rol 3)
  async listarCalificacionesPorPropietario(usuarioid, { page = 1, limit = 10 }) {
    try {
      const offset = (page - 1) * limit;
      
      // Primero obtener los IDs de los lugares del propietario
      const lugares = await Lugar.findAll({
        where: { usuarioid },
        attributes: ['id']
      });

      const lugarIds = lugares.map(lugar => lugar.id);

      // Luego obtener las calificaciones de los eventos asociados a estos lugares
      const result = await Calificacion.findAndCountAll({
        include: [
          {
            model: Usuario,
            as: "usuario",
            attributes: ["nombre"],
          },
          {
            model: Evento,
            as: "evento",
            attributes: ["nombre"],
            where: {
              lugarid: {
                [Op.in]: lugarIds
              }
            },
            include: [
              {
                model: Lugar,
                as: "lugar",
                attributes: ["nombre"]
              }
            ]
          }
        ],
        order: [["createdAt", "DESC"]],
        limit: parseInt(limit, 10),
        offset,
      });
      return result;
    } catch (error) {
      console.error("Error al listar calificaciones (propietario):", error);
      throw error;
    }
  }

  async listarCalificacionesPorLugar(lugarid, { page = 1, limit = 10 }) {
    try {
      const offset = (page - 1) * limit;
      
      const result = await Calificacion.findAndCountAll({
        include: [
          {
            model: Usuario,
            as: "usuario",
            attributes: ["nombre"],
          },
          {
            model: Evento,
            as: "evento",
            attributes: ["nombre"],
            where: {
              lugarid
            },
            required: true,
            include: [{
              model: Lugar,
              as: "lugar",
              attributes: ["nombre"]
            }]
          }
        ],
        order: [["createdAt", "DESC"]],
        limit: parseInt(limit, 10),
        offset,
      });
      return result;
    } catch (error) {
      console.error("Error al listar calificaciones por lugar:", error);
      throw error;
    }
  }

  async verCalificacionPropietario(id, usuarioid) {
    try {
      console.log('=== Inicio verCalificacionPropietario ===');
      console.log('Buscando calificación con ID:', id);
      console.log('Para propietario con ID:', usuarioid);

      // Primero buscar la calificación sin restricciones
      const calificacion = await Calificacion.findByPk(id, {
        include: [
          {
            model: Usuario,
            as: "usuario",
            attributes: ["nombre", "correo"],
          },
          {
            model: Evento,
            as: "evento",
            attributes: ["id", "nombre", "usuarioid"],
            required: false,
            include: [
              { model: Lugar, as: "lugar", attributes: ["nombre"] }
            ]
          }
        ],
      });

      console.log('Calificación encontrada:', calificacion);
      console.log('Evento en calificación:', calificacion?.evento);
      console.log('Evento ID en calificación:', calificacion?.eventoid);

      if (!calificacion) {
        console.log('Error: Calificación no encontrada');
        throw new Error("Calificación no encontrada");
      }

      // Si el evento no viene en la inclusión, buscarlo por separado
      if (!calificacion.evento) {
        console.log('Evento no encontrado en la inclusión, buscando por separado...');
        const evento = await Evento.findByPk(calificacion.eventoid);
        console.log('Evento encontrado por separado:', evento);
        
        if (!evento) {
          console.log('Advertencia: El evento asociado a esta calificación no existe');
          // En lugar de lanzar error, devolvemos la calificación sin evento
          return {
            ...calificacion.toJSON(),
            evento: null,
            mensaje: "El evento asociado a esta calificación ya no existe"
          };
        }
        calificacion.evento = evento;
      }

      // Verificar si el evento pertenece al propietario
      console.log('Verificando propiedad del evento...');
      console.log('Evento usuarioid:', calificacion.evento?.usuarioid);
      console.log('Usuario ID:', usuarioid);

      if (calificacion.evento && calificacion.evento.usuarioid !== usuarioid) {
        console.log('Error: No tienes permisos para ver esta calificación');
        throw new Error("No tienes permisos para ver esta calificación");
      }

      console.log('=== Fin verCalificacionPropietario ===');
      return calificacion;
    } catch (error) {
      console.error("Error al ver calificación (propietario):", error);
      throw error;
    }
  }

  // Métodos para usuarios normales (rol 8)
  async listarCalificacionesPorUsuario(usuarioid, { page = 1, limit = 10, eventoid }) {
    try {
      if (!eventoid) {
        throw new Error("El parámetro eventoid es obligatorio para usuarios");
      }
      const offset = (page - 1) * limit;
      // Filtrar solo por evento y estado activo
      const whereClausula = { eventoid: parseInt(eventoid, 10), estado: true };
      const result = await Calificacion.findAndCountAll({
        where: whereClausula,
        include: [
          { model: Usuario, as: "usuario", attributes: ["id", "nombre", "correo"] },
          { model: Evento, as: "evento", attributes: ["id", "nombre", "descripcion"] },
        ],
        order: [["createdAt", "DESC"]],
        limit: parseInt(limit, 10),
        offset,
      });
      return result;
    } catch (error) {
      console.error("Error al listar calificaciones (usuario):", error);
      throw error;
    }
  }

  async verCalificacionUsuario(id, usuarioid) {
    try {
      console.log('=== Inicio verCalificacionUsuario ===');
      console.log('Buscando calificación con ID:', id);
      console.log('Para usuario con ID:', usuarioid);

      const calificacion = await Calificacion.findOne({
        where: { id, usuarioid, estado: true },
        include: [
          {
            model: Usuario,
            as: "usuario",
            attributes: ["id", "nombre", "correo"],
          },
          {
            model: Evento,
            as: "evento",
            attributes: ["id", "nombre"],
            include: [
              {
                model: Lugar,
                as: "lugar",
                attributes: ["id", "nombre"],
              },
            ],
          },
        ],
      });

      if (!calificacion) {
        console.log('Error: Calificación no encontrada o no pertenece al usuario');
        throw new Error("Calificación no encontrada o no tienes permisos para verla");
      }

      console.log('Calificación encontrada:', calificacion);
      return calificacion;
    } catch (error) {
      console.error("Error al ver calificación (usuario):", error);
      throw error;
    }
  }

  async actualizarCalificacionUsuario(id, usuarioid, { puntuacion }) {
    try {
      console.log('=== Inicio actualizarCalificacionUsuario ===');
      console.log('Verificando calificación del usuario:', { id, usuarioid });

      const calificacion = await Calificacion.findOne({
        where: { id, usuarioid },
        include: [
          {
            model: Usuario,
            as: "usuario",
            attributes: ["id", "nombre"],
          }
        ]
      });

      if (!calificacion) {
        console.log('Error: Calificación no encontrada o no pertenece al usuario');
        throw new Error("Calificación no encontrada o no tienes permisos para modificarla");
      }

      console.log('Calificación encontrada:', {
        id: calificacion.id,
        usuario: calificacion.usuario.nombre,
        puntuacionActual: calificacion.puntuacion,
        nuevaPuntuacion: puntuacion
      });

      await calificacion.update({ puntuacion });
      console.log('Calificación actualizada exitosamente');
      return calificacion;
    } catch (error) {
      console.error("Error al actualizar calificación (usuario):", error);
      throw error;
    }
  }

  async eliminarCalificacionUsuario(id, usuarioid) {
    try {
      console.log('=== Inicio eliminarCalificacionUsuario ===');
      console.log('Datos recibidos:', { id, usuarioid });
  
      // Verificar que el usuario no sea propietario (rol 3)
      const usuario = await Usuario.findByPk(usuarioid);
      if (!usuario) {
        throw new Error("Usuario no encontrado");
      }
  
      if (usuario.rolid === 3) {
        throw new Error("Los propietarios no pueden eliminar calificaciones");
      }
  
      // Buscar la calificación del usuario
      const calificacion = await Calificacion.findOne({
        where: { 
          id,
          usuarioid 
        },
        paranoid: false, // Incluye eliminadas
        include: [{
          model: Usuario,
          as: "usuario",
          attributes: ["id", "nombre", "rolid"],
        }]
      });
  
      if (!calificacion) {
        throw new Error("Calificación no encontrada o no tienes permisos para eliminarla");
      }
  
      // Verificar que no esté ya eliminada
      if (calificacion.deletedAt) {
        return { 
          mensaje: 'La calificación ya estaba eliminada',
          eliminadaPreviamente: true
        };
      }
  
      // Soft delete
      await calificacion.destroy();
      console.log('✅ Calificación desactivada exitosamente (usuario)');
      
      return { 
        mensaje: 'Tu calificación ha sido eliminada correctamente',
        eliminadaPreviamente: false
      };
  
    } catch (error) {
      console.error("❌ Error en eliminarCalificacionUsuario:", error);
      throw error;
    }
  }

  // Método para cambiar estado (solo administradores)
  async cambiarEstadoCalificacion(id, estado) {
    try {
      const calificacion = await Calificacion.findByPk(id);
      if (!calificacion) {
        throw new Error("Calificación no encontrada");
      }

      await calificacion.update({ estado });
      return calificacion;
    } catch (error) {
      console.error("Error al cambiar estado de la calificación:", error);
      throw error;
    }
  }

  // Método para crear calificaciones
  async crearCalificacion({ usuarioid, eventoid, puntuacion, estado }) {
    try {
      console.log('=== Inicio crearCalificacion ===');
      console.log('Datos recibidos:', { usuarioid, eventoid, puntuacion, estado });

      // Validar que la puntuación esté entre 1 y 5
      if (puntuacion < 1 || puntuacion > 5) {
        console.log('Error: La puntuación debe estar entre 1 y 5');
        throw new Error("La puntuación debe estar entre 1 y 5");
      }

      const usuario = await Usuario.findByPk(usuarioid);
      if (!usuario) {
        console.log('Error: Usuario no encontrado');
        throw new Error("Usuario no encontrado");
      }

      const evento = await Evento.findByPk(eventoid);
      if (!evento) {
        console.log('Error: Evento no encontrado');
        throw new Error("Evento no encontrado");
      }

      const calificacion = await Calificacion.create({
        usuarioid,
        eventoid,
        puntuacion,
        estado,
      });

      console.log('Calificación creada exitosamente:', calificacion);
      return calificacion;
    } catch (error) {
      console.error("Error al crear calificación:", error);
      throw error;
    }
  }
}

module.exports = new CalificacionService();
