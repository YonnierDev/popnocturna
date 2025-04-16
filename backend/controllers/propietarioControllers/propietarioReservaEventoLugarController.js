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
}

module.exports = new PropietarioReservaEventoLugarController();
