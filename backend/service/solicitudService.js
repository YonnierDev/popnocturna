const { Solicitud, Usuario, Notificacion } = require("../models");
const { enviarNotificacion } = require("./fcmFirebase/fcmFirebaseService");

class SolicitudService {
  async crear(data) {
    return await Solicitud.create(data);
  }

  async obtenerTodas() {
    return await Solicitud.findAll({
      include: [
        {
          model: Usuario,
          as: "usuario",
          attributes: ["id", "nombre", "apellido"],
        },
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
    if (!solicitud) {
      throw { status: 404, mensaje: "Solicitud no encontrada" };
    }

    solicitud.estado = nuevoEstado;
    await solicitud.save();

    const estadoLower = nuevoEstado.toLowerCase();

    if (estadoLower === "aceptado" || estadoLower === "rechazado") {
      const usuario = await Usuario.findByPk(solicitud.usuario_id);
      if (!usuario) {
        throw { status: 404, mensaje: "Usuario no encontrado" };
      }

      const nuevoRolId = estadoLower === "aceptado" ? 3 : 4;
      await usuario.update({ rolid: nuevoRolId });

  
      if (usuario.device_token) {
        const titulo = `Tu solicitud fue ${estadoLower}`;
        const cuerpo =
          estadoLower === "aceptado"
            ? "¡Felicidades! Ahora eres colaborador."
            : "Tu solicitud fue rechazada. Puedes intentarlo nuevamente.";

        try {
          const resultado = await enviarNotificacion({
            token: usuario.device_token,
            titulo,
            cuerpo,
          });

          await Notificacion.create({
            remitente_id: 1,
            receptor_id: usuario_id,
            titulo,
            cuerpo,
            imagen: null,
            tipo: "estado_solicitud",
            leida: false,
          });

          console.log("✅ Notificación enviada y guardada correctamente.");
        } catch (errorNoti) {
          console.error(
            "❌ Error enviando o guardando notificación:",
            errorNoti.message
          );
        }
      }
    }

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
