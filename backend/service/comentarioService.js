const { Comentario, Usuario, Evento, Lugar } = require('../models');
const { Op } = require('sequelize');

class ComentarioService {
  // Listar comentarios según el rol
  async listarComentarios(usuarioid, rol) {
    let where = { estado: true };
    let include = [];

    // Para usuarios (rol 8): ver sus comentarios con info del evento
    if (rol === 8) {
      where.usuarioid = usuarioid;
      include = [
        {
          model: Evento,
          as: "evento",
          attributes: ["id", "nombre", "fecha_hora"],
          include: [
            {
              model: Lugar,
              as: "lugar",
              attributes: ["id", "nombre"]
            }
          ]
        }
      ];
    }
    // Para propietarios (rol 3): ver comentarios de sus eventos con info del usuario
    else if (rol === 3) {
      include = [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["id", "nombre", "correo"]
        },
        {
          model: Evento,
          as: "evento",
          attributes: ["id", "nombre", "fecha_hora", "estado"],
          include: [
            {
              model: Lugar,
              as: "lugar",
              where: { propietarioid: usuarioid },
              attributes: ["id", "nombre"]
            }
          ]
        },
        {
          model: Usuario,
          as: "administracion",
          attributes: ["id", "nombre", "correo"]
        }
      ];
    }
    // Para roles 1 y 2: mantener la vista completa actual

    const comentarios = await Comentario.findAll({
      where,
      include,
      order: [['fecha_hora', 'DESC']],
      attributes: rol === 3 ? [
        'id',
        'contenido',
        'fecha_hora',
        'estado',
        'aprobacion',
        'motivo_reporte',
        'createdAt',
        'updatedAt',
        'administracion_id'
      ] : ['id', 'contenido', 'fecha_hora', 'estado']
    });

    // Formatear la respuesta según el rol
    if (rol === 8) {
      // Para usuarios: formato simplificado
      return comentarios.map(c => ({
        id: c.id,
        contenido: c.contenido,
        fecha_hora: c.fecha_hora,
        evento: {
          nombre: c.evento.nombre,
          fecha: c.evento.fecha_hora,
          lugar: c.evento.lugar.nombre
        }
      }));
    } else if (rol === 3) {
      // Para propietarios: formato con información relevante
      return comentarios.map(c => ({
        id: c.id,
        contenido: c.contenido,
        estado: c.estado,
        fechas: {
          comentario: c.fecha_hora,
          creacion: c.createdAt,
          ultima_actualizacion: c.updatedAt
        },
        estado_revision: {
          aprobacion: c.aprobacion,
          motivo_reporte: c.motivo_reporte,
          revisado_por: c.administracion ? {
            id: c.administracion.id,
            nombre: c.administracion.nombre,
            correo: c.administracion.correo
          } : null
        },
        usuario: {
          id: c.usuario.id,
          nombre: c.usuario.nombre,
          correo: c.usuario.correo
        },
        evento: {
          id: c.evento.id,
          nombre: c.evento.nombre,
          estado: c.evento.estado,
          fecha: c.evento.fecha_hora,
          lugar: {
            id: c.evento.lugar.id,
            nombre: c.evento.lugar.nombre
          }
        },
        tiempo_transcurrido: {
          desde_creacion: this.calcularTiempoTranscurrido(c.createdAt),
          desde_ultima_actualizacion: this.calcularTiempoTranscurrido(c.updatedAt)
        }
      }));
    }

    return comentarios; // Para roles 1 y 2: retornar toda la información
  }

  // Buscar un comentario específico
  async buscarComentario(id) {
    return await Comentario.findOne({
      where: { 
        id,
        estado: true 
      },
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["nombre", "correo"]
        },
        {
          model: Evento,
          as: "evento",
          attributes: ["nombre"]
        }
      ]
    });
  }

  // Listar comentarios por evento
  async listarComentariosPorEvento(eventoid) {
    return await Comentario.findAll({
      where: { 
        eventoid,
        estado: true 
      },
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["id", "nombre"]
        }
      ],
      order: [['fecha_hora', 'DESC']]
    });
  }

  // Crear nuevo comentario
  async crearComentario(datos) {
    const { usuarioid, eventoid, contenido } = datos;
    
    // Solo verificamos que el evento exista
    const eventoExiste = await Evento.findByPk(eventoid);
    if (!eventoExiste) {
        throw new Error('El evento no existe');
    }

    // Creamos el comentario directamente
    return await Comentario.create({
        usuarioid,
        eventoid,
        contenido,
        fecha_hora: new Date(),
        estado: true,
        aprobacion: 'visible',
        motivo_reporte: null,
        administracion_id: null
    });
  }

  // Actualizar comentario (solo usuarios rol 8 y sus propios comentarios)
  async actualizarComentario(id, usuarioid, contenido, rol) {
    const comentario = await Comentario.findByPk(id);
    if (!comentario) {
      throw new Error('Comentario no encontrado');
    }

    // Solo usuarios (rol 8) pueden editar y solo sus propios comentarios
    if (rol !== 8) {
      throw new Error('Solo los usuarios pueden editar comentarios');
    }

    if (comentario.usuarioid !== usuarioid) {
      throw new Error('Solo puedes editar tus propios comentarios');
    }

    return await Comentario.update(
      { 
        contenido,
        fecha_hora: new Date()
      },
      { where: { id } }
    );
  }

  // Eliminar comentario (soft delete - solo roles 1 y 2)
  async eliminarComentario(id, usuarioid, rol) {
    const comentario = await Comentario.findByPk(id);
    if (!comentario) {
      throw new Error('Comentario no encontrado');
    }

    // Solo super admin y admin pueden eliminar
    if (rol !== 1 && rol !== 2) {
      throw new Error('No tienes permiso para eliminar este comentario');
    }

    return await Comentario.update(
      { 
        estado: false,
        aprobacion: 'eliminado',
        administracion_id: usuarioid
      },
      { where: { id } }
    );
  }

  // Reportar comentario (solo rol 3 - propietarios)
  async reportarComentario(id, motivo_reporte, usuarioid) {
    const comentario = await Comentario.findByPk(id, {
      include: [
        {
          model: Evento,
          as: 'evento',
          include: [
            {
              model: Lugar,
              as: 'lugar'
            }
          ]
        }
      ]
    });

    if (!comentario) {
      throw new Error('Comentario no encontrado');
    }

    // Verificar que el comentario pertenece a un evento del propietario
    if (comentario.evento.lugar.propietarioid !== usuarioid) {
      throw new Error('No tienes permiso para reportar este comentario');
    }

    return await Comentario.update(
      {
        aprobacion: 'reportado',
        motivo_reporte,
        administracion_id: usuarioid
      },
      { where: { id } }
    );
  }

  // Método auxiliar para calcular tiempo transcurrido
  calcularTiempoTranscurrido(fecha) {
    const ahora = new Date();
    const fechaAnterior = new Date(fecha);
    const diferencia = ahora - fechaAnterior;
    const minutos = Math.floor(diferencia / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (dias > 0) return `${dias} días`;
    if (horas > 0) return `${horas} horas`;
    return `${minutos} minutos`;
  }
}

module.exports = new ComentarioService();
