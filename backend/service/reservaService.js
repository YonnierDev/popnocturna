const { Reserva, Usuario, Evento } = require("../models");

class ReservaService {
  async listarReservas() {
    return await Reserva.findAll({
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["id", "nombre", "correo"],
        },
        {
          model: Evento,
          as: "evento",
          attributes: ["id", "descripcion", "fecha_hora"],
        },
      ],
    });
  }

  
  async crearReserva(usuarioid, eventoid, fecha_hora, aprobacion, estado) {
    return await Reserva.create({usuarioid, eventoid, fecha_hora, aprobacion, estado});
  }

  async buscarReserva(id) {
    return await Reserva.findByPk(id);
  }

  async actualizarReserva(id, usuarioid, eventoid, fecha_hora, aprobacion, estado) {
    await Reserva.update({usuarioid, eventoid, fecha_hora, aprobacion, estado}, { where: { id } });
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
}

module.exports = new ReservaService();
