const { Comentario, Calificacion, Reserva, Evento, Usuario, Lugar } = require('../models');
const CloudinaryService = require('./cloudinaryService');

class PropietarioService {
  async obtenerComentariosPorLugar(lugarId) {
    try {
      return await Comentario.findAll({
        include: [
          {
            model: Evento,
            as: 'evento',
            where: { lugarid: lugarId },
            attributes: ['id', 'nombre']
          },
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nombre', 'correo']
          }
        ],
        order: [['fecha_hora', 'DESC']]
      });
    } catch (error) {
      console.error('Error en obtenerComentariosPorLugar:', error);
      throw error;
    }
  }

  async obtenerCalificacionesPorLugar(lugarId) {
    try {
      return await Calificacion.findAll({
        include: [
          {
            model: Evento,
            as: 'evento',
            where: { lugarid: lugarId },
            attributes: ['id', 'nombre']
          },
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nombre', 'correo']
          }
        ],
        order: [['createdAt', 'DESC']]
      });
    } catch (error) {
      console.error('Error en obtenerCalificacionesPorLugar:', error);
      throw error;
    }
  }

  async obtenerReservasPorLugar(lugarId) {
    try {
      return await Reserva.findAll({
        include: [
          {
            model: Evento,
            as: 'evento',
            where: { lugarid: lugarId },
            attributes: ['id', 'nombre', 'fecha_hora']
          },
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nombre', 'correo']
          }
        ],
        order: [['fecha_hora', 'DESC']]
      });
    } catch (error) {
      console.error('Error en obtenerReservasPorLugar:', error);
      throw error;
    }
  }

  async obtenerLugarPorId(id) {
    try {
      return await Lugar.findByPk(id);
    } catch (error) {
      console.error('Error en obtenerLugarPorId:', error);
      throw error;
    }
  }

  async actualizarLugarPropietario(id, usuarioId, datosActualizados) {
    const transaction = await Lugar.sequelize.transaction();
    
    try {
      // Buscar el lugar por ID
      const lugar = await Lugar.findByPk(id, { transaction });

      if (!lugar) {
        throw new Error('Lugar no encontrado');
      }

      // Verificar que el lugar pertenezca al usuario
      if (lugar.usuarioid !== usuarioId) {
        throw new Error('No tienes permiso para actualizar este lugar');
      }

      // Actualizar el lugar
      await Lugar.update(datosActualizados, {
        where: { id },
        transaction
      });

      // Obtener el lugar actualizado
      const lugarActualizado = await Lugar.findByPk(id, { transaction });
      
      // Confirmar la transacción
      await transaction.commit();
      
      return lugarActualizado;
    } catch (error) {
      // Revertir la transacción en caso de error
      await transaction.rollback();
      console.error('Error en actualizarLugarPropietario:', error);
      throw error;
    }
  }
}

module.exports = new PropietarioService();
