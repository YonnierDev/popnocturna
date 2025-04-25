const { Evento, Comentario, Usuario, Lugar } = require("../models");
const { Op } = require("sequelize");

class EventoService {
  async listarEventosAdmin({ offset, limit, estado, fechaDesde, fechaHasta }) {
    const where = {};
    if (estado !== undefined) where.estado = estado;
    if (fechaDesde) where.fecha_hora = { [Op.gte]: fechaDesde };
    if (fechaHasta) where.fecha_hora = { [Op.lte]: fechaHasta };

    return await Evento.findAll({
      where,
      include: [
        { 
          model: Lugar, 
          as: "lugar",
          attributes: ['id', 'nombre', 'ubicacion', 'descripcion'],
          include: [
            {
              model: Usuario,
              as: "usuario",
              attributes: ['id', 'nombre', 'correo']
            }
          ]
        },
        {
          model: Comentario,
          as: "comentarios",
          where: { estado: true },
          required: false,
          include: [
            {
              model: Usuario,
              as: "usuario",
              attributes: ['id', 'nombre']
            }
          ]
        }
      ],
      order: [['fecha_hora', 'DESC']],
      offset,
      limit
    });
  }

  async listarEventosPorPropietario(propietarioId, { offset, limit, fechaDesde, fechaHasta }) {
    const where = { estado: true };
    if (fechaDesde) where.fecha_hora = { [Op.gte]: fechaDesde };
    if (fechaHasta) where.fecha_hora = { [Op.lte]: fechaHasta };

    return await Evento.findAll({
      where,
      include: [
        {
          model: Lugar,
          as: "lugar",
          where: { usuarioid: propietarioId },
          attributes: ['id', 'nombre', 'ubicacion', 'descripcion']
        },
        { 
          model: Comentario, 
          as: "comentarios",
          where: { estado: true },
          required: false,
          include: [
            {
              model: Usuario,
              as: "usuario",
              attributes: ['id', 'nombre']
            }
          ]
        }
      ],
      order: [['fecha_hora', 'DESC']],
      offset,
      limit
    });
  }

  async listarEventosPorUsuario(usuarioId, { offset, limit, fechaDesde, fechaHasta }) {
    const where = { estado: true }; // Solo eventos activos
    if (fechaDesde) where.fecha_hora = { [Op.gte]: fechaDesde };
    if (fechaHasta) where.fecha_hora = { [Op.lte]: fechaHasta };

    return await Evento.findAll({
      where,
      include: [
        { 
          model: Lugar, 
          as: "lugar",
          attributes: ['id', 'nombre', 'direccion', 'ciudad', 'pais']
        },
        { 
          model: Comentario, 
          as: "comentarios",
          where: { estado: true },
          required: false,
          include: [
            {
              model: Usuario,
              as: "usuario",
              attributes: ['id', 'nombre']
            }
          ]
        }
      ],
      order: [['fecha_hora', 'DESC']],
      offset,
      limit
    });
  }

  async verEventoAdmin(id) {
    return await Evento.findByPk(id, {
      include: [
        { 
          model: Lugar, 
          as: "lugar",
          attributes: ['id', 'nombre', 'ubicacion', 'descripcion'],
          include: [
            {
              model: Usuario,
              as: "usuario",
              attributes: ['id', 'nombre', 'correo']
            }
          ]
        },
        {
          model: Comentario,
          as: "comentarios",
          where: { estado: true },
          required: false,
          include: [
            {
              model: Usuario,
              as: "usuario",
              attributes: ['id', 'nombre']
            }
          ]
        }
      ]
    });
  }

  async verEventoPropietario(id, propietarioId) {
    try {
      console.log('\n=== Inicio verEventoPropietario ===');
      console.log('ID del evento:', id);
      console.log('ID del propietario:', propietarioId);

      const evento = await Evento.findOne({
        where: { id },
        include: [
          {
            model: Lugar,
            as: "lugar",
            where: { usuarioid: propietarioId },
            attributes: ['id', 'nombre', 'ubicacion', 'descripcion']
          },
          { 
            model: Comentario, 
            as: "comentarios",
            where: { estado: true },
            required: false,
            include: [
              {
                model: Usuario,
                as: "usuario",
                attributes: ['id', 'nombre']
              }
            ]
          }
        ]
      });

      if (!evento) {
        console.log('Error: Evento no encontrado o no pertenece al propietario');
        return null;
      }

      console.log('Evento encontrado:', evento.toJSON());
      return evento;
    } catch (error) {
      console.error("Error en verEventoPropietario:", error);
      throw error;
    }
  }

  async verEventoUsuario(id, usuarioId) {
    return await Evento.findOne({
      where: { id, estado: true },
      include: [
        { model: Lugar, as: "lugar" },
        { 
          model: Comentario, 
          as: "comentarios",
          where: { usuarioid: usuarioId, estado: true },
          required: false
        }
      ]
    });
  }

  async crearEventoAdmin(datos, usuarioid) {
    return await Evento.create({
      ...datos,
      estado: true,
      usuarioid
    });
  }

  async crearEventoPropietario(datos, propietarioId) {
    const lugar = await Lugar.findOne({ where: { usuarioid: propietarioId } });
    if (!lugar) throw new Error("No tienes lugares asociados");

    return await Evento.create({
      ...datos,
      estado: false,
      usuarioid: propietarioId,
      lugarid: lugar.id
    });
  }

  async actualizarEventoAdmin(id, datos) {
    console.log('\n=== Inicio actualizarEventoAdmin ===');
    console.log('ID del evento:', id);
    console.log('Datos a actualizar:', datos);

    const evento = await Evento.findByPk(id);
    console.log('Evento encontrado:', evento ? 'Sí' : 'No');
    
    if (!evento) {
      console.log('Error: Evento no encontrado');
      throw new Error("Evento no encontrado");
    }

    await evento.update(datos);
    console.log('Evento actualizado exitosamente');
    return evento;
  }

  async actualizarEventoPropietario(id, datos, propietarioId) {
    console.log('\n=== Inicio actualizarEventoPropietario ===');
    console.log('ID del evento:', id);
    console.log('ID del propietario:', propietarioId);
    console.log('Datos a actualizar:', datos);

    const evento = await Evento.findOne({
      where: { id },
      include: [{
        model: Lugar,
        as: "lugar",
        where: { usuarioid: propietarioId }
      }]
    });

    console.log('Evento encontrado:', evento ? 'Sí' : 'No');
    if (!evento) {
      console.log('Error: Evento no encontrado o no pertenece al propietario');
      throw new Error("Evento no encontrado o no tienes permisos para modificarlo");
    }

    await evento.update(datos);
    console.log('Evento actualizado exitosamente');
    return evento;
  }

  async eliminarEventoAdmin(id) {
    const evento = await Evento.findByPk(id);
    if (!evento) throw new Error("Evento no encontrado");
    await evento.destroy();
  }

  async eliminarEventoPropietario(id, propietarioId) {
    const evento = await Evento.findOne({
      where: { id },
      include: [{
        model: Lugar,
        as: "lugar",
        where: { usuarioid: propietarioId }
      }]
    });

    if (!evento) throw new Error("Evento no encontrado o no tienes permisos");
    await evento.destroy();
  }

  async verComentariosAdmin(eventoId) {
    return await Comentario.findAll({
      where: { eventoid: eventoId, estado: true },
      include: [
        { model: Usuario, as: "usuario", attributes: ["id", "nombre", "correo"] }
      ],
      order: [['fecha_hora', 'DESC']]
    });
  }

  async verComentariosPropietario(eventoId, propietarioId) {
    return await Comentario.findAll({
      where: { eventoid: eventoId, estado: true },
      include: [
        { model: Usuario, as: "usuario", attributes: ["id", "nombre", "correo"] },
        {
          model: Evento,
          as: "evento",
          include: [{
            model: Lugar,
            as: "lugar",
            where: { usuarioid: propietarioId }
          }]
        }
      ],
      order: [['fecha_hora', 'DESC']]
    });
  }

  async verComentariosUsuario(eventoId, usuarioId) {
    return await Comentario.findAll({
      where: { eventoid: eventoId, usuarioid: usuarioId, estado: true },
      include: [
        { model: Usuario, as: "usuario", attributes: ["id", "nombre", "correo"] }
      ],
      order: [['fecha_hora', 'DESC']]
    });
  }

  async cambiarEstadoEventoAdmin(id, estado) {
    const evento = await Evento.findByPk(id);
    if (!evento) throw new Error("Evento no encontrado");
    await evento.update({ estado });
    return evento;
  }

  async cambiarEstadoEventoPropietario(id, estado, propietarioId) {
    const evento = await Evento.findOne({
      where: { id },
      include: [{
        model: Lugar,
        as: "lugar",
        where: { usuarioid: propietarioId }
      }]
    });

    if (!evento) throw new Error("Evento no encontrado o no tienes permisos");
    await evento.update({ estado });
    return evento;
  }

  // Métodos públicos
  async listarEventosPublicos({ offset, limit, fechaDesde, fechaHasta }) {
    const where = { estado: true };
    if (fechaDesde) where.fecha_hora = { [Op.gte]: fechaDesde };
    if (fechaHasta) where.fecha_hora = { [Op.lte]: fechaHasta };

    return await Evento.findAll({
      where,
      include: [
        { 
          model: Lugar, 
          as: "lugar",
          attributes: ['id', 'nombre', 'ubicacion', 'descripcion']
        }
      ],
      attributes: ['id', 'nombre', 'descripcion', 'fecha_hora', 'precio', 'capacidad'],
      order: [['fecha_hora', 'DESC']],
      offset,
      limit
    });
  }

  async verEventoPublico(id) {
    return await Evento.findOne({
      where: { 
        id,
        estado: true
      },
      include: [
        { 
          model: Lugar, 
          as: "lugar",
          attributes: ['id', 'nombre', 'ubicacion', 'descripcion']
        },
        {
          model: Comentario,
          as: "comentarios",
          where: { estado: true },
          required: false,
          include: [
            {
              model: Usuario,
              as: "usuario",
              attributes: ['id', 'nombre']
            }
          ]
        }
      ],
      attributes: ['id', 'nombre', 'descripcion', 'fecha_hora', 'precio', 'capacidad']
    });
  }
}

module.exports = new EventoService();
