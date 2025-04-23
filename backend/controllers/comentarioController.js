const ComentarioService = require("../service/comentarioService");

class ComentarioController {
  // Coincide con router.get('/comentarios', ...)
  async listarComentarios(req, res) {
    const { id, rol } = req.usuario;
    try {
      const comentarios = await ComentarioService.listarPorRol(id, rol);
      res.json(comentarios);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Coincide con router.get('/comentarios/evento/:eventoid', ...)
  async listarComentariosPorEvento(req, res) {
    const { eventoid } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    try {
      const comentarios = await ComentarioService.listarComentariosPorEvento(eventoid, {
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      res.json(comentarios);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Coincide con router.post('/comentario', ...)
  async crearComentario(req, res) {
    const { id: usuarioid } = req.usuario;
    try {
      const comentario = await ComentarioService.crearComentario({
        ...req.body,
        usuarioid
      });
      res.status(201).json(comentario);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Coincide con router.put('/comentario/:id', ...)
  async actualizarComentario(req, res) {
    const { id: usuarioid, rol } = req.usuario;
    const { id } = req.params;
    const { contenido } = req.body;
    try {
      await ComentarioService.actualizarComentario(id, usuarioid, contenido, rol);
      res.json({ mensaje: 'Comentario actualizado correctamente' });
    } catch (error) {
      res.status(403).json({ error: error.message });
    }
  }

  // Coincide con router.delete('/comentario/:id', ...)
  async eliminarComentario(req, res) {
    const { id: usuarioid, rol } = req.usuario;
    const { id } = req.params;
    try {
      await ComentarioService.eliminarComentario(id, usuarioid, rol);
      res.status(204).send();
    } catch (error) {
      res.status(403).json({ error: error.message });
    }
  }

  // Coincide con router.post('/comentario/:id/reportar', ...)
  async reportarComentario(req, res) {
    const { id: usuarioid } = req.usuario;
    const { id } = req.params;
    const { motivo_reporte } = req.body;
    try {
      await ComentarioService.reportarComentario(id, motivo_reporte, usuarioid);
      res.status(200).json({ mensaje: 'Comentario reportado correctamente' });
    } catch (error) {
      res.status(403).json({ error: error.message });
    }
  }
}

module.exports = new ComentarioController();
