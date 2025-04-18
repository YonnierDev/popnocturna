const ReservaService = require("../service/reservaService");

class ReservaController {
  async listarReservas(req, res) {
    try {
      const reservas = await ReservaService.listarReservas();
      res.json(reservas);
    } catch (error) {
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }

  async actualizarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      await ReservaService.actualizarEstado(id, estado);
      res.json({ mensaje: "Estado actualizado correctamente" });
    } catch (error) {
      res.status(500).json({ mensaje: "Error al actualizar estado", error });
    }
  }

  async crearReserva(req, res) {
    try {
      const { usuarioid, eventoid, fecha_hora } = req.body;
      const aprobacion = "Pendiente";
      const estado = true;
      const usuarioExistente = await ReservaService.verificarUsuario(usuarioid);
      if (!usuarioExistente) {
        return res.status(400).json({ mensaje: "El usuario no existe" });
      }
      const eventoExistente = await ReservaService.verificarEvento(eventoid);
      if (!eventoExistente) {
        return res.status(400).json({ mensaje: "El evento no existe" });
      }
      const nuevaReserva = await ReservaService.crearReserva(
        usuarioid,
        eventoid,
        fecha_hora,
        aprobacion,
        estado
      );
      res.status(201).json(nuevaReserva);
    } catch (error) {
      res.status(500).json({ mensaje: "Error en el servicio", error: error.message });
    }
  }

  async actualizarReserva(req, res) {
    try {
      const { id } = req.params;
      const { usuarioid, eventoid, fecha_hora, aprobacion, estado } = req.body;
      const usuarioExistente = await ReservaService.verificarUsuario(usuarioid);
      if (!usuarioExistente) {
        return res.status(400).json({ mensaje: "El usuario no existe" });
      }
      const eventoExistente = await ReservaService.verificarEvento(eventoid);
      if (!eventoExistente) {
        return res.status(400).json({ mensaje: "El evento no existe" });
      }
      const reservaActualizada = await ReservaService.actualizarReserva(
        id,
        usuarioid,
        eventoid,
        fecha_hora,
        aprobacion,
        estado
      );
      res.json({ mensaje: "Reserva actualizada correctamente", reservaActualizada });
    } catch (error) {
      res.status(500).json({ mensaje: "Error al actualizar reserva", error: error.message });
    }
  }

  async listarRelaciones(req, res) {
    try {
      const reservas = await ReservaService.listarRelaciones();
      res.json(reservas);
    } catch (error) {
      res.status(500).json({ mensaje: "Error al listar reservas", error });
    }
  }

  async cambiarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      const actualizados = await ReservaService.actualizarEstado(id, estado);
      if (actualizados[0] === 0) {
        const existe = await ReservaService.buscarPorId(id);
        if (!existe) {
          return res.status(404).json({ mensaje: "Reserva no encontrada" });
        }
        return res.status(200).json({ mensaje: "El estado ya estaba igual", reserva: existe });
      }
      const reserva = await ReservaService.buscarPorId(id);
      res.json({ mensaje: "Estado actualizado", reserva });
    } catch (error) {
      res.status(500).json({ mensaje: "Error al actualizar estado", error });
    }
  }

  async eliminarReserva(req, res) {
    try {
      const { id } = req.params;
      const reserva = await ReservaService.buscarReserva(id);
      if (!reserva) {
        return res.status(404).json({ mensaje: "Reserva no encontrada" });
      }
      await ReservaService.eliminarReserva(id);
      res.json({ mensaje: "Reserva eliminada correctamente" });
    } catch (error) {
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }

  async buscarReserva(req, res) {
    try {
      const { id } = req.params;
      const reserva = await ReservaService.buscarPorId(id);
  
      if (!reserva) {
        return res.status(404).json({ mensaje: "Reserva no encontrada" });
      }
  
      // Estructuramos la respuesta
      const reservaResponse = {
        id: reserva.id,
        usuario: {
          nombre: reserva.usuario.nombre,
          correo: reserva.usuario.correo,
        },
        evento: {
          descripcion: reserva.evento.descripcion,
          fecha_hora: reserva.evento.fecha_hora,
        },
        estado: reserva.estado,
        fecha_hora: reserva.fecha_hora,
      };
  
      res.json(reservaResponse);
    } catch (error) {
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }

  async aprobarReserva(req, res) {
    try {
      const { id } = req.params;
      const { aprobacion } = req.body;
  
      if (!["aceptado", "rechazado", "pendiente"].includes(aprobacion)) {
        return res.status(400).json({ error: "Valor de aprobación inválido." });
      }
  
      const reserva = await ReservaService.actualizarAprobacion(id, aprobacion);
  
      if (!reserva) {
        return res.status(404).json({ error: "Reserva no encontrada." });
      }
  
      res.json({ mensaje: "Reserva actualizada correctamente", reserva });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
}

module.exports = new ReservaController();
