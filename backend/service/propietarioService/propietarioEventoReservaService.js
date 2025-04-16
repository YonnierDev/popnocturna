const { Lugar, Evento } = require("../../models");

class PropietarioEventoReservaService {
  async obtenerLugaresConEventos(usuarioid) {
    try {
      const lugares = await Lugar.findAll({
        where: { usuarioid }, 
        attributes: ['nombre','imagen'],
        include: [
          {
            model: Evento,
            as: 'eventos',

            where: {
              estado: true 
             },

            attributes: ['nombre', 'fecha_hora'] 
          }
        ]
      });

      return lugares; 
    } catch (error) {
      return "Error al obtener lugares y eventos: " + error.message;
    }
  }
}

module.exports = new PropietarioEventoReservaService();
