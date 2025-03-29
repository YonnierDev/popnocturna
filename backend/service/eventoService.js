const { Evento, Lugar, Comentario } = require("../models");

class EventoService {
  async listarEventos() {
    return await Evento.findAll();
  }

  async crearEvento(nombre) {
    return await Evento.create({ nombre });
  }

  async buscarEvento(id) {
    return await Evento.findByPk(id);
  }

  async actualizarEvento(id, datos) {
    await Evento.update(datos, { where: { id } });
    return await this.buscarEvento(id);
  }

  async eliminarEvento(id) {
    return await Evento.destroy({ where: { id } });
  }

  async verificarLugar(lugarid) {
    return await Lugar.findByPk(lugarid);
  }

  async verificarComentario(comentarioid) {
    return await Comentario.findByPk(comentarioid);
  }
}

module.exports = new EventoService();
