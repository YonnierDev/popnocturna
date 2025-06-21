const { Lugar, Evento, Reserva, Usuario, Categoria } = require("../../models");

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

  // Este método ya no es necesario ya que movimos la lógica al controlador
  // Se mantiene por compatibilidad con otras partes del código
  async obtenerEventosActivosLugar(usuarioid, lugarId) {
    // La lógica se movió al controlador
    return {
      success: false,
      message: 'Este método está obsoleto. Usa el controlador directamente.',
      eventos: []
    };
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
