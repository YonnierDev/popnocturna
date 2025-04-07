const CalificacionService = require("../service/calificacionService");

class CalificacionController {
  async listarCalificaciones(req, res) {
    try {
      const listaCalificaciones =
        await CalificacionService.listarCalificaciones();
      res.json(listaCalificaciones);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }

  async crearCalificacion(req, res) {
    try {
      const { usuarioid, eventoid, puntuacion } = req.body;
      const estado = true;
      const usuarioExistente =
        await CalificacionService.verificarUsuario(usuarioid);
      if (!usuarioExistente) {
        return res
          .status(400)
          .json({ mensaje: "El usuario seleccionado no existe" });
      }
      const eventoExistente =
        await CalificacionService.verificarEvento(eventoid);
      if (!eventoExistente) {
        return res
          .status(400)
          .json({ mensaje: "El evento seleccionado no existe" });
      }

      const nuevaCalificacion = await CalificacionService.crearCalificacion(
        usuarioid,
        eventoid,
        puntuacion,
        estado
      );

      res.status(201).json(nuevaCalificacion);
    } catch (error) {
      console.error("Error al crear calificacion:", error);
      res
        .status(500)
        .json({ mensaje: "Error en el servicio", error: error.message });
    }
  }

  async cambiarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      const calificacion = await CalificacionService.buscarCalificacion(id);
      if (!calificacion) {
        return res.status(404).json({ mensaje: "Calificación no encontrada" });
      }

      await CalificacionService.actualizarEstado(id, estado);
      res.json({
        mensaje: "Estado de la calificación actualizado correctamente",
      });
    } catch (error) {
      console.error("Error al actualizar estado de la calificación:", error);
      res
        .status(500)
        .json({ mensaje: "Error en el servicio", error: error.message });
    }
  }

  async actualizarCalificacion(req, res) {
    try {
      const { id } = req.params;
      const { usuarioid, eventoid, puntuacion, estado } = req.body;

      const usuarioExistente =
        await CalificacionService.verificarUsuario(usuarioid);
      if (!usuarioExistente) {
        return res
          .status(400)
          .json({ mensaje: "El usuario seleccionado no existe" });
      }
      const eventoExistente =
        await CalificacionService.verificarEvento(eventoid);
      if (!eventoExistente) {
        return res
          .status(400)
          .json({ mensaje: "El evento seleccionado no existe" });
      }

      await CalificacionService.actualizarCalificacion(
        id,
        usuarioid,
        eventoid,
        puntuacion,
        estado
      );
      res.json({ mensaje: "Calificacion actualizado correctamente" });
    } catch (error) {
      res
        .status(500)
        .json({
          mensaje: "Error al actualizar calificacion",
          error: error.message,
        });
    }
  }

  async eliminarCalificacion(req, res) {
    try {
      const { id } = req.params;

      // Verificar si el Calificacion existe
      const Calificacion = await CalificacionService.buscarCalificacion(id);
      if (!Calificacion) {
        return res.status(404).json({ mensaje: "Calificacion no encontrado" });
      }

      await CalificacionService.eliminarCalificacion(id);
      res.json({ mensaje: "Calificacion eliminado correctamente" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }

  async buscarCalificacion(req, res) {
    try {
      const { id } = req.params;
      const Calificacion = await CalificacionService.buscarCalificacion(id);

      if (!Calificacion) {
        return res.status(404).json({ mensaje: "Calificacion no encontrado" });
      }

      res.json(Calificacion);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }
}

module.exports = new CalificacionController();
