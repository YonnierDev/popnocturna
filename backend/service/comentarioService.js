const { Comentario, Usuario, Evento } = require('../models');

class ComentarioService {
  async listarRelacionesComentarios() {
    return await Comentario.findAll({
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["id", "nombre"]
        },
        {
          model: Evento,
          as: "evento",
          attributes: ["id", "nombre", "fecha_hora"]
        }
      ]
    });
  }

  async crearComentario({ usuarioid, eventoid, contenido, fecha_hora, estado }) {
    return await Comentario.create({ usuarioid, eventoid, contenido, fecha_hora, estado });
  }

  async actualizarComentario(id, usuarioid, contenido, fecha_hora, estado) {
    return await Comentario.update({ usuarioid, contenido, fecha_hora, estado }, { where: { id } });
  }

  async eliminarComentario(id) {
    return await Comentario.destroy({ where: { id } });
  }

  async buscarComentario(id) {
    return await Comentario.findOne({ where: { id } });
  }

  async verificarUsuario(usuarioid) {
    return await Usuario.findByPk(usuarioid);
  }
  
  async actualizarEstadoComentario(id, estado) {
    return await Comentario.update({ estado }, { where: { id } });
  }

}

module.exports = new ComentarioService();
