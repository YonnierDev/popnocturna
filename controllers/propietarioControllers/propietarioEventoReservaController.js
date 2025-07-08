const propietarioEventoReservaService = require("../../service/propietarioService/propietarioEventoReservaService");
const { Lugar, Evento, Usuario, Categoria } = require("../../models");

class PropietarioEventoReservaController {
  async listarLugaresConEventos(req, res) {
    try {
      const usuarioid = req.usuario.id; 
      const lugares = await propietarioEventoReservaService.obtenerLugaresConEventos(usuarioid); 
      return res.status(200).json(lugares); 
    } catch (error) {
      return res.status(500).json({ mensaje: "Error al obtener lugares y eventos" });
    }
  }

  async obtenerEventosActivosLugar(req, res) {
    try {
      const { lugarId } = req.params;
      const usuarioid = req.usuario.id; // Obtenido del token JWT por el middleware
      
      console.log('🔍 Buscando eventos para lugar:', lugarId, 'usuario:', usuarioid);
      
      // 1. Verificar que el lugar existe y pertenece al usuario
      const lugar = await Lugar.findOne({
        where: { 
          id: lugarId,
          usuarioid: usuarioid,
          estado: true,
          aprobacion: true
        }
      });

      if (!lugar) {
        console.log('❌ Lugar no encontrado o no autorizado');
        return res.status(404).json({ 
          success: false,
          message: 'Lugar no encontrado o no tienes permiso',
          eventos: []
        });
      }

      // 2. Obtener solo los campos necesarios de los eventos
      const eventos = await Evento.findAll({
        where: {
          lugarid: lugarId,
          estado: true
        },
        attributes: ['id', 'nombre', 'descripcion', 'fecha_hora', 'precio', 'portada', 'estado'],
        order: [['fecha_hora', 'DESC']],
        raw: true // Obtener datos planos sin instancias de modelo
      });
      
      console.log(`✅ Eventos encontrados: ${eventos.length}`);

      // 3. Si no hay eventos, devolver array vacío
      if (!eventos || eventos.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No se encontraron eventos para este lugar',
          eventos: []
        });
      }

      // 4. Formatear los eventos si es necesario
      const eventosFormateados = eventos.map(evento => ({
        ...evento,
        // Aquí puedes formatear los campos si es necesario
        // Por ejemplo, formatear fechas o procesar imágenes
      }));

      res.status(200).json({
        success: true,
        message: `Se encontraron ${eventosFormateados.length} eventos para este lugar`,
        eventos: eventosFormateados
      });
    } catch (error) {
      console.error('Error en obtenerEventosActivosLugar:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error interno del servidor',
        error: error.message,
        eventos: []
      });
    }
  }
}

module.exports = new PropietarioEventoReservaController();
