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
      const { usuarioid, eventoid, fecha_hora, estado } = req.body;

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

      const nuevaReserva = await ReservaService.crearReserva({
        usuarioid,
        eventoid,
        fecha_hora,
        estado,
      });

      res.status(201).json(nuevaReserva);
    } catch (error) {
      console.error("Error detallado:", error);
      res.status(500).json({
        mensaje: "Error en el servicio",
        error: error.message,
        stack: error.stack,
      });
    }
  }

  async actualizarReserva(req, res) {
    try {
      const { id } = req.params;
      const { usuarioid, eventoid, fecha_hora, estado } = req.body;

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

      const reservaActualizada = await ReservaService.actualizarReserva(id, {
      usuarioid,
        eventoid,
        fecha_hora,
        estado,
      });

      res.json(reservaActualizada);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: "Error en el servicio" });
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