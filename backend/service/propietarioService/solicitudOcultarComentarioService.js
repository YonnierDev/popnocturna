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
      if (comentario.aprobacion === 'pendiente') {
        console.log('Error: Comentario ya reportado');
        throw new Error('Este comentario ya ha sido reportado y está pendiente de revisión');
      }

      // Actualizar el comentario con el estado de solicitud de ocultación
      const [actualizado] = await Comentario.update(
        {
          motivo_reporte,
          aprobacion: 'pendiente',
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

      const comentario = await Comentario.findOne({
        where: { id: comentarioid },
        include: [
          { model: Usuario, as: 'usuario', attributes: ['nombre', 'correo'] }
        ]
      });

      if (!comentario) {
        throw new Error("Comentario no encontrado");
      }

      if (!["ocultar", "mantener"].includes(decision)) {
        throw new Error('La decisión debe ser "ocultar" o "mantener"');
      }

      if (decision === "ocultar") {
        comentario.estado = false;
      } else if (decision === "mantener") {
        comentario.estado = true;
      }

      await comentario.save();

      // Retornar los detalles actualizados del comentario
      return {
        id: comentario.id,
        contenido: comentario.contenido,
        estado: comentario.estado ? 'activo' : 'inactivo',
        createdAt: comentario.createdAt,
        updatedAt: comentario.updatedAt,
        usuario: comentario.usuario ? comentario.usuario.nombre : 'Desconocido',
        correo: comentario.usuario ? comentario.usuario.correo : 'No disponible',
      };
    } catch (error) {
      console.error("Error en el servicio:", error.message);
      throw new Error(`Error al procesar la solicitud: ${error.message}`);
    }
  }


}

module.exports = new SolicitudOcultarComentarioService();
