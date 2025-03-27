const ComentarioService = require('../service/comentarioService');

class ComentarioController {
    async listarComentarios(req, res) {
        try {
            const listaComentarios = await ComentarioService.listarComentarios();
            res.json(listaComentarios);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: "Error en el servicio" });
        }
    }

    async crearComentario(req, res) {
        try {
            const { usuarioid, contenido, fecha_hora } = req.body;

            const usuarioExistente = await ComentarioService.verificarUsuario(usuarioid);
            if (!usuarioExistente) {
                return res.status(400).json({ mensaje: "El usuario seleccionado no existe" });
            }

            if (!contenido || contenido.trim() === "") {
                return res.status(400).json({ mensaje: "El comentario no puede estar vacío" });
            }

            const nuevoComentario = await ComentarioService.crearComentario(usuarioid, contenido, fecha_hora);

            res.status(201).json(nuevoComentario);
        } catch (error) {
            console.error("Error al crear comentario:", error);
            res.status(500).json({ mensaje: "Error en el servicio", error: error.message });
        }
    }
    

    async actualizarComentario(req, res) {
        try {
            const { id } = req.params;
            const { usuarioid, contenido, fecha_hora } = req.body;

            const comentario = await ComentarioService.buscarComentario(id);
            if (!comentario) {
                return res.status(404).json({ mensaje: "Comentario no encontrado" });
            }

            await ComentarioService.actualizarComentario(id, usuarioid, contenido, fecha_hora);
            res.json({ mensaje: "Comentario actualizado correctamente" });
        } catch (error) {
            res.status(500).json({ mensaje: "Error al actualizar comentario", error: error.message });
        }
    }

    async eliminarComentario(req, res) {
        try {
            const { id } = req.params;
            
            // Verificar si el Comentario existe
            const Comentario = await ComentarioService.buscarComentario(id);
            if (!Comentario) {
                return res.status(404).json({ mensaje: "Comentario no encontrado" });
            }

            await ComentarioService.eliminarComentario(id);
            res.json({ mensaje: "Comentario eliminado correctamente" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: "Error en el servicio" });
        }
    }

    async buscarComentario(req, res) {
        try {
            const { id } = req.params;
            const Comentario = await ComentarioService.buscarComentario(id);
            
            if (!Comentario) {
                return res.status(404).json({ mensaje: "Comentario no encontrado" });
            }
            
            res.json(Comentario);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: "Error en el servicio" });
        }
    }
}

module.exports = new ComentarioController();