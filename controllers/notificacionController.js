const notificacionService = require('../service/notificacionService');

class NotificacionController {
  async listar(req, res) {
    try {
      const usuarioId = req.usuario.id;
      const notificaciones = await notificacionService.listarPorUsuario(usuarioId);
      res.json({ notificaciones });
    } catch (error) {
      console.error('Error al listar notificaciones:', error);
      res.status(500).json({ mensaje: 'Error al obtener notificaciones' });
    }
  }

  async eliminar(req, res) {
    try {
      const usuarioId = req.usuario.id;
      const notificacionId = req.params.id;

      const resultado = await notificacionService.eliminarNotificacion(notificacionId, usuarioId);
      res.json(resultado);
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      res.status(error.status || 500).json({ mensaje: error.mensaje || 'Error al eliminar notificación' });
    }
  }
}

module.exports = new NotificacionController(); 
