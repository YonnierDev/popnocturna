const { Reserva, Evento, Lugar } = require("../../models");

class PropietarioReservaEventoLugarService {
  async obtenerReservasEventoLugar(usuarioid) {
    try {
      const reservas = await Reserva.findAll({
        include: [
          {
            model: Evento,
            as: "evento",
            attributes: ["nombre"],
            include: [
              {
                model: Lugar,
                as: "lugar",
                attributes: ["nombre"],
              },
            ],
          },
        ],
        where: {
          "$evento.lugar.usuarioid$": usuarioid,
        },
        where: {
          estado: true,
          "$evento.lugar.usuarioid$": usuarioid,
        },
        attributes: ["id", "fecha_hora", "aprobacion", "estado"],
      });

      return reservas;
    } catch (error) {
      return "Error al obtener las reservas del propietario: " + error.message;
    }
  }
}

module.exports = new PropietarioReservaEventoLugarService();
