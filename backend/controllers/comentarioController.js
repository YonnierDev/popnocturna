const comentarioService = require('../service/comentarioService');

class ComentarioController {

  async listarComentarios(req, res) {
    const { id, rol } = req.usuario;

    try {
      const comentarios = await comentarioService.listarPorRol(id, rol);
      res.json(comentarios);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async listarComentariosPorEvento(req, res) {
    const { eventoid } = req.params;
    const { limit, offset } = req.query;

    try {
      const comentarios = await comentarioService.listarComentariosPorEvento(eventoid, {
        limit: parseInt(limit) || 10,
        offset: parseInt(offset) || 0
      });
      res.json(comentarios);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async crearComentario(req, res) {
    try {
      const nuevoComentario = await comentarioService.crearComentario({
        ...req.body,
        usuarioid: req.usuario.id
      });
      res.status(201).json(nuevoComentario);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async actualizarComentario(req, res) {
    const { id } = req.params;
    const { contenido } = req.body;
    const { id: usuarioid, rol } = req.usuario;

    try {
      const actualizado = await comentarioService.actualizarComentario(id, usuarioid, contenido, rol);
      res.json({ mensaje: 'Comentario actualizado', actualizado });
    } catch (error) {
      res.status(403).json({ error: error.message });
    }
  }

  async eliminarComentario(req, res) {
    const { id } = req.params;
    const { id: usuarioid, rol } = req.usuario;

    try {
      await comentarioService.eliminarComentario(id, usuarioid, rol);
      res.status(204).send(); 
    } catch (error) {
      res.status(403).json({ error: error.message });
    }
  }

  async reportarComentario(req, res) {
    const { id } = req.params;
    const { motivo_reporte } = req.body;
    const { id: usuarioid } = req.usuario;

    try {
      await comentarioService.reportarComentario(id, motivo_reporte, usuarioid);
      res.status(200).json({ mensaje: 'Comentario reportado correctamente' });
    } catch (error) {
      res.status(403).json({ error: error.message });
    }
  }
}

module.exports = new ComentarioController();
