const ComentarioService = require('../service/comentarioService');

class ComentarioController {
  async listarComentarios(req, res) {
    try {
      const listaComentarios = await ComentarioService.listarComentariosConRelaciones();
      res.json(listaComentarios);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: "Error en el servicio", error });
    }
  }

  async buscarComentario(req, res) {
    try {
      const { id } = req.params;
      const comentario = await ComentarioService.buscarComentarioConRelaciones(id);

      if (!comentario) {
        return res.status(404).json({ mensaje: "Comentario no encontrado" });
      }

      res.json(comentario);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: "Error en el servicio", error });
    }
  }

  async crearComentario(req, res) {
    try {
      const { usuarioid, eventoid, contenido, fecha_hora } = req.body;
      const estado = true;

      const usuarioExistente = await ComentarioService.verificarUsuario(usuarioid);
      if (!usuarioExistente) {
        return res.status(400).json({ mensaje: "El usuario seleccionado no existe" });
      }

      if (!contenido || contenido.trim() === "") {
        return res.status(400).json({ mensaje: "El comentario no puede estar vacío" });
      }

      const nuevoComentario = await ComentarioService.crearComentario({
        usuarioid,
        eventoid,
        contenido,
        fecha_hora,
        estado
      });

      res.status(201).json(nuevoComentario);
    } catch (error) {
      console.error("Error al crear comentario:", error);
      res.status(500).json({ mensaje: "Error en el servicio", error: error.message });
    }
  }

  async cambiarEstadoComentario(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      const resultado = await ComentarioService.actualizarEstadoComentario(id, estado);

      if (resultado[0] === 0) {
        return res.status(404).json({ mensaje: "Comentario no encontrado" });
      }

      res.json({ mensaje: "Estado del comentario actualizado correctamente" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: "Error al actualizar estado", error });
    }
  }

  async actualizarComentario(req, res) {
    try {
      const { id } = req.params;
      const { usuarioid, contenido, fecha_hora, estado } = req.body;

      const comentario = await ComentarioService.buscarComentario(id);
      if (!comentario) {
        return res.status(404).json({ mensaje: "Comentario no encontrado" });
      }

      await ComentarioService.actualizarComentario(id, usuarioid, contenido, fecha_hora, estado);
      res.json({ mensaje: "Comentario actualizado correctamente" });
    } catch (error) {
      res.status(500).json({ mensaje: "Error al actualizar comentario", error: error.message });
    }
  }

  async eliminarComentario(req, res) {
    try {
      const { id } = req.params;

      const comentario = await ComentarioService.buscarComentario(id);
      if (!comentario) {
        return res.status(404).json({ mensaje: "Comentario no encontrado" });
      }

      await ComentarioService.eliminarComentario(id);
      res.json({ mensaje: "Comentario eliminado correctamente" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }
}

module.exports = new ComentarioController();
