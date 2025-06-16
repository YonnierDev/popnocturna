const { Usuario, Evento, Lugar, Reserva } = require("../../models");

class ReservaUsuarioEventoLugarService {
  async listarReservasConDetalles(usuarioid, lugarId = null) {
    try {
      console.log('=== listarReservasConDetalles ===');
      console.log('Usuario ID:', usuarioid);
      console.log('Lugar ID solicitado:', lugarId);
      
      const whereClause = { estado: true };
      const includeLugar = {
        model: Lugar,
        as: "lugar",
        attributes: ["id", "nombre"],
        where: { usuarioid, estado: true },
        required: true
      };

      // Si se proporciona un lugarId, lo agregamos al where del lugar
      if (lugarId) {
        console.log('Filtrando por lugar ID:', lugarId);
        includeLugar.where.id = lugarId;
      }

      console.log('Buscando reservas con whereClause:', whereClause);
      console.log('IncludeLugar configurado como:', includeLugar);
      
      const reservas = await Reserva.findAll({
        where: whereClause,
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
              includeLugar
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
