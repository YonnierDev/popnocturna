const { Lugar } = require("../models");
const CalificacionService = require("../service/calificacionService");
const {formatearRespuestaPaginada} = require("./paginacionController");

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

  // En calificacionController.js
async listarCalificaciones(req, res) {
  try {
    const { rol: rolid, id: usuarioid } = req.usuario;
    const { page = 1, limit = 10, eventoid } = req.query;

    let resultado;

    // Admins ven todo
    if (rolid === 1 || rolid === 2) {
      resultado = await CalificacionService.listarTodasLasCalificaciones({
        page: parseInt(page),
        limit: parseInt(limit)
      });
    } 
    // Usuarios normales ven solo sus calificaciones
    else if (rolid === 4) {
      resultado = await CalificacionService.listarMisCalificaciones(usuarioid, {
        page: parseInt(page),
        limit: parseInt(limit),
        eventoid  // Opcional: filtrar por evento
      });
    } 
    // Propietarios ven calificaciones de sus eventos
    else if (rolid === 3) {
      resultado = await CalificacionService.listarCalificacionesDeMisEventos(usuarioid, {
        page: parseInt(page),
        limit: parseInt(limit),
        eventoid  // Opcional: filtrar por evento
      });
    } 
    // Otros roles no permitidos
    else {
      return res.status(403).json({ 
        mensaje: "No tienes permiso para ver calificaciones" 
      });
    }

    res.json({
      total: resultado.count,
      pagina: parseInt(page),
      porPagina: parseInt(limit),
      calificaciones: resultado.rows
    });

  } catch (error) {
    console.error('Error al listar calificaciones:', error);
    res.status(500).json({ 
      mensaje: "Error al listar calificaciones",
      error: error.message 
    });
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
      const { eventoid, puntuacion } = req.body;

      // Validar que la puntuación esté entre 1 y 5
      if (puntuacion < 1 || puntuacion > 5) {
        return res.status(400).json({ error: "La puntuación debe estar entre 1 y 5" });
      }

      // Propietarios no pueden crear calificaciones
      if (rolid === 3) {
        return res.status(403).json({ error: "Los propietarios no pueden crear calificaciones" });
      }

      const nuevaCalificacion = await CalificacionService.crearCalificacion({
        usuarioid,
        eventoid,
        puntuacion,
        estado: true
      });

      // Obtener io para enviar notificaciones
      const io = req.app.get('io');

      // Obtener todos los usuarios que han calificado este evento
      const usuariosCalificaciones = await CalificacionService.obtenerUsuariosCalificacionesEvento(eventoid);

      // Notificar solo a los usuarios que han calificado el mismo evento
      usuariosCalificaciones.forEach(usuario => {
        if (usuario.id !== usuarioid) { // No notificar al usuario que hizo la calificación
          io.to(`usuario-${usuario.id}`).emit('nueva-calificacion-usuario', {
            evento: {
              id: eventoid,
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

      res.status(201).json(nuevaCalificacion);
    } catch (error) {
      console.error("Error al crear calificación:", error);
      res.status(500).json({ error: error.message });
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
      const { id } = req.params;
      const { rol: rolid, id: usuarioid } = req.usuario;
  
      if (!id) {
        return res.status(400).json({ 
          mensaje: "Error de validación",
          error: "ID de calificación no proporcionado" 
        });
      }
  
      let resultado;
      
      try {
        if (rolid === 1 || rolid === 2) {
          resultado = await CalificacionService.eliminarCalificacionAdmin(id);
        } else if (rolid === 4) {
          resultado = await CalificacionService.eliminarCalificacionUsuario(id, usuarioid);
        } else if (rolid === 3) {
          return res.status(403).json({ 
            mensaje: "Acceso denegado",
            error: "Los propietarios no pueden eliminar calificaciones"
          });
        } else {
          return res.status(403).json({ 
            mensaje: "Acceso denegado",
            error: "Rol no autorizado" 
          });
        }
  
        return res.status(200).json({
          mensaje: resultado.mensaje,
          eliminadaPreviamente: resultado.eliminadaPreviamente || false,
          timestamp: new Date()
        });
  
      } catch (error) {
        if (error.message.includes("no encontrada") || 
            error.message.includes("no existe")) {
          return res.status(404).json({ 
            mensaje: "Calificación no encontrada",
            error: error.message 
          });
        }
        throw error;
      }
  
    } catch (error) {
      console.error("Error en eliminarCalificacion:", error);
      return res.status(500).json({ 
        mensaje: "Error al procesar la solicitud",
        error: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
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
