const ComentarioService = require('../service/comentarioService');

class ComentarioController {
  // GET /comentarios
  async listarComentarios(req, res) {
    try {
      const usuarioid = req.usuario.id;
      const rol = req.usuario.rolid;
      
      const comentarios = await ComentarioService.listarComentarios(usuarioid, rol);
      res.json({
        mensaje: "Comentarios obtenidos exitosamente",
        datos: comentarios
      });
    } catch (error) {
      console.error('Error al listar comentarios:', error);
      res.status(500).json({ 
        mensaje: "Error al obtener comentarios",
        error: error.message 
      });
    }
  }

  // GET /comentarios/evento/:eventoid
  async listarComentariosPorEvento(req, res) {
    try {
      const { eventoid } = req.params;
      const usuarioid = req.usuario?.id;
      const rol = req.usuario?.rolid || 8;

      const comentarios = await ComentarioService.listarComentariosPorEvento(eventoid, usuarioid, rol);
      res.json({
        mensaje: "Comentarios del evento obtenidos exitosamente",
        datos: comentarios
      });
    } catch (error) {
      console.error('Error al listar comentarios del evento:', error);
      res.status(500).json({ 
        mensaje: "Error al obtener comentarios del evento",
        error: error.message 
      });
    }
  }

  // POST /comentario (solo usuarios rol 8)
  async crearComentario(req, res) {
    try {
      const { eventoid, contenido } = req.body;
      const usuarioid = req.usuario.id;
      const rol = req.usuario.rol;

      if (rol !== 8) {
        return res.status(403).json({
          mensaje: "Solo los usuarios pueden crear comentarios"
        });
      }

      if (!contenido || contenido.trim() === "") {
        return res.status(400).json({ 
          mensaje: "El comentario no puede estar vacío" 
        });
      }

      const nuevoComentario = await ComentarioService.crearComentario({
        usuarioid,
        eventoid,
        contenido
      });

      res.status(201).json({
        mensaje: "Comentario creado exitosamente",
        datos: nuevoComentario
      });
    } catch (error) {
      res.status(500).json({ 
        mensaje: error.message
      });
    }
  }

  // PUT /comentario/:id
  async actualizarComentario(req, res) {
    try {
      const { id } = req.params;
      const { contenido } = req.body;
      const usuarioid = req.usuario.id;
      const rol = req.usuario.rolid;

      if (!contenido || contenido.trim() === "") {
        return res.status(400).json({ 
          mensaje: "El comentario no puede estar vacío" 
        });
      }

      await ComentarioService.actualizarComentario(id, usuarioid, contenido, rol);

      res.json({ 
        mensaje: "Comentario actualizado correctamente" 
      });
    } catch (error) {
      console.error('Error al actualizar comentario:', error);
      if (error.message.includes('No tienes permiso')) {
        return res.status(403).json({ mensaje: error.message });
      }
      res.status(500).json({ 
        mensaje: "Error al actualizar el comentario",
        error: error.message 
      });
    }
  }

  // DELETE /comentario/:id (solo admin y propietario)
  async eliminarComentario(req, res) {
    try {
      const { id } = req.params;
      const usuarioid = req.usuario.id;
      const rol = req.usuario.rolid;

      await ComentarioService.eliminarComentario(id, usuarioid, rol);
      
      res.json({ 
        mensaje: "Comentario eliminado correctamente" 
      });
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      if (error.message.includes('No tienes permiso')) {
        return res.status(403).json({ mensaje: error.message });
      }
      res.status(500).json({ 
        mensaje: "Error al eliminar el comentario",
        error: error.message 
      });
    }
  }

  // POST /comentario/:id/reportar (solo propietarios)
  async reportarComentario(req, res) {
    try {
      const { id } = req.params;
      const { motivo_reporte } = req.body;
      const usuarioid = req.usuario.id;

      if (!motivo_reporte || motivo_reporte.trim() === "") {
        return res.status(400).json({ 
          mensaje: "El motivo del reporte es requerido" 
        });
      }

      // Validar que el usuario es propietario del evento relacionado
      const comentario = await Comentario.findByPk(id, {
        include: [{
          model: Evento,
          as: 'evento',
          attributes: ['propietario_id']
        }]
      });

      if (!comentario?.evento || comentario.evento.propietario_id !== usuarioid) {
        return res.status(403).json({
          mensaje: "Solo el propietario del evento puede reportar comentarios"
        });
      }

      const resultado = await ComentarioService.reportarComentario(
        id,
        motivo_reporte
      );

      res.status(200).json({
        mensaje: "Comentario reportado exitosamente",
        datos: resultado
      });
    } catch (error) {
      res.status(500).json({
        mensaje: "Error al reportar el comentario",
        error: error.message 
      });
    }
  }
}

// Exportar una instancia de la clase
const comentarioController = new ComentarioController();
module.exports = comentarioController;
