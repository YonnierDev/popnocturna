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

  // Obtener reservas activas de un evento específico
  async obtenerReservasPorEvento(propietarioId, eventoid) {
    try {
      const reservas = await Reserva.findAll({
        where: { 
          eventoid,
          estado: true // Solo reservas activas
        },
        include: [
          {
            model: Evento,
            as: 'evento',
            where: { estado: true }, // Solo eventos activos
            include: [{
              model: Lugar,
              as: 'lugar',
              where: { usuarioid: propietarioId },
              attributes: ['nombre']
            }],
            attributes: ['nombre']
          },
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['nombre']
          }
        ],
        order: [['fecha_hora', 'DESC']]
      });

      return reservas;
    } catch (error) {
      console.error("Error en obtenerReservasPorEvento:", error);
      throw new Error("Error al obtener reservas del evento: " + error.message);
    }
  }
  
  // Obtener todas las reservas del propietario (sin filtrar por estado de reserva)
  async obtenerReservasActivas(propietarioId) {
    try {
      const reservas = await Reserva.findAll({
        include: [
          {
            model: Evento,
            as: 'evento',
            where: { estado: true }, // Solo eventos activos
            include: [{
              model: Lugar,
              as: 'lugar',
              where: { usuarioid: propietarioId },
              attributes: ['nombre']
            }],
            attributes: ['id', 'nombre', 'descripcion', 'fecha_hora', 'precio', 'capacidad', 'portada']
          },
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['nombre']
          }
        ],
        order: [['fecha_hora', 'DESC']]
      });

      return reservas;
    } catch (error) {
      console.error("Error en obtenerReservasActivas:", error);
      throw new Error("Error al obtener reservas activas: " + error.message);
    }
  }
}

module.exports = new PropietarioReservaEventoLugarService();
