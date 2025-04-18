const { Calificacion, Usuario, Evento } = require("../models");

class CalificacionService {

  async listarCalificaciones() {
    return await Calificacion.findAll({
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["nombre"]
        },
        {
          model: Evento,
          as: "evento",
          attributes: ["descripcion"]
        }
      ]
    });
  }
  
  async actualizarEstado(id, estado) {
    return await Calificacion.update({ estado }, { where: { id } });
  }

  async crearCalificacion(usuarioid, eventoid, puntuacion, estado) {
    return await Calificacion.create({ usuarioid, eventoid, puntuacion, estado });
  }

  async actualizarCalificacion(id, usuarioid, eventoid, puntuacion, estado) {
    return await Calificacion.update(
      { usuarioid, eventoid, puntuacion, estado },
      { where: { id } }
    );
  }

  async eliminarCalificacion(id) {
    return await Calificacion.destroy({ where: { id } });
  }

  async buscarCalificacion(id) {
    return await Calificacion.findOne({
      where: { id },
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["nombre"],
        },
        {
          model: Evento,
          as: "evento", 
          attributes: ["nombre"],
        },
      ],
    });
  }

  async verificarUsuario(usuarioid) {
    return await Usuario.findByPk(usuarioid);
  }

  async verificarEvento(eventoid) {
    return await Evento.findByPk(eventoid);
  }
}

module.exports = new CalificacionService();
