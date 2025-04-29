const CalificacionService = require("../service/calificacionService");
const {formatearRespuestaPaginada} = require("./paginacionController");

class CalificacionController {
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

      // Roles: 1=SuperAdmin, 2=Admin, 3=Propietario, 8=Usuario Normal
      if (rolid === 1) {
        console.log('Acceso como Super Admin');
        resultado = await CalificacionService.listarCalificacionesAdmin({ page, limit });
      } else if (rolid === 2) {
        console.log('Acceso como Admin');
        resultado = await CalificacionService.listarCalificacionesAdmin({ page, limit });
      } else if (rolid === 3) {
        console.log('Acceso como Propietario');
        resultado = await CalificacionService.listarCalificacionesPorPropietario(usuarioid, { page, limit });
      } else if (rolid === 8) {
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
      } else if (rolid === 8) {
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
      console.log('=== Inicio crearCalificacion ===');
      const { rol: rolid, id: usuarioid } = req.usuario;
      const { eventoid, puntuacion } = req.body;

      console.log('Datos recibidos:', { rolid, usuarioid, eventoid, puntuacion });

      // Validar que la puntuación esté entre 1 y 5
      if (puntuacion < 1 || puntuacion > 5) {
        console.log('Error: La puntuación debe estar entre 1 y 5');
        return res.status(400).json({ error: "La puntuación debe estar entre 1 y 5" });
      }

      // Propietarios no pueden crear calificaciones
      if (rolid === 3) {
        console.log('Error: Los propietarios no pueden crear calificaciones');
        return res.status(403).json({ error: "Los propietarios no pueden crear calificaciones" });
      }

      const nuevaCalificacion = await CalificacionService.crearCalificacion({
        usuarioid,
        eventoid,
        puntuacion,
        estado: true
      });

      console.log('Calificación creada exitosamente');
      // Emitir socket al crear nueva calificación
      const io = req.app.get('io');
      io.emit('nueva-calificacion', nuevaCalificacion);
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

      // Solo permitir a roles 1, 2 y 8
      if (rolid === 1 || rolid === 2) {
        console.log('🔄 Eliminando como administrador');
        await CalificacionService.eliminarCalificacionAdmin(id);
      } else if (rolid === 8) {
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
