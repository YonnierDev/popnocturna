const { Reserva, Evento, Lugar, Usuario } = require("../../models");

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
          {
            model: Usuario,
            as: "usuario",
            attributes: ["nombre", "correo"],
          },
        ],
        where: {
          estado: true,
          "$evento.lugar.usuarioid$": usuarioid,
        },
        attributes: ["numero_reserva", "fecha_hora", "aprobacion", "estado"],
      });

      return reservas;
    } catch (error) {
      return "Error al obtener las reservas del propietario: " + error.message;
    }
  }

  async obtenerReservasEventoLugarPendientes(usuarioid) {
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
                where: { usuarioid }
              }
            ]
          },
          {
            model: Usuario,
            as: "usuario",
            attributes: ["nombre", "correo"]
          }
        ],
        where: {
          aprobacion: "pendiente",
          estado: true
        },
        attributes: ["id", "numero_reserva", "fecha_hora", "aprobacion", "estado"]
      });

      return reservas;
    } catch (error) {
      throw new Error("Error al obtener reservas pendientes: " + error.message);
    }
  }


}

module.exports = new PropietarioReservaEventoLugarService();
