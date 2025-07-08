const { Notificacion, Usuario } = require('../models');


class NotificacionService {
  async listarPorUsuario(usuarioId) {
    return await Notificacion.findAll({
      where: { receptor_id: usuarioId },
      include: [{ model: Usuario, as: 'remitente', attributes: ['id', 'nombre'] }],
      order: [['createdAt', 'DESC']]
    });
  }

  async eliminarNotificacion(notificacionId, usuarioId) {
    const notificacion = await Notificacion.findOne({
      where: { id: notificacionId, receptor_id: usuarioId }
    });

    if (!notificacion) {
      throw { status: 404, mensaje: 'Notificación no encontrada' };
    }

    await notificacion.destroy();
    return { mensaje: 'Notificación eliminada correctamente' };
  }
}

module.exports = new NotificacionService(); 
