const { Usuario, Evento, Lugar, Reserva, Rol } = require("../models");
const { Op } = require("sequelize");

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

    return await Reserva.findAndCountAll({
      where,
      offset,
      limit,
      include: [
        { model: Usuario, as: "usuario", attributes: ["nombre", "correo"] },
        { model: Evento, as: "evento", attributes: ["nombre", "fecha_hora"] }
      ],
      order: [['fecha_hora', 'DESC']]
    });
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
        { 
          model: Usuario, 
          as: "usuario", 
          attributes: ["id", "nombre", "correo"] 
        },
        {
          model: Evento,
          as: "evento",
          required: true,
          attributes: ["id", "nombre", "fecha_hora", "descripcion"],
          include: [{
            model: Lugar,
            as: "lugar",
            required: true,
            attributes: ["id", "nombre", "usuarioid"],
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

    return await Reserva.findAndCountAll({
      where,
      offset,
      limit,
      include: [
        { model: Usuario, as: "usuario", attributes: ["nombre", "correo"] },
        { model: Evento, as: "evento", attributes: ["nombre", "fecha_hora"] }
      ],
      order: [['fecha_hora', 'DESC']]
    });
  }

  // Buscar reserva por número
  async buscarReservaPorNumero(numero_reserva) {
    return await Reserva.findOne({
      where: { numero_reserva },
      include: [
        { model: Usuario, as: "usuario", attributes: ["nombre", "correo"] },
        { model: Evento, as: "evento", attributes: ["nombre", "fecha_hora"] }
      ]
    });
  }

  // Verificar evento
  async verificarEvento(eventoid) {
    try {
      const evento = await Evento.findByPk(eventoid, {
        attributes: ["id", "nombre", "fecha_hora", "estado", "capacidad", "precio"],
        include: [{
          model: Lugar,
          as: "lugar",
          attributes: ["id", "nombre", "estado", "aprobacion"]
        }]
      });

      if (!evento) {
        throw new Error("El evento no existe");
      }

      if (!evento.estado) {
        throw new Error("El evento está inactivo");
      }

      return evento;
    } catch (error) {
      console.error("Error en verificarEvento:", error);
      throw error;
    }
  }

  // Crear nueva reserva
  async crearReserva(usuarioid, eventoid, fecha_hora, aprobacion, estado) {
    try {
      // Verificar que el evento existe y está activo
      const evento = await this.verificarEvento(eventoid);
      
      // Verificar que el usuario existe
      const usuario = await this.verificarUsuario(usuarioid);
      if (!usuario) {
        throw new Error("El usuario no existe");
      }

      // Generar número de reserva único más corto
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const numero_reserva = `RES${timestamp}${random}`;

      // Crear la reserva con todas las relaciones
      const reserva = await Reserva.create({
        usuarioid,
        eventoid,
        fecha_hora,
        aprobacion,
        estado,
        numero_reserva
      });

      // Obtener la reserva con todas sus relaciones
      return await Reserva.findByPk(reserva.id, {
        include: [
          { 
            model: Usuario, 
            as: "usuario", 
            attributes: ["id", "nombre", "correo"] 
          },
          {
            model: Evento,
            as: "evento",
            attributes: ["id", "nombre", "fecha_hora", "descripcion", "precio"],
            include: [{
              model: Lugar,
              as: "lugar",
              attributes: ["id", "nombre", "ubicacion"]
            }]
          }
        ]
      });
    } catch (error) {
      console.error("Error en crearReserva:", error);
      throw error;
    }
  }

  // Actualizar reserva
  async actualizarReserva(id, usuarioid, eventoid, fecha_hora, aprobacion, estado) {
    await Reserva.update(
      { usuarioid, eventoid, fecha_hora, aprobacion, estado },
      { where: { id } }
    );
    return await this.buscarReservaPorId(id);
  }

  // Eliminar reserva
  async eliminarReserva(id) {
    return await Reserva.destroy({ where: { id } });
  }

  // Actualizar estado de reserva
  async actualizarEstado(id, estado) {
    await Reserva.update({ estado }, { where: { id } });
    return await this.buscarReservaPorId(id);
  }

  // Aprobar reserva
  async actualizarAprobacionPorNumero(numero_reserva, aprobacion) {
    await Reserva.update(
      { aprobacion },
      { where: { numero_reserva } }
    );
    return await this.buscarReservaPorNumero(numero_reserva);
  }

  // Métodos auxiliares
  async buscarReservaPorId(id) {
    return await Reserva.findByPk(id, {
      include: [
        { model: Usuario, as: "usuario", attributes: ["nombre", "correo"] },
        { model: Evento, as: "evento", attributes: ["nombre", "fecha_hora"] }
      ]
    });
  }

  // Verificar usuario
  async verificarUsuario(usuarioid) {
    return await Usuario.findByPk(usuarioid, {
      attributes: ["id", "nombre", "correo", "rolid"],
      include: [{
        model: Rol,
        as: "rol",
        attributes: ["id", "nombre"]
      }]
    });
  }
}

module.exports = new ReservaService();
