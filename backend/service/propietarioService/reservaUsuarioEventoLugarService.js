const { Usuario, Evento, Lugar, Reserva } = require("../../models");

class ReservaUsuarioEventoLugarService {
    async listarReservasConDetalles() {
    
        const reservas = await Reserva.findAll({
          where: { estado: true },
          include: [
            {
              model: Usuario,
              as: "usuario",
              attributes: ["id", "nombre"],
              where: { estado: true },
              required: true, // asegura que solo se incluyan si existen y cumplen condición
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
                  where: { estado: true },
                  required: true,
                },
              ],
            },
          ],
        });
        return reservas;
      }
}
module.exports = new ReservaUsuarioEventoLugarService();
