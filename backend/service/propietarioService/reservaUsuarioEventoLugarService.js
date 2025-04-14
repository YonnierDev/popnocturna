const { Usuario, Evento, Lugar, Reserva } = require("../../models");

class ReservaUsuarioEventoLugarService {
  async listarReservasConDetalles(usuarioid) {
    try {
      const reservas = await Reserva.findAll({
        where: { estado: true },
        include: [
          {
            model: Usuario,
            as: "usuario",
            attributes: ["id", "nombre"],
            where: { estado: true },
            required: true,
          },
          {
            model: Evento,
            as: "evento",
            attributes: ["id", "nombre", "estado", "fecha_hora", "capacidad", "precio"],
            where: { estado: true },
            required: true,
            include: [
              {
                model: Lugar,
                as: "lugar",
                attributes: ["id", "nombre"],
                where: { usuarioid, estado: true },
                required: true,
              },
            ],
          },
        ],
      });

      return reservas;
    } catch (error) {
      throw new Error("Error al listar las reservas con detalles: " + error.message);
    }
  }
}

module.exports = new ReservaUsuarioEventoLugarService();
