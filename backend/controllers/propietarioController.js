const PropietarioService = require('../service/propietarioService');

class PropietarioController {
  async listarComentariosPorLugar(req, res) {
    try {
      const { lugarid } = req.params;
      const comentarios = await PropietarioService.obtenerComentariosPorLugar(lugarid);
      res.json(comentarios);
    } catch (error) {
      console.error('Error en listarComentariosPorLugar:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async listarCalificacionesPorLugar(req, res) {
    try {
      const { lugarid } = req.params;
      const calificaciones = await PropietarioService.obtenerCalificacionesPorLugar(lugarid);
      res.json(calificaciones);
    } catch (error) {
      console.error('Error en listarCalificacionesPorLugar:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async listarReservasPorLugar(req, res) {
    try {
      const { lugarid } = req.params;
      const reservas = await PropietarioService.obtenerReservasPorLugar(lugarid);
      res.json(reservas);
    } catch (error) {
      console.error('Error en listarReservasPorLugar:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new PropietarioController();
