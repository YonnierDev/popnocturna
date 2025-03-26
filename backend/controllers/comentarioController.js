const ComentarioService = require('../service/comentarioService');

class ComentarioController {
    async listarComentarios(req, res) {
        try {
            const comentarios = await ComentarioService.listarComentarios();
            res.json(comentarios);
        } catch (error) {
            console.error("❌ Error en listarComentarios:", error);
            res.status(500).json({ mensaje: "Error en el servicio", error: error.message });
        }
    }

    async crearComentario(req, res) {
        try {
            const { id_user, id_evento, contenido } = req.body;
            const nuevoComentario = await ComentarioService.crearComentario({
                id_user,
                id_evento,
                contenido,
                fecha_hora: new Date()
            });
            res.status(201).json(nuevoComentario);
        } catch (error) {
            console.error("❌ Error en crearComentario:", error);
            res.status(500).json({ mensaje: "Error en el servicio", error: error.message });
        }
    }

    async actualizarComentario(req, res) {
        try {
            const { id } = req.params;
            const { contenido } = req.body;
            const comentario = await ComentarioService.actualizarComentario(id, { contenido });
            
            if (!comentario) {
                return res.status(404).json({ mensaje: "Comentario no encontrado" });
            }
            res.json(comentario);
        } catch (error) {
            console.error("❌ Error en actualizarComentario:", error);
            res.status(500).json({ mensaje: "Error en el servicio", error: error.message });
        }
    }

    async eliminarComentario(req, res) {
        try {
            const { id } = req.params;
            const resultado = await ComentarioService.eliminarComentario(id);
            
            if (!resultado) {
                return res.status(404).json({ mensaje: "Comentario no encontrado" });
            }
            res.json({ mensaje: "Comentario eliminado correctamente" });
        } catch (error) {
            console.error("❌ Error en eliminarComentario:", error);
            res.status(500).json({ mensaje: "Error en el servicio", error: error.message });
        }
    }

    async buscarComentario(req, res) {
        try {
            const { id } = req.params;
            const comentario = await ComentarioService.buscarComentario(id);
            
            if (!comentario) {
                return res.status(404).json({ mensaje: "Comentario no encontrado" });
            }
            res.json(comentario);
        } catch (error) {
            console.error("❌ Error en buscarComentario:", error);
            res.status(500).json({ mensaje: "Error en el servicio", error: error.message });
        }
    }

    async buscarComentariosPorUsuario(req, res) {
        try {
            const { id_user } = req.params;
            const comentarios = await ComentarioService.buscarComentariosPorUsuario(id_user);
            res.json(comentarios);
        } catch (error) {
            console.error("❌ Error en buscarComentariosPorUsuario:", error);
            res.status(500).json({ mensaje: "Error en el servicio", error: error.message });
        }
    }
}

module.exports = new ComentarioController(); 