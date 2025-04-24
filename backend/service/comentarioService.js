const { Comentario, Usuario, Evento, Lugar } = require("../models");
const { Op } = require("sequelize");

class ComentarioService {
  async listarPorRol(usuarioId, rol) {
    switch (rol) {
      case 1:
      case 2:
        return this.listarComentariosAdmin();
      case 3:
        return this.listarComentariosPropietario(usuarioId);
      case 8:
        return this.listarComentariosUsuario(usuarioId);
      default:
        throw new Error("Rol no permitido para listar comentarios");
    }
  }

  async listarComentariosAdmin() {
    return await Comentario.findAll({
      include: [
        { model: Usuario, as: "usuario", attributes: ["nombre", "correo"] },
        {
          model: Evento,
          as: "evento",
          attributes: ["nombre", "fecha_hora"],
          include: { model: Lugar, as: "lugar", attributes: ["nombre"] },
        },
      ],
    });
  }

  async listarComentariosPropietario(propietarioId) {
    return await Comentario.findAll({
      include: [
        { 
          model: Usuario, 
          as: "usuario", 
          attributes: ["id", "nombre", "correo"] 
        },
        {
          model: Evento,
          as: "evento",
          required: true,
          attributes: ["id", "nombre", "fecha_hora"],
          include: {
            model: Lugar,
            as: "lugar",
            required: true,
            attributes: ["id", "nombre", "usuarioid"],
            where: { usuarioid: propietarioId }
          }
        }
      ],
      order: [['fecha_hora', 'DESC']]
    });
  }

  async listarComentariosUsuario(usuarioId) {
    return await Comentario.findAll({
      where: { usuarioid: usuarioId },
      include: [
        {
          model: Evento,
          as: "evento",
          attributes: ["nombre"],
          include: { model: Lugar, as: "lugar", attributes: ["nombre"] },
        },
      ],
    });
  }

  async listarComentariosPorEvento(eventoid, { limit, offset }) {
    return await Comentario.findAll({
      where: { eventoid, estado: true },
      include: [
        { model: Usuario, as: "usuario", attributes: ["id", "nombre"] },
      ],
      order: [["fecha_hora", "DESC"]],
      limit,
      offset,
    });
  }

  async crear(data) {
    try {
      return await Comentario.create({
        ...data,
        estado: true,
        aprobacion: null
      });
    } catch (error) {
      console.error('Error al crear comentario:', error);
      throw error;
    }
  }

  async obtenerPorId(id) {
    try {
      return await Comentario.findByPk(id);
    } catch (error) {
      console.error('Error al obtener comentario:', error);
      throw error;
    }
  }

  async actualizar(id, contenido) {
    try {
      const comentario = await this.obtenerPorId(id);
      if (!comentario) throw new Error('Comentario no encontrado');
      
      return await comentario.update({ contenido });
    } catch (error) {
      console.error('Error al actualizar comentario:', error);
      throw error;
    }
  }

  async eliminar(id) {
    try {
      const comentario = await this.obtenerPorId(id);
      if (!comentario) throw new Error('Comentario no encontrado');
      
      return await comentario.update({ estado: false });
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      throw error;
    }
  }

  async reportar(id, motivo, usuarioid) {
    try {
      console.log('=== Inicio de reportar en servicio ===');
      console.log('Parámetros recibidos:', { id, motivo, usuarioid });

      // Verificar que el comentario existe
      console.log('Buscando comentario con ID:', id);
      const comentario = await this.obtenerPorId(id);
      console.log('Comentario encontrado:', comentario);

      if (!comentario) {
        console.log('Error: Comentario no encontrado');
        throw new Error('Comentario no encontrado');
      }

      // Verificar que el comentario no esté ya reportado
      console.log('Estado actual del comentario:', {
        aprobacion: comentario.aprobacion,
        motivo_reporte: comentario.motivo_reporte
      });

      if (comentario.aprobacion === 'pendiente') {
        console.log('Error: Comentario ya reportado');
        throw new Error('Este comentario ya ha sido reportado');
      }

      // Actualizar el comentario
      console.log('Actualizando comentario con datos:', {
        aprobacion: 'pendiente',
        motivo_reporte: motivo,
        reportado_por: usuarioid,
        fecha_reporte: new Date()
      });

      const [updated] = await Comentario.update(
        {
          aprobacion: 'pendiente',
          motivo_reporte: motivo,
          reportado_por: usuarioid,
          fecha_reporte: new Date()
        },
        { where: { id } }
      );

      console.log('Resultado de la actualización:', updated);

      if (!updated) {
        console.log('Error: No se pudo actualizar el comentario');
        throw new Error('Error al actualizar el comentario');
      }

      // Obtener el comentario actualizado con toda la información
      console.log('Obteniendo comentario actualizado...');
      const comentarioActualizado = await this.obtenerPorId(id);
      console.log('Comentario actualizado:', comentarioActualizado);

      return comentarioActualizado;
    } catch (error) {
      console.error('Error detallado en reportar comentario:', {
        message: error.message,
        stack: error.stack,
        code: error.code
      });
      throw error;
    }
  }

  async obtenerComentarioPorId(id) {
    return await Comentario.findByPk(id, {
      include: [
        { 
          model: Usuario, 
          as: "usuario", 
          attributes: ["id", "nombre", "correo"] 
        },
        { 
          model: Evento, 
          as: "evento",
          required: true,
          attributes: ["id", "nombre", "descripcion", "fecha_hora", "estado", "capacidad", "precio", "lugarid"],
          include: [
            {
              model: Lugar,
              as: "lugar",
              required: true,
              attributes: ["id", "nombre", "usuarioid", "ubicacion", "descripcion", "estado"]
            }
          ]
        }
      ]
    });
  }

  async actualizarEstado(id, estado) {
    try {
      const comentario = await this.obtenerPorId(id);
      if (!comentario) throw new Error('Comentario no encontrado');
      
      return await comentario.update({ aprobacion: estado });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      throw error;
    }
  }

  async obtenerPorEvento(eventoid) {
    try {
      return await Comentario.findAll({
        where: { eventoid, estado: true },
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nombre', 'correo']
          },
          {
            model: Evento,
            as: 'evento',
            attributes: ['id', 'nombre', 'descripcion', 'fecha_hora'],
            include: [
              {
                model: Lugar,
                as: 'lugar',
                attributes: ['id', 'nombre']
              }
            ]
          }
        ],
        order: [['fecha_hora', 'DESC']]
      });
    } catch (error) {
      console.error('Error al obtener comentarios por evento:', error);
      throw new Error('Error al obtener los comentarios del evento');
    }
  }

  async obtenerReportados() {
    try {
      return await Comentario.findAll({
        where: { 
          aprobacion: 'pendiente'
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
        order: [['fecha_hora', 'DESC']]
      });
    } catch (error) {
      console.error('Error en obtenerReportados:', error);
      throw new Error('Error al obtener los comentarios reportados');
    }
  }
}

module.exports = new ComentarioService();
