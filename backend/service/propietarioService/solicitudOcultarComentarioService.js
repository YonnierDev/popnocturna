const { Comentario, Usuario, Evento, Lugar, sequelize } = require('../../models');
const { Op } = require('sequelize');

class SolicitudOcultarComentarioService {
  // Obtener un comentario por ID
  async obtenerComentario(comentarioid) {
    try {
      console.log('=== Inicio de obtenerComentario ===');
      console.log('Buscando comentario con ID:', comentarioid);

      const comentario = await Comentario.findOne({
        where: { id: comentarioid },
        include: [
          { model: Usuario, as: 'usuario' },
          { model: Evento, as: 'evento' }
        ]
      });

      console.log('Comentario encontrado:', comentario ? 'Sí' : 'No');
      return comentario;
    } catch (error) {
      console.error('Error en obtenerComentario:', error);
      throw error;
    }
  }

  // Propietario solicita ocultar
  async solicitarOcultar(comentarioid, motivo_reporte, usuarioid) {
    try {
      console.log('=== Inicio de solicitarOcultar en servicio ===');
      console.log('Datos recibidos:', { comentarioid, motivo_reporte, usuarioid });

      // Validación inicial de los parámetros
      if (!comentarioid || !motivo_reporte || !usuarioid) {
        console.log('Error: Datos incompletos');
        throw new Error('Datos incompletos para la solicitud');
      }

      // Buscar el comentario junto con las relaciones Usuario y Evento
      const comentario = await this.obtenerComentario(comentarioid);
      if (!comentario) {
        console.log('Error: Comentario no encontrado');
        throw new Error('Comentario no encontrado');
      }

      if (!comentario.usuario) {
        console.log('Error: Usuario no asociado al comentario');
        throw new Error('Usuario no asociado al comentario');
      }

      // Verificar que el comentario no esté ya reportado (0 = pendiente)
      if (comentario.aprobacion === 0) {
        console.log('Error: Comentario ya reportado y pendiente de revisión');
        throw new Error('Este comentario ya ha sido reportado y está pendiente de revisión');
      }
      
      // Si el comentario ya fue aprobado (1), no se puede reportar
      if (comentario.aprobacion === 1) {
        console.log('Error: Comentario ya fue aprobado');
        throw new Error('Este comentario ya fue aprobado y no puede ser reportado');
      }

      // Actualizar el comentario a estado pendiente (0) cuando se reporta
      const [actualizado] = await Comentario.update(
        {
          motivo_reporte,
          aprobacion: 0,  // 0 = pendiente
          reportado_por: usuarioid,
          fecha_reporte: new Date()
        },
        { where: { id: comentarioid } }
      );

      if (!actualizado) {
        console.log('Error: No se pudo actualizar el comentario');
        throw new Error('Error al actualizar el comentario');
      }

      // Obtener el comentario actualizado
      const comentarioActualizado = await this.obtenerComentario(comentarioid);
      console.log('Comentario actualizado exitosamente');

      return {
        mensaje: 'Solicitud enviada a administración',
        comentario: comentarioActualizado
      };

    } catch (error) {
      console.error('Error en solicitarOcultar:', error.message);
      throw error;
    }
  }

  // Admin lista comentarios para revisar
  async listarComentariosPendientes() {
    return await Comentario.findAll({
      where: {
        aprobacion: 0  // Solo comentarios pendientes (0 = pendiente)
      },
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['nombre']
        },
        {
          model: Evento,
          as: 'evento',
          attributes: ['nombre'],
          include: [
            {
              model: Lugar,
              as: 'lugar',
              attributes: ['nombre']
            }
          ]
        }
      ],
      attributes: [
        'id',
        'contenido',
        'fecha_hora',
        'estado',
        'aprobacion',
        'motivo_reporte',
        'updatedAt'  // Usamos updatedAt para saber cuándo se reportó
      ],
      order: [['updatedAt', 'ASC']]  // Ordenar por fecha de actualización más antigua primero
    });
  }


  async obtenerDetallesComentario(comentarioid) {
    try {
      console.log(`Buscando comentario con ID: ${comentarioid}`);

      const comentario = await Comentario.findOne({
        where: { id: comentarioid },
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['nombre']
          },
          {
            model: Evento,
            as: 'evento',
            attributes: ['nombre'],
            include: [{
              model: Lugar,
              as: 'lugar',
              attributes: ['nombre']
            }]
          }
        ]
      });

      if (!comentario) {
        console.log('Comentario no encontrado');
        return null;
      }

      console.log('Comentario encontrado con éxito');
      return comentario;
    } catch (error) {
      console.error('Error en obtenerDetallesComentario:', error.message);
      throw error;
    }
  }


  async procesarSolicitud(comentarioid, decision, usuarioid) {
    const t = await sequelize.transaction();
    
    try {
      console.log('=== Inicio de procesarSolicitud en servicio ===');
      console.log('Datos recibidos:', { comentarioid, decision, usuarioid });

      // Verificar que la decisión sea válida
      if (![1, 2].includes(parseInt(decision))) {
        console.log('Error: Decisión inválida');
        throw new Error('La decisión debe ser 1 (aceptar) o 2 (rechazar)');
      }

      // Obtener el comentario actual para verificar su estado
      const comentarioActual = await Comentario.findOne({
        where: { id: comentarioid },
        transaction: t,
        lock: t.LOCK.UPDATE // Bloquear el registro para evitar condiciones de carrera
      });

      if (!comentarioActual) {
        console.log('Error: Comentario no encontrado');
        throw new Error("Comentario no encontrado");
      }

      // Si el comentario no está pendiente de revisión
      if (comentarioActual.aprobacion !== 0) {
        console.log(`Error: El comentario ya fue procesado con estado aprobacion=${comentarioActual.aprobacion}`);
        if (comentarioActual.aprobacion === 1) {
          throw new Error('Este comentario ya fue aprobado y está oculto');
        } else if (comentarioActual.aprobacion === 2) {
          throw new Error('Este comentario no tiene reportes activos');
        } else {
          throw new Error('Este comentario ya ha sido procesado anteriormente');
        }
      }

      // Preparar la actualización
      const nuevoEstado = decision == 1 ? false : true;
      const datosActualizacion = {
        aprobacion: parseInt(decision),
        estado: nuevoEstado,
        reportado_por: usuarioid,
        updatedAt: new Date()
      };
      
      console.log('Datos de actualización:', datosActualizacion);

      // Actualizar el comentario
      const [filasAfectadas] = await Comentario.update(
        datosActualizacion,
        { 
          where: { id: comentarioid },
          transaction: t
        }
      );
      
      if (filasAfectadas === 0) {
        throw new Error('No se pudo actualizar el comentario');
      }

      console.log('Comentario actualizado exitosamente');
      
      // Obtener el comentario actualizado con sus relaciones básicas
      const comentarioActualizado = await Comentario.findByPk(comentarioid, {
        include: [
          { 
            model: Usuario, 
            as: 'usuario', 
            attributes: ['id', 'nombre', 'correo'] 
          },
          { 
            model: Evento, 
            as: 'evento', 
            include: [{ 
              model: Lugar, 
              as: 'lugar',
              attributes: ['nombre']
            }],
            attributes: ['nombre']
          }
        ],
        transaction: t
      });

      // Obtener información del administrador que procesó la solicitud
      const admin = await Usuario.findByPk(usuarioid, {
        attributes: ['nombre', 'correo'],
        transaction: t
      });

      // Confirmar la transacción
      await t.commit();

      // Formatear la respuesta
      const respuesta = {
        comentario: {
          id: comentarioActualizado.id,
          contenido: comentarioActualizado.contenido,
          estado: comentarioActualizado.estado,
          aprobacion: comentarioActualizado.aprobacion,
          motivo_reporte: comentarioActualizado.motivo_reporte,
          fecha_creacion: comentarioActualizado.createdAt,
          fecha_actualizacion: comentarioActualizado.updatedAt,
          usuario: {
            id: comentarioActualizado.usuario.id,
            nombre: comentarioActualizado.usuario.nombre,
            correo: comentarioActualizado.usuario.correo
          },
          evento: {
            id: comentarioActualizado.evento.id,
            nombre: comentarioActualizado.evento.nombre,
            lugar: comentarioActualizado.evento.lugar ? {
              id: comentarioActualizado.evento.lugar.id,
              nombre: comentarioActualizado.evento.lugar.nombre
            } : null
          }
        },
        procesadoPor: admin ? {
          id: admin.id,
          nombre: admin.nombre,
          correo: admin.correo
        } : null,
        mensaje: decision == 1 
          ? 'Comentario aprobado y ocultado correctamente' 
          : 'Comentario rechazado y mantenido visible',
        exito: true
      };

      return respuesta;
      
    } catch (error) {
      // Hacer rollback en caso de error
      if (t && typeof t.rollback === 'function') {
        await t.rollback();
      }
      console.error('Error en procesarSolicitud:', error);
      throw new Error(`Error al procesar la solicitud: ${error.message}`);
    }
  }


}

module.exports = new SolicitudOcultarComentarioService();
