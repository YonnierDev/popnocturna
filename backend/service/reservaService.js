const { Reserva, Usuario, Evento } = require("../models");

class ReservaService {
  async listarReservas() {
    return await Reserva.findAll({
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["nombre", "correo"],
        },
        {
          model: Evento,
          as: "evento",
          attributes: ["descripcion", "fecha_hora"],
        },
      ],
    });
  }

  async crearReserva(usuarioid, eventoid, fecha_hora, aprobacion, estado) {
    return await Reserva.create({ usuarioid, eventoid, fecha_hora, aprobacion, estado });
  }

  async buscarReserva(id) {
    return await Reserva.findByPk(id);
  }

  async actualizarReserva(id, usuarioid, eventoid, fecha_hora, aprobacion, estado) {
    await Reserva.update({ usuarioid, eventoid, fecha_hora, aprobacion, estado }, { where: { id } });
    return await this.buscarReserva(id);
  }

  async eliminarReserva(id) {
    return await Reserva.destroy({ where: { id } });
  }

  async verificarUsuario(usuarioid) {
    return await Usuario.findByPk(usuarioid);
  }

  async verificarEvento(eventoid) {
    return await Evento.findByPk(eventoid);
  }

  async actualizarEstado(id, estado) {
    return await Reserva.update({ estado }, { where: { id } });
  }

  async buscarPorId(id) {
    return await Reserva.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["nombre", "correo"],
        },
        {
          model: Evento,
          as: "evento",
          attributes: ["nombre", "descripcion", "fecha_hora"],
        },
      ],
    });
  }
  

  async listarRelaciones() {
    return await this.listarReservas();
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

  async actualizarAprobacion(id, aprobacion) {
    try {
      const reserva = await Reserva.findByPk(id);
      if (!reserva) return null;
  
      reserva.aprobacion = aprobacion;
      await reserva.save();
  
      return reserva;
    } catch (error) {
      throw new Error("Error al actualizar la reserva: " + error.message);
    }
  }
  
}

module.exports = new ReservaService();
