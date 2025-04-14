const reservaUsuarioEventoLugarService = require("../../service/propietarioService/reservaUsuarioEventoLugarService");

class ReservaUsuarioEventoLugarController {
  async listarReservas(req, res) {
    try {
      const usuarioid = req.usuario.id;
      const reservas = await reservaUsuarioEventoLugarService.listarReservasConDetalles(usuarioid);
      res.json(reservas);
    } catch (error) {
      res.status(500).json({ mensaje: "Error al listar las reservas", error: error.message });
    }
  }
}

module.exports = new ReservaUsuarioEventoLugarController();
