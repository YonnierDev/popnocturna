const { Lugar, Evento, Reserva, Usuario } = require("../../models");

class PropietarioEventoReservaService {
  async obtenerLugaresConEventos(usuarioid) {
    try {
      const lugares = await Lugar.findAll({
        where: { 
          usuarioid,
          estado: true,
          aprobacion: true 
        },
        include: [
          {
            model: Evento,
            as: 'eventos',
            where: { estado: true },
            required: false
          }
        ]
      });
      
      return lugares;
    } catch (error) {
      console.error('Error en obtenerLugaresConEventos:', error);
      throw new Error('Error al obtener los lugares con eventos');
    }
  }
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
      console.error('Error en obtenerReservasEventoLugar:', error);
      throw new Error("Error al obtener las reservas del propietario: " + error.message);
    }
  }
  
}

module.exports = new PropietarioEventoReservaService();
