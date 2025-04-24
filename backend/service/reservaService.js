const { Comentario, Usuario, Evento, Lugar } = require("../models");

class ComentarioService {
  async crearComentario({ usuarioid, eventoid, contenido, fecha_hora }) {
    return await Comentario.create({ usuarioid, eventoid, contenido, fecha_hora });
  }

  async actualizarComentario(id, contenido) {
    await Comentario.update({ contenido }, { where: { id } });
    return await Comentario.findByPk(id);
  }

  async eliminarComentario(id) {
    return await Comentario.destroy({ where: { id } });
  }

  async actualizarEstado(id, estado) {
    await Comentario.update({ estado }, { where: { id } });
    return await Comentario.findByPk(id);
  }

  async obtenerComentariosAdmin() {
    return await Comentario.findAll({
      include: [
        { model: Usuario, as: "usuario", attributes: ["nombre", "correo"] },
        { model: Evento, as: "evento", attributes: ["nombre"] },
      ],
    });
  }

  async obtenerComentariosPorUsuario(usuarioid) {
    return await Comentario.findAll({
      where: { usuarioid },
      include: [{ model: Evento, as: "evento", attributes: ["nombre"] }],
    });
  }

  async obtenerComentariosPorPropietario(usuarioid) {
    return await Comentario.findAll({
      include: [
        {
          model: Evento,
          as: "evento",
          required: true,
          attributes: ["id", "nombre", "descripcion", "fecha_hora", "estado", "capacidad", "precio", "lugarid"],
          include: [
            {
              model: Lugar,
              as: "lugar",
              required: true,
              attributes: ["id", "nombre", "usuarioid", "ubicacion", "descripcion", "estado"],
              where: { usuarioid }
            }
          ]
        },
        {
          model: Usuario,
          as: "usuario",
          attributes: ["id", "nombre", "correo"],
        },
      ],
      order: [['fecha_hora', 'DESC']]
    });
  }

  async obtenerComentarioPorId(id) {
    return await Comentario.findByPk(id, {
      include: [
        { model: Usuario, as: "usuario", attributes: ["nombre", "correo"] },
        { model: Evento, as: "evento", attributes: ["nombre"] },
      ]
    });
  }

  async obtenerComentariosPorEvento(eventoid) {
    return await Comentario.findAll({
      where: { eventoid },
      include: [
        { 
          model: Usuario, 
          as: "usuario", 
          attributes: ["id", "nombre", "correo"] 
        },
        { 
          model: Evento, 
          as: "evento",
          required: true,
          attributes: ["id", "nombre", "descripcion", "fecha_hora", "estado", "capacidad", "precio", "lugarid"],
          include: [
            {
              model: Lugar,
              as: "lugar",
              required: true,
              attributes: ["id", "nombre", "usuarioid", "ubicacion", "descripcion", "estado"]
            }
          ]
        }
      ],
      order: [['fecha_hora', 'DESC']]
    });
  }
}

module.exports = new ComentarioService();
