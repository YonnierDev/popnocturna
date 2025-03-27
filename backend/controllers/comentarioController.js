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
            const {usuarioid, contenido, fecha_hora} = req.body;
            
            const usuarioExistente = await ComentarioService.verificarUsuario(usuarioid);
            if (!usuarioExistente) {
                return res.status(400).json({ mensaje: "El usuario seleccionado no existe" });
            }   
    
            const nuevoComentario = await ComentarioService.crearComentario({
               usuarioid,
               contenido,
               fecha_hora
            });
    
            res.status(201).json(nuevoComentario);
        } catch (error) {
            console.error("Error detallado:", error);
            res.status(500).json({ 
                mensaje: "Error en el servicio", 
                error: error.message,
                stack: error.stack 
            });
        }
    }
    

    async actualizarComentario(req, res) {
        try {
            const { id } = req.params;
            const {usuarioid, contenido, fecha_hora} = req.body;
            
            const usuarioExistente = await ComentarioService.verificarUsuario(usuarioid);
            if (!usuarioExistente) {
                return res.status(400).json({ mensaje: "El usuario seleccionado no existe" });
            }  
            
            const ComentarioActualizado = await ComentarioService.actualizarComentario(id, usuarioid, contenido, fecha_hora);
            res.json(req.body);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: "Error en el servicio" });
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