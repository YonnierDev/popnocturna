const { Usuario, Evento, Lugar, Reserva } = require("../models");
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

  // Crear nueva reserva
  async crearReserva(usuarioid, eventoid, fecha_hora, aprobacion, estado) {
    return await Reserva.create({
      usuarioid,
      eventoid,
      fecha_hora,
      aprobacion,
      estado
    });
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

  async verificarUsuario(usuarioid) {
    return await Usuario.findByPk(usuarioid);
  }

  async verificarEvento(eventoid) {
    return await Evento.findByPk(eventoid);
  }
}

module.exports = new ReservaService();
