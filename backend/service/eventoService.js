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
          attributes: ['id', 'nombre'],
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

  async listarEventosPorPropietario(propietarioId, { offset, limit, fechaDesde, fechaHasta, soloActivos = true }) {
    const where = {};

    // Filtros de fecha
    if (fechaDesde) where.fecha_hora = { [Op.gte]: fechaDesde };
    if (fechaHasta) where.fecha_hora = { ...where.fecha_hora, [Op.lte]: fechaHasta };

    return await Evento.findAll({
        where,
        include: [
            {
                model: Lugar,
                as: "lugar",
                where: { usuarioid: propietarioId },
                attributes: ['id', 'nombre']
            }
        ],
        order: [['fecha_hora', 'DESC']],  // Ordenar por fecha descendente
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
          attributes: ['id', 'nombre']
        },
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
          attributes: ['id', 'nombre'],
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
            attributes: ['id', 'nombre']
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
    console.log(`[eventoService.crearEventoPropietario] Iniciando para propietarioId: ${propietarioId}`);
    console.log('[eventoService.crearEventoPropietario] Datos recibidos:', JSON.stringify(datos, null, 2));

    const lugar = await Lugar.findOne({ where: { usuarioid: propietarioId } });
    if (!lugar) {
      console.error(`[eventoService.crearEventoPropietario] No se encontró lugar para propietarioId: ${propietarioId}`);
      throw new Error("No tienes lugares asociados");
    }
    console.log(`[eventoService.crearEventoPropietario] Lugar encontrado: ${lugar.id} para propietarioId: ${propietarioId}`);

    const datosParaCrear = {
      ...datos,
      estado: false,
      usuarioid: propietarioId,
      lugarid: lugar.id
    };
    console.log('[eventoService.crearEventoPropietario] Datos para Evento.create:', JSON.stringify(datosParaCrear, null, 2));

    try {
      const nuevoEvento = await Evento.create(datosParaCrear);
      console.log('[eventoService.crearEventoPropietario] Evento.create completado. Resultado:', JSON.stringify(nuevoEvento, null, 2));
      // Forzar una lectura desde la BD para confirmar
      const eventoDesdeDB = await Evento.findByPk(nuevoEvento.id);
      console.log('[eventoService.crearEventoPropietario] Evento leído desde DB después de crear:', JSON.stringify(eventoDesdeDB, null, 2));
      
      if (!eventoDesdeDB) {
          console.error('[eventoService.crearEventoPropietario] ¡ALERTA! El evento creado NO se encontró en la BD inmediatamente después.');
      }
      return nuevoEvento; // O quizás eventoDesdeDB si quieres estar seguro de que es de la BD
    } catch (error) {
      console.error('[eventoService.crearEventoPropietario] Error durante Evento.create:', error);
      throw error; // Re-lanzar el error para que el controlador lo maneje
    }
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

  async actualizarEventoPropietario(id, datosActualizar, propietarioId) {
    console.log('\n=== Inicio actualizarEventoPropietario ===');
    console.log('ID del evento:', id);
    console.log('ID del propietario:', propietarioId);
    console.log('Datos a actualizar (antes de filtrar undefined):', datosActualizar);

    const evento = await Evento.findOne({
      where: { id },
      include: [{
        model: Lugar,
        as: "lugar",
        where: { usuarioid: propietarioId }
      }]
    });

    if (!evento) {
      console.log('Error: Evento no encontrado o no pertenece al propietario');
      throw new Error("Evento no encontrado o no tienes permisos para modificarlo");
    }

    // Filtrar campos undefined para no sobrescribir innecesariamente
    const camposParaActualizar = {};
    for (const key in datosActualizar) {
      if (datosActualizar[key] !== undefined) {
        camposParaActualizar[key] = datosActualizar[key];
      }
    }
    
    console.log('Campos finales para actualizar en DB:', camposParaActualizar);

    // Si camposParaActualizar está vacío (ej. solo se envió ID en params y nada en body/files), 
    // podríamos optar por no hacer el update o devolver el evento tal cual.
    // Por ahora, si está vacío, .update({}) no debería hacer nada o fallar controladamente.
    if (Object.keys(camposParaActualizar).length === 0) {
        console.log('No hay campos para actualizar después de filtrar.');
        return evento; // Devuelve el evento sin cambios si no hay nada que actualizar
    }

    await evento.update(camposParaActualizar);
    console.log('Evento actualizado exitosamente en DB');
    
    return evento.reload(); // .reload() para obtener el estado más reciente con asociaciones

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

    if (!evento) {
      throw new Error("Evento no encontrado o no tienes permisos para eliminarlo");
    }

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
          attributes: ['id', 'nombre']
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
