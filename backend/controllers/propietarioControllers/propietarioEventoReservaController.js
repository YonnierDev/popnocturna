const propietarioEventoReservaService = require("../../service/propietarioService/propietarioEventoReservaService");

class PropietarioEventoReservaController {
  async listarLugaresConEventos(req, res) {
    try {
      const usuarioid = req.usuario.id; 
      const lugares = await propietarioEventoReservaService.obtenerLugaresConEventos(usuarioid); 
      return res.status(200).json(lugares); 
    } catch (error) {
      return res.status(500).json({ mensaje: "Error al obtener lugares y eventos" });
    }
  }
}

module.exports = new PropietarioEventoReservaController();
