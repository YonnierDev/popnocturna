const { Comentario, Usuario, Evento, Lugar } = require('../../models');

class SolicitudOcultarComentarioService {
  // Propietario solicita ocultar
  async solicitarOcultar(comentarioid, motivo_reporte) {
    try {
      // Validación inicial de los parámetros
      if (!comentarioid || !motivo_reporte) {
          throw new Error('Datos incompletos para la solicitud');
      }
  
      // Buscar el comentario junto con las relaciones Usuario y Evento
      const comentario = await Comentario.findOne({
          where: { id: comentarioid },
          include: [
              { model: Usuario, as: 'usuario' }, 
              { model: Evento, as: 'evento' } 
          ]
      });
  
      if (!comentario) {
          throw new Error('Comentario no encontrado');
      }
  
      if (!comentario.usuario) {
          throw new Error('Usuario no asociado al comentario');
      }
  
      // Actualizar el comentario con el estado de solicitud de ocultación
      await Comentario.update(
          { 
              motivo_reporte,
              fecha_solicitud: new Date()
          },
          { where: { id: comentarioid } }
      );
  
      return { 
          mensaje: 'Solicitud enviada a administración', 
          comentario_id: comentarioid 
      };
  
    } catch (error) {
      console.error('Error al crear solicitud:', error.message);  
      throw new Error(`Error al crear solicitud: ${error.message}`);
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
