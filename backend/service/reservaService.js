const { Reserva, Usuario, Evento, Lugar } = require("../models");

class ReservaService {
  async listarReservas() {
    return await Reserva.findAll();
  }

  async crearReserva(datos) {
    return await Reserva.create(datos);
  }

  async buscarReserva(id) {
    return await Reserva.findByPk(id);
  }

  async actualizarReserva(id, datos) {
    await Reserva.update(datos, { where: { id } });
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

  async verificarLugar(lugarid) {
    return await Lugar.findByPk(lugarid);
  }
}

module.exports = new ReservaService();
