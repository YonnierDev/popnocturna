const propietarioReservaEventoLugarService = require('../../service/propietarioService/propietarioReservaEventoLugarService');

class PropietarioReservaEventoLugarController {
  async obtenerReservasEventoLugar(req, res) {
    try {
      const usuarioid = req.usuario.id;
      const reservas = await propietarioReservaEventoLugarService.obtenerReservasEventoLugar(usuarioid);
      res.status(200).json(reservas);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener las reservas del propietario' });
    }
  }

  async obtenerReservasPendientes(req, res) {
    try {
      const propietarioId = req.usuario.id;
  
      const reservas = await propietarioReservaEventoLugarService.obtenerReservasEventoLugarPendientes(propietarioId);
      res.json(reservas);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener reservas pendientes', error: error.message });
    }
  }
  
}

module.exports = new PropietarioReservaEventoLugarController();
