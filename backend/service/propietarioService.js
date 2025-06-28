const { Comentario, Calificacion, Reserva, Evento, Usuario } = require('../models');

class PropietarioService {
  async obtenerComentariosPorLugar(lugarId) {
    try {
      return await Comentario.findAll({
        include: [
          {
            model: Evento,
            as: 'evento',
            where: { lugarid: lugarId },
            attributes: ['id', 'nombre']
          },
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nombre', 'correo']
          }
        ],
        order: [['fecha_hora', 'DESC']]
      });
    } catch (error) {
      console.error('Error en obtenerComentariosPorLugar:', error);
      throw error;
    }
  }

  async obtenerCalificacionesPorLugar(lugarId) {
    try {
      return await Calificacion.findAll({
        include: [
          {
            model: Evento,
            as: 'evento',
            where: { lugarid: lugarId },
            attributes: ['id', 'nombre']
          },
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nombre', 'correo']
          }
        ],
        order: [['createdAt', 'DESC']]
      });
    } catch (error) {
      console.error('Error en obtenerCalificacionesPorLugar:', error);
      throw error;
    }
  }

  async obtenerReservasPorLugar(lugarId) {
    try {
      return await Reserva.findAll({
        include: [
          {
            model: Evento,
            as: 'evento',
            where: { lugarid: lugarId },
            attributes: ['id', 'nombre', 'fecha_hora']
          },
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nombre', 'correo']
          }
        ],
        order: [['fecha_hora', 'DESC']]
      });
    } catch (error) {
      console.error('Error en obtenerReservasPorLugar:', error);
      throw error;
    }
  }
}

module.exports = new PropietarioService();
