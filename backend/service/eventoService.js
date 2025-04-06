const { Evento, Lugar, Comentario } = require("../models");

class EventoService {
  async listarEventos() {
    return await Evento.findAll({
      include: [
        {
          model: Lugar,
          as: "lugar",
          attributes: ["id", "nombre"],
        },
        {
          model: Comentario,
          as: "comentarios",
          attributes: ["id", "contenido"],
        },
      ],
    });
  }

  async crearEvento(lugarid, capacidad, precio, descripcion, fecha_hora, estado) {
    return await Evento.create({ lugarid, capacidad, precio, descripcion, fecha_hora, estado });
  }

  async buscarEvento(id) {
    return await Evento.findByPk(id, {
      include: [
        { model: Lugar, as: "lugar", attributes: ["id", "nombre"] },
        { model: Comentario, as: "comentarios", attributes: ["id", "contenido"] },
      ]
    });
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
}

module.exports = new EventoService();
