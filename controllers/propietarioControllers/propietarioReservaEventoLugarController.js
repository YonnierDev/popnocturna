const propietarioReservaEventoLugarService = require('../../service/propietarioService/propietarioReservaEventoLugarService');
const { Usuario, Evento, Lugar } = require('../../models');

class PropietarioReservaEventoLugarController {
  async obtenerReservasEventoLugar(req, res) {
    try {
      const usuarioid = req.usuario.id;
      const reservas = await propietarioReservaEventoLugarService.obtenerReservasEventoLugar(usuarioid);
      res.status(200).json(reservas);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener las reservas del propietario' });
    }
  }

  async obtenerReservasPendientes(req, res) {
    try {
      const propietarioId = req.usuario.id;
  
      const reservas = await propietarioReservaEventoLugarService.obtenerReservasEventoLugarPendientes(propietarioId);
      res.json(reservas);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener reservas pendientes', error: error.message });
    }
  }

  // Obtener reservas activas de un evento específico
  async obtenerReservasPorEvento(req, res) {
    try {
      const propietarioId = req.usuario.id;
      const { eventoid } = req.params;
      
      if (!eventoid) {
        return res.status(400).json({
          success: false,
          mensaje: 'Se requiere el ID del evento'
        });
      }

      // Verificar si el usuario es propietario
      const usuario = await Usuario.findByPk(propietarioId);
      if (!usuario || usuario.rolid !== 3) {
        return res.status(403).json({
          success: false,
          mensaje: 'Acceso denegado. Solo los propietarios pueden ver estas reservas.'
        });
      }

      // Verificar si el evento existe y pertenece al propietario
      const evento = await Evento.findOne({
        where: { id: eventoid, estado: true },
        include: [{
          model: Lugar,
          as: 'lugar',
          where: { usuarioid: propietarioId }
        }]
      });

      if (!evento) {
        return res.status(404).json({
          success: false,
          mensaje: 'Evento no encontrado o no tienes permisos para verlo'
        });
      }

      // Obtener solo reservas activas (estado = true) del evento
      const reservas = await propietarioReservaEventoLugarService.obtenerReservasPorEvento(propietarioId, eventoid);
      
      // Formatear la respuesta
      const respuesta = reservas.map(reserva => {
        const reservaJson = reserva.get({ plain: true });
        if (reservaJson.evento?.portada) {
          reservaJson.evento.portada = Array.isArray(reservaJson.evento.portada) 
            ? reservaJson.evento.portada 
            : [reservaJson.evento.portada].filter(Boolean);
        }
        return reservaJson;
      });

      // Si no hay reservas activas
      if (respuesta.length === 0) {
        return res.status(200).json({
          success: true,
          data: [],
          total: 0,
          eventoid: parseInt(eventoid),
          mensaje: 'No hay reservas activas para este evento'
        });
      }

      return res.status(200).json({
        success: true,
        data: respuesta,
        total: respuesta.length,
        eventoid: parseInt(eventoid)
      });
    } catch (error) {
      console.error('Error en obtenerReservasPorEvento:', error);
      return res.status(500).json({
        success: false,
        mensaje: 'Error al obtener las reservas del evento',
        error: error.message
      });
    }
  }
  
  // Obtener todas las reservas activas (para compatibilidad)
  async obtenerReservasActivas(req, res) {
    try {
      const propietarioId = req.usuario.id;
      
      // Verificar si el usuario es propietario
      const usuario = await Usuario.findByPk(propietarioId);
      if (!usuario || usuario.rolid !== 3) {
        return res.status(403).json({
          success: false,
          mensaje: 'Acceso denegado. Solo los propietarios pueden ver estas reservas.'
        });
      }

      // Obtener todas las reservas activas
      const reservas = await propietarioReservaEventoLugarService.obtenerReservasActivas(propietarioId);
      
      // Formatear la respuesta
      const respuesta = reservas.map(reserva => {
        const reservaJson = reserva.get({ plain: true });
        // Asegurar que portada sea un array
        if (reservaJson.evento && reservaJson.evento.portada) {
          reservaJson.evento.portada = Array.isArray(reservaJson.evento.portada) 
            ? reservaJson.evento.portada 
            : [reservaJson.evento.portada].filter(Boolean);
        }
        return reservaJson;
      });

      return res.status(200).json({
        success: true,
        data: respuesta,
        total: respuesta.length
      });
    } catch (error) {
      console.error('Error en obtenerReservasActivas:', error);
      return res.status(500).json({
        success: false,
        mensaje: 'Error al obtener las reservas activas',
        error: error.message
      });
    }
  }
}

module.exports = new PropietarioReservaEventoLugarController();
