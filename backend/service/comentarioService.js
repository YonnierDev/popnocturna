const { Comentario, Usuario, Evento, Lugar, Reserva } = require('../models');

class ComentarioService {
  async listarPorRol(usuarioId, rol) {
    switch (rol) {
      case 1:
      case 2:
        return this.listarComentariosAdmin();
      case 3:
        return this.listarComentariosPropietario(usuarioId);
      case 8:
        return this.listarComentariosUsuario(usuarioId);
      default:
        throw new Error('Rol no permitido para listar comentarios');
    }
  }

  async listarComentariosAdmin() {
    return await Comentario.findAll({
      include: [
        { model: Usuario, as: 'usuario', attributes: ['nombre', 'correo'] },
        {
          model: Evento,
          as: 'evento',
          attributes: ['nombre', 'fecha_hora'],
          include: { model: Lugar, as: 'lugar', attributes: ['nombre'] }
        },
        { model: Reserva, as: 'reserva', attributes: ['estado'] }
      ]
    });
  }

  async listarComentariosPropietario(propietarioId) {
    return await Comentario.findAll({
      include: [
        { model: Usuario, as: 'usuario', attributes: ['nombre'] },
        {
          model: Evento,
          as: 'evento',
          attributes: ['nombre'],
          include: {
            model: Lugar,
            as: 'lugar',
            attributes: ['nombre'],
            where: { usuarioid: propietarioId }
          }
        },
        { model: Reserva, as: 'reserva', attributes: ['estado'] }
      ]
    });
  }

  async listarComentariosUsuario(usuarioId) {
    return await Comentario.findAll({
      where: { usuarioid: usuarioId },
      include: [
        {
          model: Evento,
          as: 'evento',
          attributes: ['nombre'],
          include: { model: Lugar, as: 'lugar', attributes: ['nombre'] }
        }
      ]
    });
  }

  async listarComentariosPorEvento(eventoid, { limit, offset }) {
    return await Comentario.findAll({
      where: { eventoid, estado: true },
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] }
      ],
      order: [['fecha_hora', 'DESC']],
      limit,
      offset
    });
  }

  async crearComentario(datos) {
    const { usuarioid, eventoid, contenido } = datos;

    const eventoExiste = await Evento.findByPk(eventoid);
    if (!eventoExiste) throw new Error('El evento no existe');

    return await Comentario.create({
      usuarioid,
      eventoid,
      contenido,
      fecha_hora: new Date(),
      estado: true,
      aprobacion: 'visible',
      motivo_reporte: null,
      administracion_id: null
    });
  }

  async actualizarComentario(id, usuarioid, contenido, rol) {
    const comentario = await Comentario.findByPk(id);
    if (!comentario) throw new Error('Comentario no encontrado');

    if (rol !== 8 || comentario.usuarioid !== usuarioid) {
      throw new Error('No autorizado para editar este comentario');
    }

    return await Comentario.update(
      {
        contenido,
        fecha_hora: new Date()
      },
      { where: { id } }
    );
  }

  async eliminarComentario(id, usuarioid, rol) {
    const comentario = await Comentario.findByPk(id);
    if (!comentario) throw new Error('Comentario no encontrado');

    if (![1, 2].includes(rol)) {
      throw new Error('No tienes permiso para eliminar este comentario');
    }

    return await Comentario.update(
      {
        estado: false,
        aprobacion: 'eliminado',
        administracion_id: usuarioid
      },
      { where: { id } }
    );
  }

  async reportarComentario(id, motivo_reporte, usuarioid) {
    const comentario = await Comentario.findByPk(id, {
      include: [
        {
          model: Evento,
          as: 'evento',
          include: [{ model: Lugar, as: 'lugar' }]
        }
      ]
    });

    if (!comentario) throw new Error('Comentario no encontrado');

    if (comentario.evento.lugar.propietarioid !== usuarioid) {
      throw new Error('No autorizado para reportar este comentario');
    }

    return await Comentario.update(
      {
        aprobacion: 'reportado',
        motivo_reporte,
        administracion_id: usuarioid
      },
      { where: { id } }
    );
  }
}

module.exports = new ComentarioService();
