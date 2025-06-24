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
      case 4:
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

  /**
   * Obtiene los usuarios que han comentado en un evento específico
   * @param {number} eventoid - ID del evento
   * @returns {Promise<Array>} Lista de usuarios que han comentado en el evento
   */
  async obtenerUsuariosComentariosEvento(eventoid) {
    try {
      console.log(`Buscando usuarios que comentaron en el evento ${eventoid}`);

      const comentarios = await Comentario.findAll({
        where: {
          eventoid,
          estado: true,
          aprobacion: 1 // Solo comentarios aceptados
        },
        include: [
          {
            model: Usuario,
            as: "usuario",
            attributes: ["id", "nombre", "correo"],
            required: true
          }
        ],
        attributes: [], // No necesitamos los datos del comentario, solo del usuario
        group: ['usuario.id'], // Agrupar por usuario para evitar duplicados
        raw: true
      });

      console.log(`Usuarios encontrados: ${comentarios.length}`);

      // Mapear los resultados para devolver solo los datos del usuario
      return comentarios.map(c => ({
        id: c['usuario.id'],
        nombre: c['usuario.nombre'],
        correo: c['usuario.correo']
      }));
    } catch (error) {
      console.error('Error en obtenerUsuariosComentariosEvento:', error);
      throw error;
    }
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

      // Crear el comentario con estado 'rechazado' (2) por defecto
      const comentario = await Comentario.create({
        usuarioid: data.usuarioid,
        eventoid: data.eventoid,
        contenido: data.contenido,
        fecha_hora: new Date(),
        estado: true,
        aprobacion: data.aprobacion !== undefined ? data.aprobacion : 2  // Usar el valor proporcionado o 2 (rechazado) por defecto
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

  /**
   * Obtiene un comentario específico de un usuario si existe y está activo
   * @param {number} usuarioid - ID del usuario
   * @param {number} comentarioId - ID del comentario
   * @returns {Promise<Object|null>} El comentario si existe y pertenece al usuario, null en caso contrario
   */
  async obtenerComentarioUsuario(usuarioid, comentarioId) {
    try {
      return await Comentario.findOne({
        where: {
          id: comentarioId,
          usuarioid,
          estado: true
        },
        attributes: ['id', 'contenido', 'eventoid', 'usuarioid']
      });
    } catch (error) {
      console.error('Error al obtener comentario del usuario:', error);
      throw error;
    }
  }

  /**
   * Actualiza un comentario existente
   * @param {number} id - ID del comentario a actualizar
   * @param {Object} datos - Datos a actualizar
   * @returns {Promise<Object>} El comentario actualizado
   */
  async actualizar(id, datos) {
    try {
      const comentario = await Comentario.findByPk(id);
      if (!comentario) {
        throw new Error('Comentario no encontrado');
      }

      // Solo permitir actualizar el contenido
      const datosActualizacion = {
        contenido: datos.contenido,
        updatedAt: new Date()
      };

      return await comentario.update(datosActualizacion);
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
      console.log('=== Inicio de obtenerPorEvento (Admin) ===');
      console.log('Evento ID:', eventoid);

      const comentarios = await Comentario.findAll({
        where: {
          eventoid
          // Sin filtros de estado o aprobación para admins
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
            attributes: ['id', 'nombre']
          }
        ],
        order: [['fecha_hora', 'DESC']],
        paranoid: false // Esto incluirá registros eliminados lógicamente (soft delete)
      });

      console.log('Total de comentarios encontrados (incluyendo inactivos):', comentarios.length);
      return comentarios;
    } catch (error) {
      console.error('Error en obtenerPorEvento (Admin):', error);
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

  async obtenerComentariosPendientesRechazados(eventoid) {
    return await Comentario.findAll({
      where: {
        eventoid,
        estado: true,
        aprobacion: [0, 2] // 0: pendiente, 2: rechazado
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
          attributes: ['id', 'nombre']
        }
      ],
      order: [['fecha_hora', 'DESC']]
    });
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
