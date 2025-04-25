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

  // Crear nueva reserva
  async crearReserva(usuarioid, eventoid, fecha_hora, aprobacion, estado) {
    try {
      const evento = await this.verificarEvento(eventoid);
      const usuario = await this.verificarUsuario(usuarioid);
      
      if (!usuario) {
        throw new Error("El usuario no existe");
      }

      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const numero_reserva = `RES${timestamp}${random}`;

      const reserva = await Reserva.create({
        usuarioid,
        eventoid,
        fecha_hora,
        aprobacion,
        estado,
        numero_reserva
      });

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
    try {
      const reserva = await this.buscarReservaPorId(id);
      if (!reserva) {
        throw new Error("La reserva no existe");
      }

      // Verificar que el usuario es el dueño de la reserva
      if (reserva.usuarioid !== usuarioid) {
        throw new Error("No tienes permiso para actualizar esta reserva");
      }

      await Reserva.update(
        { usuarioid, eventoid, fecha_hora, aprobacion, estado },
        { where: { id } }
      );
      return await this.buscarReservaPorId(id);
    } catch (error) {
      console.error("Error en actualizarReserva:", error);
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

  // Métodos auxiliares
  async buscarReservaPorId(id) {
    return await Reserva.findByPk(id, {
      include: [
        { model: Usuario, as: "usuario", attributes: ["nombre", "correo"] },
        { model: Evento, as: "evento", attributes: ["nombre", "fecha_hora"] }
      ]
    });
  }
}

module.exports = new ReservaService();
