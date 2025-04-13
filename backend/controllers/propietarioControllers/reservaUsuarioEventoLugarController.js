const reservaUsuarioEventoLugar = require("../../service/propietarioService/reservaUsuarioEventoLugarService");

class ReservaUsuarioEventoLugarController {
    async listarReservas(req, res) {
        try {
          const reservas = await reservaUsuarioEventoLugar.listarReservasConDetalles();
          res.json(reservas);
        } catch (error) {
          res.status(500).json({ mensaje: "Error no lista las reservas ",error });
        }
      }
}

module.exports = new ReservaUsuarioEventoLugarController();
