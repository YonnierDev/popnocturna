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
    console.log('=== Inicio de listarComentariosPropietario ===');
    console.log('Propietario ID:', propietarioId);

    try {
      const comentarios = await Comentario.findAll({
        where: { estado: true },
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

      console.log('Cantidad de comentarios encontrados:', comentarios.length);
      return comentarios;
    } catch (error) {
      console.error('Error en listarComentariosPropietario:', error);
      throw error;
    }
  }

  async listarComentariosUsuario(usuarioId) {
    console.log('=== Inicio de listarComentariosUsuario ===');
    console.log('Usuario ID:', usuarioId);

    try {
      const comentarios = await Comentario.findAll({
        where: { 
          usuarioid: usuarioId,
          estado: true 
        },
        include: [
          {
            model: Evento,
            as: "evento",
            attributes: ["id", "nombre", "fecha_hora"],
            include: { 
              model: Lugar, 
              as: "lugar", 
              attributes: ["id", "nombre"] 
            },
          },
        ],
        order: [['fecha_hora', 'DESC']]
      });

      console.log('Cantidad de comentarios encontrados:', comentarios.length);
      return comentarios;
    } catch (error) {
      console.error('Error en listarComentariosUsuario:', error);
      throw error;
    }
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
      console.log('=== Inicio de crear comentario ===');
      console.log('Datos recibidos:', data);

      // Validar que el evento exista
      const evento = await Evento.findByPk(data.eventoid);
      if (!evento) {
        console.log('Error: Evento no encontrado');
        throw new Error('El evento no existe');
      }

      // Validar que el usuario exista
      const usuario = await Usuario.findByPk(data.usuarioid);
      if (!usuario) {
        console.log('Error: Usuario no encontrado');
        throw new Error('El usuario no existe');
      }

      const comentario = await Comentario.create({
        usuarioid: data.usuarioid,
        eventoid: data.eventoid,
        contenido: data.contenido,
        fecha_hora: new Date(),
        estado: true,
        aprobacion: null
      });

      console.log('Comentario creado exitosamente:', comentario);
      return comentario;
    } catch (error) {
      console.error('Error detallado al crear comentario:', {
        message: error.message,
        stack: error.stack,
        data: data
      });
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
      console.log('=== Inicio de reportar comentario ===');
      console.log('Datos recibidos:', { id, motivo, usuarioid });

      const comentario = await this.obtenerPorId(id);
      if (!comentario) {
        throw new Error('Comentario no encontrado');
      }

      if (comentario.aprobacion === 'pendiente') {
        throw new Error('Este comentario ya ha sido reportado');
      }

      const actualizado = await Comentario.update(
        {
          aprobacion: 'pendiente',
          motivo_reporte: motivo,
          reportado_por: usuarioid,
          fecha_reporte: new Date()
        },
        { where: { id } }
      );

      if (!actualizado[0]) {
        throw new Error('Error al actualizar el comentario');
      }

      return await this.obtenerPorId(id);
    } catch (error) {
      console.error('Error en reportar:', error);
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
      console.log('=== Inicio de actualizarEstado ===');
      console.log('Datos recibidos:', { id, estado });

      // Validar que el estado sea válido
      const estadosValidos = ['aceptado', 'rechazado'];
      if (!estadosValidos.includes(estado)) {
        throw new Error('Estado no válido. Debe ser "aceptado" o "rechazado"');
      }

      // Buscar el comentario
      const comentario = await this.obtenerPorId(id);
      if (!comentario) {
        throw new Error('Comentario no encontrado');
      }

      // Verificar que el comentario esté reportado
      if (comentario.aprobacion !== 'pendiente') {
        throw new Error('Este comentario no está reportado');
      }

      // Actualizar el estado
      const [actualizado] = await Comentario.update(
        { 
          aprobacion: estado,
          // Si se rechaza, mantener el comentario activo pero marcado como rechazado
          // Si se acepta, desactivar el comentario
          estado: estado === 'aceptado' ? false : true
        },
        { where: { id } }
      );

      if (!actualizado) {
        throw new Error('No se pudo actualizar el estado del comentario');
      }

      // Obtener el comentario actualizado con toda la información
      const comentarioActualizado = await this.obtenerComentarioPorId(id);
      
      console.log('Estado actualizado exitosamente:', comentarioActualizado);
      return comentarioActualizado;
    } catch (error) {
      console.error('Error en actualizarEstado:', error);
      throw error;
    }
  }

  async obtenerPorEvento(eventoid) {
    try {
      console.log('=== Inicio de obtenerPorEvento ===');
      console.log('Evento ID:', eventoid);

      const comentarios = await Comentario.findAll({
        where: { 
          eventoid,
          estado: true 
        },
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nombre', 'correo']
          }
        ],
        order: [['fecha_hora', 'DESC']]
      });

      console.log('Cantidad de comentarios encontrados:', comentarios.length);
      return comentarios;
    } catch (error) {
      console.error('Error en obtenerPorEvento:', error);
      throw error;
    }
  }

  async obtenerPorEventoPropietario(eventoid, propietarioId) {
    try {
      console.log('=== Inicio de obtenerPorEventoPropietario ===');
      console.log('Evento ID:', eventoid, 'Propietario ID:', propietarioId);

      const comentarios = await Comentario.findAll({
        where: { 
          eventoid,
          estado: true 
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
            required: true,
            include: {
              model: Lugar,
              as: 'lugar',
              required: true,
              where: { usuarioid: propietarioId }
            }
          }
        ],
        order: [['fecha_hora', 'DESC']]
      });

      console.log('Cantidad de comentarios encontrados:', comentarios.length);
      return comentarios;
    } catch (error) {
      console.error('Error en obtenerPorEventoPropietario:', error);
      throw error;
    }
  }

  async obtenerReportados() {
    try {
      console.log('=== Inicio de obtenerReportados ===');

      const comentarios = await Comentario.findAll({
        where: { 
          aprobacion: 'pendiente',
          estado: true
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

      console.log('Cantidad de comentarios reportados encontrados:', comentarios.length);
      return comentarios;
    } catch (error) {
      console.error('Error en obtenerReportados:', error);
      throw error;
    }
  }
}

module.exports = new ComentarioService();
