const { Comentario, Usuario, Evento, Lugar } = require('../../models');

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

      // Verificar que el comentario no esté ya reportado
      if (comentario.aprobacion === 0) {  // 0 = pendiente
        console.log('Error: Comentario ya reportado');
        throw new Error('Este comentario ya ha sido reportado y está pendiente de revisión');
      }

      // Actualizar el comentario con el estado de solicitud de ocultación
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
      },
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'correo']
        },
        {
          model: Evento,
          as: 'evento',
          attributes: ['id', 'nombre'],
          include: [
            {
              model: Lugar,
              as: 'lugar',
              attributes: ['id', 'nombre']
            }
          ]
        }
      ],
      attributes: [
        'id',
        'contenido',
        'fecha_hora',
        'estado',
        'motivo_reporte'
      ]
    });
  }


  async obtenerDetallesComentario(comentarioid) {
    try {
      console.log(`Buscando comentario con ID: ${comentarioid}`);  // Agregar log para ver qué comentario se busca

      const comentario = await Comentario.findOne({
        where: { id: comentarioid },
        attributes: ['id', 'contenido', 'estado', 'createdAt', 'updatedAt'],
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['nombre']
          }
        ]
      });


      console.log('Comentario encontrado:', comentario);

      if (!comentario) {
        throw new Error('Comentario no encontrado');
      }

      return comentario;
    } catch (error) {
      console.error('Error en obtenerDetallesComentario:', error.message);
      throw error;
    }
  }


  async procesarSolicitud(comentarioid, decision, usuarioid) {
    try {
      console.log('=== Inicio de procesarSolicitud en servicio ===');
      console.log('Datos recibidos:', { comentarioid, decision, usuarioid });

      // Obtener el comentario con sus relaciones
      const comentario = await Comentario.findOne({
        where: { id: comentarioid },
        include: [
          { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'correo'] },
          { model: Evento, as: 'evento', include: [{ model: Lugar, as: 'lugar' }] }
        ]
      });

      if (!comentario) {
        console.log('Error: Comentario no encontrado');
        throw new Error("Comentario no encontrado");
      }

      if (!["ocultar", "mantener"].includes(decision)) {
        console.log('Error: Decisión inválida');
        throw new Error('La decisión debe ser "ocultar" o "mantener"');
      }

      // Actualizar el estado de aprobación
      const nuevoEstadoAprobacion = decision === "ocultar" ? 1 : 2; // 1 = aprobado, 2 = rechazado
      
      // Actualizar el comentario
      const [actualizado] = await Comentario.update(
        {
          aprobacion: nuevoEstadoAprobacion,
          // Si la decisión es ocultar, cambiar estado a false (invisible)
          // Si es mantener, dejar el estado como está
          ...(decision === "ocultar" && { estado: false })
        },
        { where: { id: comentarioid } }
      );

      if (!actualizado) {
        console.log('Error: No se pudo actualizar el comentario');
        throw new Error('Error al actualizar el comentario');
      }

      console.log('Comentario actualizado exitosamente');
      
      // Obtener el comentario actualizado para devolverlo
      const comentarioActualizado = await this.obtenerComentario(comentarioid);
      
      // Retornar los detalles actualizados del comentario
      return {
        id: comentarioActualizado.id,
        contenido: comentarioActualizado.contenido,
        estado: comentarioActualizado.estado ? 'activo' : 'inactivo',
        aprobacion: comentarioActualizado.aprobacion, // 0=pendiente, 1=aprobado, 2=rechazado
        motivo_reporte: comentarioActualizado.motivo_reporte,
        createdAt: comentarioActualizado.createdAt,
        updatedAt: comentarioActualizado.updatedAt,
        usuario: comentarioActualizado.usuario ? {
          id: comentarioActualizado.usuario.id,
          nombre: comentarioActualizado.usuario.nombre,
          correo: comentarioActualizado.usuario.correo
        } : null,
        evento: comentarioActualizado.evento ? {
          id: comentarioActualizado.evento.id,
          nombre: comentarioActualizado.evento.nombre,
          lugar: comentarioActualizado.evento.lugar ? {
            id: comentarioActualizado.evento.lugar.id,
            nombre: comentarioActualizado.evento.lugar.nombre
          } : null
        } : null
      };
    } catch (error) {
      console.error("Error en procesarSolicitud:", error);
      throw new Error(`Error al procesar la solicitud: ${error.message}`);
    }
  }


}

module.exports = new SolicitudOcultarComentarioService();
