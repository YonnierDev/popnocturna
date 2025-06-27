const { Solicitud, Usuario } = require("../models");

class SolicitudService {
  async crear(data) {
    return await Solicitud.create(data);
  }

  async obtenerTodas() {
    return await Solicitud.findAll({
      include: [
        { model: Usuario, as: "usuario", attributes: ["id", "nombre"] },
      ],
      order: [["created_at", "DESC"]],
    });
  }

  async obtenerPorId(id) {
    const solicitud = await Solicitud.findByPk(id, {
      include: [{ model: Usuario, attributes: ["id", "nombre"] }],
    });

    if (!solicitud) {
      throw { status: 404, mensaje: "Solicitud no encontrada" };
    }

    return solicitud;
  }

  async obtenerPorUsuario(usuarioId) {
    return await Solicitud.findAll({
      where: { usuario_id: usuarioId },
      order: [["created_at", "DESC"]],
    });
  }

  async actualizar(id, data) {
    const solicitud = await Solicitud.findByPk(id);
    if (!solicitud) throw { status: 404, mensaje: "Solicitud no encontrada" };
    return await solicitud.update(data);
  }

  async actualizarEstado(id, nuevoEstado) {
    const solicitud = await Solicitud.findByPk(id);
    if (!solicitud) throw { status: 404, mensaje: "Solicitud no encontrada" };
    solicitud.estado = nuevoEstado;
    await solicitud.save();
    return { mensaje: "Estado actualizado correctamente" };
  }

  async eliminar(id) {
    const solicitud = await Solicitud.findByPk(id);
    if (!solicitud) throw { status: 404, mensaje: "Solicitud no encontrada" };
    await solicitud.destroy();
    return { mensaje: "Solicitud eliminada correctamente" };
  }
}

module.exports = new SolicitudService();
