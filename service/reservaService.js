const { sequelize, Usuario, Evento, Lugar, Reserva, Rol } = require("../models");
const { Op, where } = require("sequelize");

class ReservaService {
  // Listar reservas según rol
  async listarReservas({ offset, limit, estado, fechaDesde, fechaHasta }) {
    const where = {};
    if (estado) where.estado = estado;
    if (fechaDesde && fechaHasta) {
      where.fecha_hora = {
        [Op.between]: [fechaDesde, fechaHasta]
      };
    }

    const resultado = await Reserva.findAndCountAll({
      where,
      offset,
      limit,
      include: [
        { model: Usuario, as: "usuario", attributes: ["nombre", "correo"] },
        {
          model: Evento,
          as: "evento",
          attributes: ["id", "nombre", "portada", "fecha_hora"],
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

    // Asegurarse de que portada sea siempre un array
    resultado.rows = resultado.rows.map(reserva => {
      const reservaJson = reserva.get({ plain: true });
      if (reservaJson.evento) {
        reservaJson.evento.portada = Array.isArray(reservaJson.evento.portada)
          ? reservaJson.evento.portada
          : [reservaJson.evento.portada].filter(Boolean);
      }
      return reserva;
    });

    return resultado;
  }

  // Listar reservas para propietarios
  async listarReservasPorPropietario(usuarioid, { offset, limit, estado, fechaDesde, fechaHasta }) {
    const where = {};
    if (estado) where.estado = estado;
    if (fechaDesde && fechaHasta) {
      where.fecha_hora = {
        [Op.between]: [fechaDesde, fechaHasta]
      };
    }

    return await Reserva.findAndCountAll({
      where,
      offset,
      limit,
      include: [
        { model: Usuario, as: "usuario", attributes: ["nombre", "correo"] },
        {
          model: Evento,
          as: "evento",
          required: true,
          attributes: ["nombre", "fecha_hora"],
          include: [{
            model: Lugar,
            as: "lugar",
            required: true,
            where: { usuarioid }
          }]
        }
      ],
      order: [['fecha_hora', 'DESC']]
    });
  }

  // Listar reservas para usuarios normales
  async listarReservasPorUsuario(usuarioid, { offset, limit, estado, fechaDesde, fechaHasta }) {
    const where = { usuarioid };
    if (estado) where.estado = estado;
    if (fechaDesde && fechaHasta) {
      where.fecha_hora = {
        [Op.between]: [fechaDesde, fechaHasta]
      };
    }

    const resultado = await Reserva.findAndCountAll({
      where,
      offset,
      limit,
      attributes: ['id', 'numero_reserva', 'fecha_hora', 'aprobacion', 'estado', 'cantidad_entradas'],
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["id", "nombre", "correo"]
        },
        {
          model: Evento,
          as: "evento",
          attributes: ["id", "nombre", "portada", "fecha_hora"],
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

    // Asegurarse de que portada sea siempre un array
    resultado.rows = resultado.rows.map(reserva => {
      const reservaJson = reserva.get({ plain: true });
      if (reservaJson.evento) {
        reservaJson.evento.portada = Array.isArray(reservaJson.evento.portada)
          ? reservaJson.evento.portada
          : [reservaJson.evento.portada].filter(Boolean);
      }
      return reserva;
    });

    return resultado;
  }

  // Buscar reserva por número (insensible a mayúsculas/minúsculas)
  async buscarReservaPorNumero(numero_reserva) {
    console.log('Buscando reserva con número (servicio):', numero_reserva);

    const resultado = await Reserva.findOne({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('numero_reserva')),
        '=',
        numero_reserva.toLowerCase()
      ),
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["id", "nombre", "correo", "rolid"],
          include: [{
            model: Rol,
            as: "rol",
            attributes: ["id", "nombre"]
          }]
        },
        {
          model: Evento,
          as: "evento",
          attributes: ["id", "nombre", "fecha_hora", "lugarid"],
          include: [
            {
              model: Lugar,
              as: 'lugar',
              attributes: ['id', 'nombre', 'usuarioid']
            }
          ]
        }
      ]
    });

    console.log('Resultado de la búsqueda:', resultado ? 'Encontrado' : 'No encontrado');
    return resultado;
  }

  // Verificar disponibilidad y permisos para reservar
  async verificarDisponibilidad(eventoid, cantidadEntradas, usuarioid) {
    try {
      // Obtener información del evento
      const evento = await Evento.findByPk(eventoid, {
        attributes: ["id", "nombre", "fecha_hora", "estado", "capacidad", "precio", "lugarid", "usuarioid"],
        include: [{
          model: Lugar,
          as: "lugar",
          attributes: ["id", "nombre", "estado", "aprobacion", "usuarioid"]
        }]
      });

      // Verificar si el evento existe
      if (!evento) {
        return {
          tienePermiso: false,
          mensaje: "El evento no existe",
          capacidadDisponible: 0
        };
      }

      // Verificar si el usuario es el propietario del evento
      if (usuarioid && evento.usuarioid === usuarioid) {
        return {
          tienePermiso: false,
          mensaje: "No puedes reservar en tu propio evento",
          capacidadDisponible: 0
        };
      }

      // Verificar si el evento está activo
      if (!evento.estado) {
        return {
          tienePermiso: false,
          mensaje: "El evento está inactivo",
          capacidadDisponible: 0
        };
      }

      // Verificar si el lugar existe
      if (!evento.lugar) {
        return {
          tienePermiso: false,
          mensaje: "El lugar asociado al evento no existe",
          capacidadDisponible: 0
        };
      }

      // Verificar si el lugar está activo
      if (!evento.lugar.estado) {
        return {
          tienePermiso: false,
          mensaje: "El lugar del evento está inactivo",
          capacidadDisponible: 0
        };
      }

      // Verificar si el lugar está aprobado
      if (!evento.lugar.aprobacion) {
        return {
          tienePermiso: false,
          mensaje: "El lugar del evento no está aprobado",
          capacidadDisponible: 0
        };
      }

      // Obtener la suma de entradas ya reservadas
      const resultado = await Reserva.sum('cantidad_entradas', {
        where: {
          eventoid,
          estado: true,
          aprobacion: { [Op.in]: ["Pendiente", "Aprobado"] }
        }
      });

      const entradasReservadas = resultado || 0;
      const capacidadDisponible = evento.capacidad - entradasReservadas;

      return {
        tienePermiso: true,
        capacidadDisponible,
        entradasReservadas,
        capacidadTotal: evento.capacidad
      };
    } catch (error) {
      console.error("Error en verificarDisponibilidad:", error);
      return {
        tienePermiso: false,
        mensaje: error.message || "Error al verificar disponibilidad",
        capacidadDisponible: 0
      };
    }
  }

  // Obtener información de capacidad de un evento
  async obtenerEventoConCapacidad(eventoid) {
    try {
      const evento = await Evento.findByPk(eventoid, {
        attributes: ["id", "nombre", "capacidad"]
      });

      if (!evento) {
        throw new Error("Evento no encontrado");
      }

      const resultado = await Reserva.sum('cantidad_entradas', {
        where: {
          eventoid,
          estado: true,
          aprobacion: { [Op.in]: ["Pendiente", "Aprobado"] }
        }
      });

      const entradasReservadas = resultado || 0;

      return {
        ...evento.get({ plain: true }),
        entradasReservadas,
        capacidadDisponible: evento.capacidad - entradasReservadas
      };
    } catch (error) {
      console.error("Error en obtenerEventoConCapacidad:", error);
      throw error;
    }
  }

  // Método para compatibilidad con código existente
  async verificarEvento(eventoid, cantidadEntradas = 1) {
    try {
      const { tienePermiso, mensaje, capacidadDisponible } = await this.verificarDisponibilidad(
        eventoid,
        cantidadEntradas,
        null // No verificamos el usuario aquí para mantener compatibilidad
      );

      if (!tienePermiso) {
        throw new Error(mensaje || "No se pudo verificar el evento");
      }

      if (capacidadDisponible < cantidadEntradas) {
        throw new Error(`No hay suficiente capacidad disponible. Quedan ${capacidadDisponible} entradas.`);
      }

      return await Evento.findByPk(eventoid);
    } catch (error) {
      console.error("Error en verificarEvento:", error);
      throw error;
    }
  }

  // Verificar usuario
  async verificarUsuario(usuarioid) {
    const usuario = await Usuario.findByPk(usuarioid, {
      attributes: ["id", "nombre", "correo", "rolid"],
      include: [{
        model: Rol,
        as: "rol",
        attributes: ["id", "nombre"]
      }]
    });

    console.log('Resultado de la búsqueda de usuario:', usuario ? 'Encontrado' : 'No encontrado');
    return usuario;
  }

  // Crear nueva reserva
  async crearReserva(usuarioid, eventoid, aprobacion, estado, cantidad_entradas = 1) {
    // Establecer la fecha y hora actual si no se proporciona
    const fecha_hora = new Date();
    try {
      // Verificar si el usuario ya tiene una reserva para este evento
      const reservaExistente = await Reserva.findOne({
        where: { usuarioid, eventoid, estado: true }
      });

      if (reservaExistente) {
        throw new Error("Ya tienes una reserva activa para este evento");
      }

      // Obtener el último número de reserva
      const ultimaReserva = await Reserva.findOne({
        attributes: ['id'],
        order: [['id', 'DESC']]
      });

      // Generar el siguiente número de reserva secuencial
      const siguienteNumero = ultimaReserva ? ultimaReserva.id + 1 : 1;
      const numero_reserva = `RES-${String(siguienteNumero).padStart(3, '0')}`;

      const eventoVerificado = await this.verificarEvento(eventoid, cantidad_entradas);
      const usuario = await this.verificarUsuario(usuarioid);

      if (!usuario) {
        throw new Error("El usuario no existe");
      }

      const reserva = await Reserva.create({
        usuarioid,
        eventoid,
        fecha_hora, // Se usa la fecha y hora actual
        aprobacion,
        estado,
        numero_reserva,
        cantidad_entradas
      });

      // Obtener el evento con la información necesaria
      const eventoInfo = await Evento.findByPk(eventoid, {
        attributes: ["nombre"],
        include: [{
          model: Lugar,
          as: "lugar",
          attributes: ["nombre"]
        }]
      });

      // Construir la respuesta con los datos necesarios
      const respuesta = {
        id: reserva.id,
        numero_reserva: reserva.numero_reserva,
        fecha_hora: eventoInfo ? eventoInfo.fecha_hora : null,
        aprobacion: reserva.aprobacion,
        estado: reserva.estado,
        cantidad_entradas: reserva.cantidad_entradas,
        evento: {
          id: eventoInfo ? eventoInfo.id : null,
          nombre: eventoInfo ? eventoInfo.nombre : null,
          fecha_hora: eventoInfo ? eventoInfo.fecha_hora : null,
          lugar: eventoInfo && eventoInfo.lugar ? {
            id: eventoInfo.lugar.id,
            nombre: eventoInfo.lugar.nombre,
            ubicacion: eventoInfo.lugar.ubicacion
          } : null
        }
      };

      return respuesta;
    } catch (error) {
      console.error("Error en crearReserva:", error);
      throw error;
    }
  }

  // Actualizar reserva
  async actualizarReserva(id, datosActualizar) {
    const t = await sequelize.transaction();

    try {
      // Buscar la reserva existente
      const reserva = await Reserva.findByPk(id, { transaction: t });
      if (!reserva) {
        throw new Error("La reserva no existe");
      }

      // Verificar que haya datos para actualizar
      if (!datosActualizar || Object.keys(datosActualizar).length === 0) {
        await t.rollback();
        return reservaJson;
      }

      // Actualizar la reserva
      await reserva.update(datosActualizar, { transaction: t });

      // Confirmar la transacción
      await t.commit();

      // Obtener y retornar la reserva actualizada con sus relaciones
      return await Reserva.findByPk(id, {
        include: [
          {
            model: Evento,
            as: 'evento',
            include: [{
              model: Lugar,
              as: 'lugar',
              attributes: ['id', 'nombre', 'usuarioid']
            }],
            attributes: ['id', 'nombre', 'lugarid', 'fecha_hora', 'capacidad']
          },
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nombre', 'apellido', 'correo']
          }
        ]
      });
    } catch (error) {
      console.error("Error en actualizarReserva:", error);
      // Si hay un error, hacer rollback de la transacción
      if (t && !t.finished) {
        await t.rollback();
      }
      // Lanzar el error para que el controlador lo maneje
      throw error;
    }
  }

  // Eliminar reserva
  async eliminarReserva(id, usuarioid, rolid) {
    try {
      const reserva = await this.buscarReservaPorId(id);
      if (!reserva) {
        throw new Error("La reserva no existe");
      }

      // Solo administradores (rol 1 y 2) pueden eliminar cualquier reserva
      // Usuarios normales (rol 8) solo pueden eliminar sus propias reservas
      if (rolid !== 1 && rolid !== 2 && reserva.usuarioid !== usuarioid) {
        throw new Error("No tienes permiso para eliminar esta reserva");
      }

      return await Reserva.destroy({ where: { id } });
    } catch (error) {
      console.error("Error en eliminarReserva:", error);
      throw error;
    }
  }

  // Actualizar estado de reserva
  async actualizarEstado(id, estado) {
    try {
      await Reserva.update({ estado }, { where: { id } });
      return await this.buscarReservaPorId(id);
    } catch (error) {
      console.error("Error en actualizarEstado:", error);
      throw error;
    }
  }

  // Aprobar reserva
  async actualizarAprobacionPorNumero(numero_reserva, aprobacion) {
    try {
      await Reserva.update(
        { aprobacion },
        { where: { numero_reserva } }
      );
      return await this.buscarReservaPorNumero(numero_reserva);
    } catch (error) {
      console.error("Error en actualizarAprobacionPorNumero:", error);
      throw error;
    }
  }

  // Actualizar aprobación de reserva por número
  async actualizarAprobacionPorNumero(numeroReserva, aprobacion, usuarioId, rol) {
    const t = await sequelize.transaction();

    try {
      // Normalizar número de reserva
      const numeroNormalizado = numeroReserva.trim().toUpperCase();

      // Buscar la reserva con sus relaciones
      const reserva = await Reserva.findOne({
        where: { numero_reserva: numeroNormalizado },
        include: [
          {
            model: Evento,
            as: 'evento',
            include: [{
              model: Lugar,
              as: 'lugar',
              attributes: ['id', 'usuarioid']
            }]
          }
        ],
        transaction: t
      });

      if (!reserva) {
        throw new Error('Reserva no encontrada');
      }

      // Verificar permisos
      const esAdmin = [1, 2].includes(rol);
      const esPropietarioLugar = rol === 3 && reserva.evento?.lugar?.usuarioid === usuarioId;

      if (!esAdmin && !esPropietarioLugar) {
        throw new Error('No tienes permiso para aprobar/rechazar esta reserva');
      }

      // Actualizar estado de aprobación
      reserva.aprobacion = aprobacion.toLowerCase();
      await reserva.save({ transaction: t });

      // Confirmar transacción
      await t.commit();

      // Obtener la reserva actualizada con relaciones
      const reservaActualizada = await Reserva.findByPk(reserva.id, {
        include: [
          { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'correo'] },
          {
            model: Evento,
            as: 'evento',
            include: [{
              model: Lugar,
              as: 'lugar',
              attributes: ['id', 'nombre']
            }]
          }
        ]
      });

      return reservaActualizada;

    } catch (error) {
      // Revertir transacción en caso de error
      await t.rollback();
      console.error('Error en actualizarAprobacionPorNumero:', error);
      throw error; // Relanzar el error para manejarlo en el controlador
    }
  }

  // Métodos auxiliares
  async buscarReserva(id) {
    return await Reserva.findByPk(id);
  }

  async buscarReservaPorId(id) {
    return await Reserva.findByPk(id, {
      include: [
        { model: Usuario, as: "usuario", attributes: ["nombre", "correo"] },
        { model: Evento, as: "evento", attributes: ["nombre", "fecha_hora"] }
      ]
    });
  }

  /**
   * Actualiza el estado de aprobación de una reserva
   * @param {string} numeroReserva - Número de reserva (con o sin prefijo RES-)
   * @param {string} aprobacion - Nuevo estado (aceptado/rechazado/pendiente)
   * @param {number} usuarioId - ID del usuario que realiza la acción
   * @param {number} rol - Rol del usuario (1:admin, 2:staff, 3:propietario)
   * @returns {Promise<Object>} - Objeto con el resultado de la operación
   */
  async actualizarAprobacionReserva(numeroReserva, aprobacion, usuarioId, rol) {
    const t = await sequelize.transaction();

    try {
      // Normalizar número de reserva
      const numero = numeroReserva.replace(/\D/g, '').padStart(3, '0');
      const numeroNormalizado = `RES-${numero}`;

      // Buscar la reserva con sus relaciones
      const reserva = await Reserva.findOne({
        where: {
          numero_reserva: numeroNormalizado
        },
        include: [
          {
            model: Evento,
            as: 'evento',
            include: [{
              model: Lugar,
              as: 'lugar',
              attributes: ['id', 'usuarioid']
            }]
          },
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nombre', 'correo']
          }
        ],
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!reserva) {
        await t.rollback();
        return { success: false, mensaje: 'Reserva no encontrada', status: 404 };
      }

      // Validar permisos
      const esAdmin = [1, 2].includes(rol);
      const esPropietario = rol === 3 &&
        reserva.evento?.lugar?.usuarioid === usuarioId;

      if (!esAdmin && !esPropietario) {
        await t.rollback();
        return {
          success: false,
          mensaje: 'No tienes permiso para realizar esta acción',
          status: 403
        };
      }

      // Verificar si ya tiene el estado solicitado
      const aprobacionActual = reserva.aprobacion?.toLowerCase();
      const aprobacionSolicitada = aprobacion.toLowerCase();

      if (aprobacionActual === aprobacionSolicitada) {
        await t.rollback();
        return {
          success: true,
          mensaje: `La reserva ya se encuentra en estado "${aprobacionSolicitada}"`,
          data: {
            id: reserva.id,
            numero_reserva: reserva.numero_reserva,
            aprobacion: reserva.aprobacion,
            estado: reserva.estado,
            fecha_actualizacion: reserva.updatedAt
          },
          status: 200
        };
      }

      // Actualizar estado
      reserva.aprobacion = aprobacionSolicitada;
      await reserva.save({ transaction: t });

      // Confirmar transacción
      await t.commit();

      return {
        success: true,
        mensaje: `Reserva ${aprobacion} correctamente`,
        data: {
          id: reserva.id,
          numero_reserva: reserva.numero_reserva,
          aprobacion: reserva.aprobacion,
          estado: reserva.estado,
          fecha_actualizacion: reserva.updatedAt
        }
      };

    } catch (error) {
      await t.rollback();
      console.error('Error en actualizarAprobacionReserva:', error);
      return {
        success: false,
        mensaje: 'Error al actualizar la reserva',
        error: error.message,
        status: 500
      };
    }
  }

  // Obtener información detallada de una reserva con información básica del evento, lugar y usuario
  async obtenerReservaDetallada(reservaId) {
    try {
      const reserva = await Reserva.findByPk(reservaId, {
        attributes: [
          'id', 
          'numero_reserva',
          'fecha_hora',
          'aprobacion',
          'estado',
          'cantidad_entradas',
          'createdAt',
          'updatedAt'
        ],
        include: [
          {
            model: Evento,
            as: 'evento',
            attributes: ['nombre', 'fecha_hora'],
            include: [{
              model: Lugar,
              as: 'lugar',
              attributes: ['nombre']
            }]
          },
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['nombre']
          }
        ]
      });

      if (!reserva) {
        return { success: false, mensaje: 'Reserva no encontrada', status: 404 };
      }

      return { 
        success: true, 
        data: reserva 
      };
    } catch (error) {
      console.error('Error en obtenerReservaDetallada:', error);
      return { 
        success: false, 
        mensaje: 'Error al obtener la reserva', 
        error: error.message,
        status: 500 
      };
    }
  }

  /**
   * Obtiene las reservas pendientes de un usuario
   * @param {number} usuarioid - ID del usuario
   * @returns {Promise<Array>} Lista de reservas pendientes
   */
  async obtenerReservasPendientesPorUsuario(usuarioid) {
    try {
      const reservas = await Reserva.findAll({
        where: {
          usuarioid,
          estado: true, // Solo reservas activas
          aprobacion: 'pendiente' // Solo reservas pendientes
        },
        include: [
          {
            model: Evento,
            as: 'evento',
            attributes: ['id', 'nombre', 'fecha_hora', 'portada'],
            include: [
              {
                model: Lugar,
                as: 'lugar',
                attributes: ['id', 'nombre', 'ubicacion']
              }
            ]
          },
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nombre', 'correo']
          }
        ],
        order: [['fecha_hora', 'DESC']]
      });

      // Formatear la respuesta
      return reservas.map(reserva => {
        const reservaJson = reserva.get({ plain: true });
        
        // Asegurar que portada sea un array
        if (reservaJson.evento) {
          reservaJson.evento.portada = Array.isArray(reservaJson.evento.portada)
            ? reservaJson.evento.portada
            : [reservaJson.evento.portada].filter(Boolean);
        }

        return {
          id: reservaJson.id,
          numero_reserva: reservaJson.numero_reserva,
          fecha_hora: reservaJson.fecha_hora,
          cantidad_entradas: reservaJson.cantidad_entradas,
          aprobacion: reservaJson.aprobacion,
          estado: reservaJson.estado,
          evento: {
            id: reservaJson.evento?.id,
            nombre: reservaJson.evento?.nombre,
            fecha_hora: reservaJson.evento?.fecha_hora,
            portada: reservaJson.evento?.portada,
            lugar: {
              id: reservaJson.evento?.lugar?.id,
              nombre: reservaJson.evento?.lugar?.nombre,
              ubicacion: reservaJson.evento?.lugar?.ubicacion
            }
          },
          usuario: {
            id: reservaJson.usuario?.id,
            nombre: reservaJson.usuario?.nombre,
            correo: reservaJson.usuario?.correo
          }
        };
      });
    } catch (error) {
      console.error('Error en obtenerReservasPendientesPorUsuario:', error);
      throw error;
    }
  }
}

module.exports = new ReservaService();
