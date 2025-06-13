const { Lugar, Evento, Reserva } = require("../models");
const { Op } = require('sequelize');
const CalificacionService = require("../service/calificacionService");
const { formatearRespuestaPaginada } = require("./paginacionController");

class CalificacionController {
  async listarCalificacionesPorLugar(req, res) {
    try {
      const { rol: rolid, id: usuarioid } = req.usuario;
      const { lugarid } = req.params;
      const { page = 1, limit = 10 } = req.query;

      // Verificar que el usuario es propietario
      if (rolid !== 3) {
        return res.status(403).json({ mensaje: "Solo los propietarios pueden ver las calificaciones de sus lugares" });
      }

      // Verificar que el lugar pertenece al propietario
      const lugar = await Lugar.findOne({
        where: {
          id: lugarid,
          usuarioid
        }
      });

      if (!lugar) {
        return res.status(404).json({ mensaje: "El lugar no existe o no pertenece al propietario" });
      }

      const resultado = await CalificacionService.listarCalificacionesPorLugar(lugarid, { page, limit });

      res.json({
        mensaje: "Calificaciones obtenidas correctamente",
        datos: formatearRespuestaPaginada({
          total: resultado.count,
          rows: resultado.rows,
          page,
          limit,
          nombreColeccion: 'calificaciones'
        })
      });
    } catch (error) {
      console.error("Error al listar calificaciones por lugar:", error);
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }
  async listarCalificaciones(req, res) {
    try {
      console.log('\n=== Inicio listarCalificaciones ===');
      console.log('Usuario autenticado:', req.usuario);
      
      const { rol: rolid, id: usuarioid } = req.usuario;
      const { page = 1, limit = 10, eventoid } = req.query;

      console.log('Parámetros recibidos:', {
        rolid,
        page,
        limit,
        eventoid
      });

      let resultado;

      // Roles: 1=SuperAdmin, 2=Admin, 3=Propietario, 4=Usuario Normal
      if (rolid === 1) {
        console.log('Acceso como Super Admin');
        resultado = await CalificacionService.listarCalificacionesAdmin({ page, limit });
      } else if (rolid === 2) {
        console.log('Acceso como Admin');
        resultado = await CalificacionService.listarCalificacionesAdmin({ page, limit });
      } else if (rolid === 3) {
        console.log('Acceso como Propietario');
        resultado = await CalificacionService.listarCalificacionesPorPropietario(usuarioid, { page, limit });
      } else if (rolid === 4) {
        console.log('Acceso como Usuario Normal');
        // Validar que el query param eventoid esté presente
        if (!eventoid) {
          console.log('Error: Parámetro eventoid faltante');
          return res.status(400).json({ mensaje: "El parámetro eventoid es obligatorio para ver calificaciones." });
        }
        console.log('Filtrando calificaciones por eventoid:', eventoid);
        resultado = await CalificacionService.listarCalificacionesPorUsuario(usuarioid, { page, limit, eventoid });
      } else {
        console.log('Acceso denegado - Rol no permitido:', rolid);
        return res.status(403).json({ mensaje: "No tienes permiso para ver calificaciones" });
      }
      console.log('Resultado listarCalificaciones:', resultado);

      // Formatear paginación en el controller según rol
      res.json({
        mensaje: "Calificaciones obtenidas correctamente",
        datos: formatearRespuestaPaginada({
          total: resultado.count,
          rows: resultado.rows,
          page,
          limit,
          nombreColeccion: 'calificaciones'
        })
      });
    } catch (error) {
      console.error("Error al listar calificaciones:", error);
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }

  async verCalificacion(req, res) {
    try {
      console.log('=== Inicio verCalificacion ===');
      const { id } = req.params;
      const { rol: rolid, id: usuarioid } = req.usuario;

      console.log('Datos recibidos:', { id, rolid, usuarioid });

      let calificacion;
      if (rolid === 1) {
        console.log('Ver calificación como Super Admin');
        calificacion = await CalificacionService.verCalificacionAdmin(id);
      } else if (rolid === 2) {
        console.log('Ver calificación como Admin');
        calificacion = await CalificacionService.verCalificacionAdmin(id);
      } else if (rolid === 3) {
        console.log('Ver calificación como Propietario');
        calificacion = await CalificacionService.verCalificacionPropietario(id, usuarioid);
      } else if (rolid === 4) {
        console.log('Ver calificación como Usuario Normal');
        calificacion = await CalificacionService.verCalificacionUsuario(id, usuarioid);
      } else {
        console.log('Error: Rol no autorizado:', rolid);
        return res.status(403).json({ error: "No tienes permisos para ver esta calificación" });
      }
      console.log('Calificación obtenida:', calificacion);
      const calificacionData = calificacion.toJSON();
      calificacionData.nombreEvento = calificacion.evento?.nombre || null;
      res.json(calificacionData);
    } catch (error) {
      console.error("Error al ver calificación:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async crearCalificacion(req, res) {
    try {
      const { rol: rolid, id: usuarioid } = req.usuario;
      const { puntuacion } = req.body;

      // Validar que la puntuación esté entre 1 y 5
      if (!puntuacion || puntuacion < 1 || puntuacion > 5) {
        return res.status(400).json({ error: "La puntuación es obligatoria y debe estar entre 1 y 5" });
      }

      // Propietarios no pueden crear calificaciones
      if (rolid === 3) {
        return res.status(403).json({ error: "Los propietarios no pueden crear calificaciones" });
      }

      // Verificar que se proporcione un eventoid
      if (!req.body.eventoid) {
        return res.status(400).json({ 
          error: "Se requiere el ID del evento (eventoid) para crear una calificación" 
        });
      }
      
      const eventoidFinal = req.body.eventoid;
      
      // Verificar que el evento exista
      const evento = await Evento.findByPk(eventoidFinal);
      if (!evento) {
        return res.status(404).json({ error: "El evento especificado no existe" });
      }

      // Intentar crear la calificación
      const nuevaCalificacion = await CalificacionService.crearCalificacion({
        usuarioid,
        eventoid: eventoidFinal,
        puntuacion,
        estado: true
      });

      // Obtener io para enviar notificaciones
      const io = req.app.get('io');

      // Obtener todos los usuarios que han calificado este evento
      const usuariosCalificaciones = await CalificacionService.obtenerUsuariosCalificacionesEvento(eventoidFinal);

      // Notificar solo a los usuarios que han calificado el mismo evento
      if (io) {
        usuariosCalificaciones.forEach(usuario => {
          if (usuario.id !== usuarioid) { // No notificar al usuario que hizo la calificación
            io.to(`usuario-${usuario.id}`).emit('nueva-calificacion-usuario', {
              evento: {
                id: eventoidFinal,
                nombre: nuevaCalificacion.evento?.nombre || 'Evento'
              },
              calificacion: {
                puntuacion: nuevaCalificacion.puntuacion,
                usuarioid: nuevaCalificacion.usuarioid
              },
              timestamp: new Date().toISOString()
            });
          }
        });
      }

      return res.status(201).json({
        mensaje: 'Calificación creada exitosamente',
        calificacion: nuevaCalificacion
      });
    } catch (error) {
      console.error('Error en crearCalificacion:', error);
      
      // Manejar el caso específico de calificación duplicada
      if (error.message === 'Ya has calificado este evento') {
        return res.status(400).json({ 
          error: 'Ya has calificado este evento anteriormente' 
        });
      }
      
      // Para otros errores
      return res.status(400).json({ 
        error: error.message || 'Error al crear la calificación' 
      });
    }
  }

  async actualizarCalificacion(req, res) {
    try {
      console.log('=== Inicio actualizarCalificacion ===');
      const { id } = req.params;
      const { rol: rolid, id: usuarioid } = req.usuario;
      const { puntuacion } = req.body;

      console.log('Datos recibidos:', { 
        id, 
        rol: rolid === 1 ? 'Super Admin' : 
             rolid === 2 ? 'Admin' : 
             rolid === 3 ? 'Propietario' : 'Usuario Normal',
        usuarioid, 
        puntuacion 
      });

      // Validar que la puntuación esté entre 1 y 5
      if (puntuacion < 1 || puntuacion > 5) {
        console.log('Error: La puntuación debe estar entre 1 y 5');
        return res.status(400).json({ error: "La puntuación debe estar entre 1 y 5" });
      }

      // Propietarios no pueden actualizar calificaciones
      if (rolid === 3) {
        console.log('Error: Los propietarios no pueden actualizar calificaciones');
        return res.status(403).json({ error: "Los propietarios no pueden actualizar calificaciones" });
      }

      let calificacionActualizada;
      if (rolid === 1 || rolid === 2) {
        console.log('Actualizando como administrador - Puede modificar cualquier calificación');
        calificacionActualizada = await CalificacionService.actualizarCalificacionAdmin(id, { puntuacion });
      } else {
        console.log('Actualizando como usuario normal - Solo puede modificar sus propias calificaciones');
        calificacionActualizada = await CalificacionService.actualizarCalificacionUsuario(id, usuarioid, { puntuacion });
      }

      if (!calificacionActualizada) {
        console.log('Error: Calificación no encontrada o no tienes permisos');
        return res.status(404).json({ error: "Calificación no encontrada o no tienes permisos para modificarla" });
      }

      console.log('Calificación actualizada exitosamente');
      res.json(calificacionActualizada);
    } catch (error) {
      console.error("Error al actualizar calificación:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async eliminarCalificacion(req, res) {
    try {
      console.log('=== Inicio eliminarCalificacion ===');
      const { id } = req.params;
      const { rol: rolid, id: usuarioid } = req.usuario;

      console.log('Datos completos del usuario:', req.usuario);
      console.log('Rol del usuario:', rolid);

      // Verificación del rol 3
      if (rolid === 3) {
        console.log('❌ BLOQUEO: Usuario es propietario (rol 3) - No puede eliminar calificaciones');
        return res.status(403).json({ 
          error: "Los propietarios no tienen permiso para eliminar calificaciones",
          rol: rolid
        });
      }

      console.log('✅ Usuario autorizado para eliminar. Rol:', rolid);

      // Solo permitir a roles 1, 2 y 4
      if (rolid === 1 || rolid === 2) {
        console.log('🔄 Eliminando como administrador');
        await CalificacionService.eliminarCalificacionAdmin(id);
      } else if (rolid === 4) {
        console.log('🔄 Eliminando como usuario normal');
        await CalificacionService.eliminarCalificacionUsuario(id, usuarioid);
      } else {
        console.log('❌ Rol no autorizado:', rolid);
        return res.status(403).json({ error: "No tienes permiso para eliminar calificaciones" });
      }

      console.log('✅ Calificación eliminada exitosamente');
      res.json({ mensaje: "Calificación eliminada correctamente" });
    } catch (error) {
      console.error("❌ Error al eliminar calificación:", error);
      if (error.message.includes("no tienes permisos")) {
        return res.status(403).json({ error: error.message });
      }
      if (error.message.includes("no encontrada")) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async cambiarEstadoCalificacion(req, res) {
    try {
      const { id } = req.params;
      const { rol: rolid } = req.usuario;
      const { estado } = req.body;

      console.log('\n=== Inicio cambiarEstadoCalificacion ===');
      console.log('ID de la calificación:', id);
      console.log('Rol del usuario:', rolid);

      // Solo administradores pueden cambiar el estado
      if (rolid !== 1 && rolid !== 2) {
        return res.status(403).json({ mensaje: "Solo los administradores pueden cambiar el estado de las calificaciones" });
      }

      const calificacion = await CalificacionService.cambiarEstadoCalificacion(id, estado);
      if (!calificacion) {
        return res.status(404).json({ mensaje: "Calificación no encontrada" });
      }

      res.json({
        mensaje: "Estado de la calificación actualizado correctamente",
        datos: calificacion
      });
    } catch (error) {
      console.error("Error al cambiar estado de la calificación:", error);
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }
}

module.exports = new CalificacionController();
