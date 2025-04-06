const ReservaService = require("../service/reservaService");

class ReservaController {
  async listarReservas(req, res) {
    try {
      const reservas = await ReservaService.listarReservas();
      res.json(reservas);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }

  async crearReserva(req, res) {
    try {
      const { usuarioid, eventoid, fecha_hora } = req.body;
      const aprobacion = "Pendiente";
      const estado = true;

      // Verificar si el usuario existe
      const usuarioExistente = await ReservaService.verificarUsuario(usuarioid);
      if (!usuarioExistente) {
        return res.status(400).json({ mensaje: "El usuario no existe" });
      }

      // Verificar si el evento existe
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
      console.error("Error al crear reserva:", error);
      res
        .status(500)
        .json({ mensaje: "Error en el servicio", error: error.message });
    }
  }

  async actualizarReserva(req, res) {
    try {
      const { id } = req.params;
      const { usuarioid, eventoid, fecha_hora, aprobacion, estado } = req.body;

      // Verificar si el usuario existe
      const usuarioExistente = await ReservaService.verificarUsuario(usuarioid);
      if (!usuarioExistente) {
        return res.status(400).json({ mensaje: "El usuario no existe" });
      }

      // Verificar si el evento existe
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

      res.json({ mensaje: "Reserva actualizado correctamente",reservaActualizada });
    } catch (error) {
      res
        .status(500)
        .json({ mensaje: "Error al actualizar reserva", error: error.message });
    }
  }

  async eliminarReserva(req, res) {
    try {
      const { id } = req.params;

      // Verificar si la reserva existe
      const reserva = await ReservaService.buscarReserva(id);
      if (!reserva) {
        return res.status(404).json({ mensaje: "Reserva no encontrada" });
      }

      await ReservaService.eliminarReserva(id);
      res.json({ mensaje: "Reserva eliminada correctamente" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }

  async buscarReserva(req, res) {
    try {
      const { id } = req.params;
      const reserva = await ReservaService.buscarReserva(id);

      if (!reserva) {
        return res.status(404).json({ mensaje: "Reserva no encontrada" });
      }

      res.json(reserva);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }
}

module.exports = new ReservaController();
