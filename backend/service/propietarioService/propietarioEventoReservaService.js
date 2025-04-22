const { Lugar, Evento } = require("../../models");

class PropietarioEventoReservaService {
  async obtenerReservasEventoLugar(usuarioid) {
    try {
      const reservas = await Reserva.findAll({
        include: [
          {
            model: Evento,
            as: "evento",
            attributes: ["nombre", "fecha_hora"],
            include: [
              {
                model: Lugar,
                as: "lugar",
                attributes: ["nombre", "imagen"],
                where: { usuarioid },
              },
            ],
          },
          {
            model: Usuario,
            as: "usuario",
            attributes: ["nombre", "apellido", "correo"],
          },
        ],
        where: {
          estado: true,
        },
        attributes: ["id", "fecha_hora", "aprobacion", "estado"],
      });
  
      return reservas;
    } catch (error) {
      return "Error al obtener las reservas del propietario: " + error.message;
    }
  }
  
}

module.exports = new PropietarioEventoReservaService();
