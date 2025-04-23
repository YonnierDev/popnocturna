const eventoService = require("../service/eventoService");
const { Usuario, Evento } = require("../models");

class EventoController {
  async listarEventos(req, res) {
    try {
      const eventos = await eventoService.listarEventos(req.usuario);
      res.json({ mensaje: "Eventos obtenidos correctamente", datos: eventos });
    } catch (error) {
      res.status(500).json({ mensaje: "Error al listar eventos", error });
    }
  }

  async verEvento(req, res) {
    try {
      const evento = await eventoService.verEventoPorId(
        req.params.id,
        req.usuario.id
      );

      if (!evento) {
        return res.status(404).json({ mensaje: "Evento no encontrado" });
      }

      if ([1, 2].includes(req.usuario.rol)) {
        res.json({
          mensaje: "Evento encontrado",
          datos: evento,
        });
      } else if (req.usuario.rol === 3) {
        const eventoResumido = {
          nombre: evento.nombre,
          descripcion: evento.descripcion,
          capacidad: evento.capacidad,
          precio: evento.precio,
          fecha_hora: evento.fecha_hora,
          lugar: evento.lugar.nombre,
        };
        res.json({
          mensaje: "Evento encontrado",
          datos: eventoResumido,
        });
      } else {
        res
          .status(403)
          .json({ mensaje: "No tienes permisos para ver este evento" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ mensaje: "Error al obtener el evento", error: error.message });
    }
  }

  async crearEvento(req, res) {
    try {
      const usuario = await Usuario.findByPk(req.usuario.id);
      if (!usuario) {
        return res.status(404).json({ mensaje: "Usuario no encontrado" });
      }

      let nuevoEvento;

      if ([1, 2].includes(usuario.rolid)) {
        nuevoEvento = await eventoService.crearEventoPorAdmin(
          req.body,
          req.usuario.id
        );
      } else if (usuario.rolid === 3) {
        nuevoEvento = await eventoService.crearEventoPorPropietario(
          req.body,
          req.usuario.id
        );
      } else {
        return res
          .status(403)
          .json({ mensaje: "No tienes permisos para crear eventos" });
      }

      res.status(201).json({
        mensaje: "Evento creado correctamente",
        evento: nuevoEvento,
      });
    } catch (error) {
      res.status(500).json({
        mensaje: "Error al crear el evento",
        error: error.message,
      });
    }
  }

  async actualizarEvento(req, res) {
    try {
      const eventoActualizado = await eventoService.actualizarEvento(
        req.params.id,
        req.body,
        req.usuario.id
      );

      res.json({
        mensaje: "Evento actualizado correctamente",
        evento: eventoActualizado,
      });
    } catch (error) {
      res.status(500).json({
        mensaje: "Error al actualizar el evento",
        error: error.message,
      });
    }
  }

  async eliminarEvento(req, res) {
    try {
      await eventoService.eliminarEvento(req.params.id, req.usuario.id);
      res.json({ mensaje: "Evento eliminado correctamente" });
    } catch (error) {
      res.status(500).json({
        mensaje: "Error al eliminar el evento",
        error: error.message,
      });
    }
  }

  async verComentarios(req, res) {
    try {
      const comentarios = await eventoService.verComentarios(
        req.params.eventoId,
        req.usuario.id
      );
      res.json({ mensaje: "Comentarios obtenidos correctamente", comentarios });
    } catch (error) {
      res.status(500).json({ mensaje: "Error al obtener comentarios", error });
    }
  }

  async cambiarEstadoEvento(req, res) {
    try {
      const eventoId = req.params.id;
      const nuevoEstado = req.body.estado;

      if (![1, 2].includes(req.usuario.rol)) {
        return res
          .status(403)
          .json({
            mensaje: "No tienes permisos para cambiar el estado del evento",
          });
      }

      const evento = await Evento.findByPk(eventoId);
      if (!evento) {
        return res.status(404).json({ mensaje: "Evento no encontrado" });
      }

      evento.estado = nuevoEstado;
      await evento.save();

      res.json({ mensaje: "Estado del evento cambiado correctamente", evento });
    } catch (error) {
      res
        .status(500)
        .json({
          mensaje: "Error al cambiar el estado del evento",
          error: error.message,
        });
    }
  }
}

module.exports = new EventoController();
