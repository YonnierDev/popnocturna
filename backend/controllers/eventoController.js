const eventoService = require("../service/eventoService");

class EventoController {
  async listarEventos(req, res) {
    try {
      console.log('\n=== Inicio listarEventos ===');
      console.log('Usuario autenticado:', req.usuario);

      const { rol: rolid } = req.usuario;
      const { page = 1, limit = 10, fechaDesde, fechaHasta } = req.query;

      console.log('Parámetros recibidos:', {
        rolid,
        page,
        limit,
        fechaDesde,
        fechaHasta
      });

      const opciones = {
        offset: (page - 1) * limit,
        limit: parseInt(limit),
        fechaDesde,
        fechaHasta,
      };

      let eventos;
      console.log('Opciones de consulta:', opciones);

      // Si es admin o super admin (roles 1 y 2), ver toda la información sin restricciones
      if (rolid === 1 || rolid === 2) {
        console.log('Acceso como administrador (rol:', rolid, ')');
        eventos = await eventoService.listarEventosAdmin(opciones);
      }
      // Si es propietario (rol 3), ver solo eventos activos de sus lugares
      else if (rolid === 3) {
        console.log('Acceso como propietario');
        const { id: usuarioid } = req.usuario;
        eventos = await eventoService.listarEventosPorPropietario(usuarioid, opciones);
      }
      // Si es usuario normal (rol 4), ver solo eventos activos
      else if (rolid === 4) {
        console.log('Acceso como usuario normal');
        const { id: usuarioid } = req.usuario;
        eventos = await eventoService.listarEventosPorUsuario(usuarioid, opciones);
      }
      else {
        console.log('Acceso denegado - Rol no permitido:', rolid);
        return res.status(403).json({ mensaje: "No tienes permiso para ver eventos" });
      }

      console.log('Eventos encontrados:', eventos?.length || 0);
      res.json({
        mensaje: "Eventos obtenidos correctamente",
        datos: eventos
      });
    } catch (error) {
      console.error("Error al listar eventos:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }

  async verEvento(req, res) {
    try {
      const { id } = req.params;
      const { rol: rolid } = req.usuario;

      let evento;

      // Si es admin o super admin, ver toda la información
      if (rolid === 1 || rolid === 2) {
        evento = await eventoService.verEventoAdmin(id);
      } else {
        // Para otros roles, usar la lógica existente
        const { id: usuarioid } = req.usuario;
        if (rolid === 3) {
          evento = await eventoService.verEventoPropietario(id, usuarioid);
        } else if (rolid === 4) {
          evento = await eventoService.verEventoUsuario(id, usuarioid);
        } else {
          return res.status(403).json({ mensaje: "No tienes permiso para ver este evento" });
        }
      }

      if (!evento) {
        return res.status(404).json({ mensaje: "Evento no encontrado" });
      }

      res.json({
        mensaje: "Evento obtenido correctamente",
        datos: evento
      });
    } catch (error) {
      console.error("Error al ver evento:", error);
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }

  async crearEvento(req, res) {
    try {
      const { rol: rolid, id: usuarioid } = req.usuario;
      const datosEvento = req.body;

      let nuevoEvento;

      if (rolid === 1 || rolid === 2) {
        nuevoEvento = await eventoService.crearEventoAdmin(datosEvento, usuarioid);
      } else if (rolid === 3) {
        nuevoEvento = await eventoService.crearEventoPropietario(datosEvento, usuarioid);
      } else {
        return res.status(403).json({ mensaje: "No tienes permiso para crear eventos" });
      }

      // Obtener io para enviar notificaciones
      const io = req.app.get('io');

      // Notificar a administradores (roles 1 y 2)
      io.to('admin-room').emit('nuevo-evento-admin', {
        propietario: req.usuario.correo,
        evento: nuevoEvento,
        timestamp: new Date().toISOString(),
        mensaje: `Nuevo evento creado por ${req.usuario.correo}`
      });

      // Notificar a usuarios (rol 4)
      io.to('usuario-room').emit('nuevo-evento-usuario', {
        evento: nuevoEvento,
        timestamp: new Date().toISOString(),
        mensaje: `Nuevo evento disponible: ${nuevoEvento.nombre}`
      });

      res.status(201).json({
        mensaje: "Evento creado correctamente",
        datos: nuevoEvento
      });
    } catch (error) {
      console.error("Error al crear evento:", error);
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }

  async actualizarEvento(req, res) {
    try {
      const { id } = req.params;
      const { rol: rolid, id: usuarioid } = req.usuario;
      const datosEvento = req.body;

      console.log('\n=== Inicio actualizarEvento ===');
      console.log('ID del evento:', id);
      console.log('ID del usuario:', usuarioid);
      console.log('Rol del usuario:', rolid);
      console.log('Datos a actualizar:', datosEvento);

      let eventoActualizado;

      if (rolid === 1 || rolid === 2) {
        eventoActualizado = await eventoService.actualizarEventoAdmin(id, datosEvento);
      } else if (rolid === 3) {
        eventoActualizado = await eventoService.actualizarEventoPropietario(id, datosEvento, usuarioid);
      } else {
        return res.status(403).json({ mensaje: "No tienes permiso para actualizar eventos" });
      }

      if (!eventoActualizado) {
        return res.status(404).json({ mensaje: "Evento no encontrado o no tienes permisos para modificarlo" });
      }

      res.json({
        mensaje: "Evento actualizado correctamente",
        datos: eventoActualizado
      });
    } catch (error) {
      console.error("Error al actualizar evento:", error);
      if (error.message.includes("no tienes permisos")) {
        return res.status(403).json({ mensaje: error.message });
      }
      if (error.message.includes("no encontrado")) {
        return res.status(404).json({ mensaje: error.message });
      }
      res.status(500).json({ mensaje: "Error en el servicio", error: error.message });
    }
  }

  async eliminarEvento(req, res) {
    try {
      const { id } = req.params;
      const { rol: rolid, id: usuarioid } = req.usuario;

      if (rolid === 1 || rolid === 2) {
        await eventoService.eliminarEventoAdmin(id);
      }
      else if (rolid === 3) {
        await eventoService.eliminarEventoPropietario(id, usuarioid);
      }
      else {
        return res.status(403).json({ mensaje: "No tienes permiso para eliminar eventos" });
      }

      res.json({ mensaje: "Evento eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar evento:", error);
      if (error.message.includes("no tienes permisos")) {
        return res.status(403).json({ mensaje: error.message });
      }
      if (error.message.includes("no encontrado")) {
        return res.status(404).json({ mensaje: error.message });
      }
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }

  async verComentarios(req, res) {
    try {
      const { eventoId } = req.params;
      const { rol: rolid, id: usuarioid } = req.usuario;

      let comentarios;

      if (rolid === 1 || rolid === 2) {
        comentarios = await eventoService.verComentariosAdmin(eventoId);
      } else if (rolid === 3) {
        comentarios = await eventoService.verComentariosPropietario(eventoId, usuarioid);
      } else if (rolid === 4) {
        comentarios = await eventoService.verComentariosUsuario(eventoId, usuarioid);
      } else {
        return res.status(403).json({ mensaje: "No tienes permiso para ver comentarios" });
      }

      res.json({
        mensaje: "Comentarios obtenidos correctamente",
        datos: comentarios
      });
    } catch (error) {
      console.error("Error al ver comentarios:", error);
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }

  async cambiarEstadoEvento(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      const { rol: rolid, id: usuarioid } = req.usuario;

      let eventoActualizado;

      if (rolid === 1 || rolid === 2) {
        eventoActualizado = await eventoService.cambiarEstadoEventoAdmin(id, estado);
      }else {
        return res.status(403).json({ mensaje: "No tienes permiso para cambiar el estado del evento" });
      }

      res.json({
        mensaje: "Estado del evento actualizado correctamente",
        datos: eventoActualizado
      });
    } catch (error) {
      console.error("Error al cambiar estado del evento:", error);
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }

  async listarEventosPublicos(req, res) {
    try {
      const { page = 1, limit = 10, estado, fechaDesde, fechaHasta } = req.query;

      const opciones = {
        offset: (page - 1) * limit,
        limit: parseInt(limit),
        estado: true, // Solo mostrar eventos activos
        fechaDesde,
        fechaHasta,
      };

      const eventos = await eventoService.listarEventosPublicos(opciones);

      res.json({
        mensaje: "Eventos públicos obtenidos correctamente",
        datos: eventos
      });
    } catch (error) {
      console.error("Error al listar eventos públicos:", error);
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }

  async verEventoPublico(req, res) {
    try {
      const { id } = req.params;
      const evento = await eventoService.verEventoPublico(id);

      if (!evento) {
        return res.status(404).json({ mensaje: "Evento no encontrado" });
      }

      res.json({
        mensaje: "Evento público obtenido correctamente",
        datos: evento
      });
    } catch (error) {
      console.error("Error al ver evento público:", error);
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }
}

module.exports = new EventoController();
