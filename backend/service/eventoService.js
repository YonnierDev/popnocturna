const { Evento, Lugar, Comentario, Calificacion, Reserva, Usuario } = require("../models");

class EventoService {
  async listarEventos() {
    return await Evento.findAll({
      where: { estado: true },
      include: [
        {
          model: Lugar,
          as: "lugar",
          attributes: ["id", "nombre", "ubicacion"]
        },
        {
          model: Comentario,
          as: "comentarios",
          attributes: ["id", "contenido", "fecha_hora", "usuarioid"],
          include: [
            {
              model: Usuario,
              as: "usuario",
              attributes: ["id", "nombre", "apellido"]
            }
          ]
        },
        {
          model: Reserva,
          as: "reservas",
          attributes: ["id", "fecha_hora", "usuarioid"],
          include: [
            {
              model: Usuario,
              as: "usuario",
              attributes: ["id", "nombre", "apellido"]
            }
          ]
        },
        {
          model: Calificacion,
          as: "calificaciones",
          attributes: ["id", "puntuacion", "usuarioid"],
          include: [
            {
              model: Usuario,
              as: "usuario",
              attributes: ["id", "nombre", "apellido"]
            }
          ]
        }
      ]
    });
  }

  async crearEvento(data) {
    return await Evento.create(data);
  }

  async actualizarEvento(id, datosActualizados) {
    return await Evento.update(datosActualizados, { where: { id } });
  }

  async eliminarEvento(id) {
    return await Evento.destroy({ where: { id } });
  }

  async buscarEvento(id) {
    return await Evento.findOne({ where: { id } });
  }

  async verificarLugar(id) {
    return await Lugar.findByPk(id);
  }
  
  async actualizarEstado(id, estado) {
    return await Evento.update({ estado }, { where: { id } });
  }
  
}
module.exports = new EventoService();
