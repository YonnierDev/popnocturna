const reservaUsuarioEventoLugarService = require("../../service/propietarioService/reservaUsuarioEventoLugarService");

class ReservaUsuarioEventoLugarController {
  async listarReservas(req, res) {
    try {
      console.log('=== Inicio listarReservas ===');
      console.log('Usuario autenticado:', req.usuario);
      
      const usuarioid = req.usuario.id;
      const { lugarId } = req.query;
      
      console.log('Query parameters recibidos:', { lugarId });
      
      // Validar lugarId si se proporciona
      const lugarIdNum = lugarId ? parseInt(lugarId) : null;
      if (lugarId && isNaN(lugarIdNum)) {
        console.error('Error: ID de lugar no válido:', lugarId);
        return res.status(400).json({ 
          success: false,
          mensaje: 'El ID del lugar debe ser un número válido' 
        });
      }
      
      const reservas = await reservaUsuarioEventoLugarService.listarReservasConDetalles(
        usuarioid,
        lugarIdNum
      );
      
      res.json({
        success: true,
        data: reservas,
        total: reservas.length,
        lugarFiltrado: lugarIdNum || 'Todos'
      });
      
    } catch (error) {
      console.error('Error en listarReservas:', error);
      res.status(500).json({ 
        success: false,
        mensaje: 'Error al listar las reservas', 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new ReservaUsuarioEventoLugarController();
