const { Evento, Comentario, Usuario, Lugar } = require("../models");

class EventoService {
  async listarEventos(usuario) {
    const { rol, id: usuarioid } = usuario;

    if (rol === 1 || rol === 2) {
      return await Evento.findAll({
        where: { estado: true },
        include: [
          {
            model: Comentario,
            as: "comentarios",
            where: { estado: true },
            required: false,
          },
          { model: Lugar, as: "lugar" },
        ],
      });
    }

    if (rol === 3) {
      const eventos = await Evento.findAll({
        where: { estado: true, usuarioid },
        include: [
          {
            model: Comentario,
            as: "comentarios",
            where: { estado: true },
            required: false,
          },
          { model: Lugar, as: "lugar" },
        ],
      });

      if (eventos.length === 0) {
        return { mensaje: "Aún no tienes eventos asociados.", eventos: [] };
      }

      return eventos;
    }

    if (rol === 8) {
      return await Evento.findAll({
        where: { estado: true },
        include: [
          {
            model: Comentario,
            as: "comentarios",
            where: { estado: true },
            required: false,
          },
        ],
      });
    }

    throw new Error("Rol no autorizado para listar eventos");
  }

  async verEventoPorId(eventoId, usuarioId) {
    const evento = await Evento.findOne({
      where: { id: eventoId },
      include: [
        { model: Comentario, as: "comentarios" },
        { model: Lugar, as: "lugar" },
      ],
    });

    if (!evento) {
      throw new Error("Evento no encontrado");
    }

    const usuario = await Usuario.findByPk(usuarioId);
    if (![1, 2].includes(usuario.rol)) {
      if (usuario.rol === 3 && evento.lugar.usuarioid !== usuarioId) {
        throw new Error("No tienes permisos para ver este evento");
      }
    }

    return evento;
  }

  async crearEventoPorAdmin(data, usuarioid) {
    const usuario = await Usuario.findByPk(usuarioid);
    if (!usuario) throw new Error("Usuario no encontrado");

    if (![1, 2].includes(usuario.rolid)) {
      throw new Error("Solo administradores pueden usar este método");
    }

    return await Evento.create({
      ...data,
      estado: true,
      usuarioid,
    });
  }

  async crearEventoPorPropietario(data, usuarioid) {
    const usuario = await Usuario.findByPk(usuarioid);
    if (!usuario) throw new Error("Usuario no encontrado");

    if (usuario.rolid !== 3) {
      throw new Error("Solo propietarios pueden usar este método");
    }

    return await Evento.create({
      ...data,
      estado: false,
      usuarioid,
    });
  }

  async actualizarEvento(id, data, usuarioid) {
    const { lugarid, capacidad, precio, descripcion, fecha_hora, estado } =
      data;

    const evento = await Evento.findByPk(id);
    if (!evento) throw new Error("Evento no encontrado");

    const usuario = await Usuario.findByPk(usuarioid);
    if (!usuario) throw new Error("Usuario no encontrado");

    if (![1, 2].includes(usuario.rolid)) {
      throw new Error("No tienes permisos para actualizar el evento");
    }

    await Evento.update(
      { lugarid, capacidad, precio, descripcion, fecha_hora, estado },
      { where: { id } }
    );

    return await Evento.findByPk(id);
  }

  async eliminarEvento(id, usuarioid) {
    const evento = await Evento.findByPk(id);
    if (!evento) throw new Error("Evento no encontrado");

    const usuario = await Usuario.findByPk(usuarioid);
    if (!usuario || ![1, 2].includes(usuario.rolid)) {
      throw new Error("No tienes permisos para eliminar el evento");
    }

    await Evento.destroy({ where: { id } });
  }

  async verComentarios(eventoId, usuarioid) {
    const evento = await Evento.findByPk(eventoId);
    if (!evento) throw new Error("Evento no encontrado");

    const usuario = await Usuario.findByPk(usuarioid);

    if (usuario.rol === 8) {
      return await Comentario.findAll({
        where: { eventoId, usuarioid, estado: true },
        include: [
          { model: Usuario, as: "usuario", attributes: ["nombre", "apellido"] },
        ],
      });
    }

    if (usuario.rol === 3 && evento.usuarioid === usuarioid) {
      return await Comentario.findAll({
        where: { eventoId },
        include: [
          { model: Usuario, as: "usuario", attributes: ["nombre", "apellido"] },
        ],
      });
    }

    return await Comentario.findAll({
      where: { eventoId },
      include: [
        { model: Usuario, as: "usuario", attributes: ["nombre", "apellido"] },
      ],
    });
  }

  async cambiarEstadoEvento(id, nuevoEstado) {
    const evento = await Evento.findByPk(id);
    if (!evento) throw new Error("Evento no encontrado");

    evento.estado = nuevoEstado;
    await evento.save();

    return evento;
  }
}

module.exports = new EventoService();
