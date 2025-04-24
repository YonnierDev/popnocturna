const ComentarioService = require('../service/comentarioService');

class ComentarioController {
    // Crear un nuevo comentario
    async crear(req, res) {
        try {
            const { id: usuarioid, rol } = req.usuario;
            if (rol !== 8) {
                return res.status(403).json({ mensaje: "Solo los usuarios pueden comentar" });
            }

            const { eventoid, contenido } = req.body;
            const comentario = await ComentarioService.crear({
                usuarioid,
                eventoid,
                contenido,
                fecha_hora: new Date()
            });

            res.status(201).json(comentario);
        } catch (error) {
            console.error('Error al crear comentario:', error);
            res.status(500).json({ mensaje: "Error al crear el comentario" });
        }
    }

    // Actualizar un comentario
    async actualizar(req, res) {
        try {
            const { id: usuarioid, rol } = req.usuario;
            const { id } = req.params;
            const { contenido } = req.body;

            const comentario = await ComentarioService.obtenerPorId(id);
            if (!comentario) {
                return res.status(404).json({ mensaje: "Comentario no encontrado" });
            }

            if (rol === 8 && comentario.usuarioid !== usuarioid) {
                return res.status(403).json({ mensaje: "No tienes permiso para editar este comentario" });
            }

            const actualizado = await ComentarioService.actualizar(id, contenido);
            res.json(actualizado);
        } catch (error) {
            console.error('Error al actualizar comentario:', error);
            res.status(500).json({ mensaje: "Error al actualizar el comentario" });
        }
    }

    // Eliminar un comentario
    async eliminar(req, res) {
        try {
            const { id: usuarioid, rol } = req.usuario;
            const { id } = req.params;

            const comentario = await ComentarioService.obtenerPorId(id);
            if (!comentario) {
                return res.status(404).json({ mensaje: "Comentario no encontrado" });
            }

            if (![1, 2].includes(rol) && (rol !== 8 || comentario.usuarioid !== usuarioid)) {
                return res.status(403).json({ mensaje: "No tienes permiso para eliminar este comentario" });
            }

            await ComentarioService.eliminar(id);
            res.json({ mensaje: "Comentario eliminado exitosamente" });
        } catch (error) {
            console.error('Error al eliminar comentario:', error);
            res.status(500).json({ mensaje: "Error al eliminar el comentario" });
        }
    }

    // Reportar un comentario
    async reportar(req, res) {
        try {
            console.log('=== Inicio de reportar comentario ===');
            console.log('Headers:', req.headers);
            console.log('Body:', req.body);
            console.log('Params:', req.params);
            console.log('Usuario:', req.usuario);

            // Verificar si el usuario está autenticado
            if (!req.usuario) {
                console.log('Error: Usuario no autenticado');
                return res.status(401).json({ mensaje: "Token inválido o expirado" });
            }

            const { id } = req.params;
            const { motivo } = req.body;
            const { usuarioid, rol } = req.usuario;

            console.log('Datos procesados:', {
                comentarioId: id,
                motivo,
                usuarioid,
                rol
            });

            // Verificar que el rol sea el correcto (3 para propietarios)
            if (rol !== 3) {
                console.log('Error: Rol incorrecto. Rol actual:', rol);
                return res.status(403).json({ mensaje: "Solo los propietarios pueden reportar comentarios" });
            }

            // Verificar que se proporcione un motivo
            if (!motivo) {
                console.log('Error: Motivo no proporcionado');
                return res.status(400).json({ mensaje: "Debe proporcionar un motivo para el reporte" });
            }

            console.log('Llamando al servicio para reportar comentario...');
            const actualizado = await ComentarioService.reportar(id, motivo, usuarioid);
            console.log('Comentario actualizado:', actualizado);

            res.json({
                mensaje: "Comentario reportado exitosamente",
                comentario: actualizado
            });
        } catch (error) {
            console.error('Error completo en reportar comentario:', {
                message: error.message,
                stack: error.stack
            });
            res.status(500).json({ 
                mensaje: "Error al reportar el comentario",
                error: error.message 
            });
        }
    }

    // Aprobar o rechazar un comentario reportado
    async actualizarEstado(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;

            const actualizado = await ComentarioService.actualizarEstado(id, estado);
            res.json({
                mensaje: "Estado del comentario actualizado exitosamente",
                comentario: actualizado
            });
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            res.status(500).json({ mensaje: "Error al actualizar el estado del comentario" });
        }
    }

    // Obtener comentarios por evento
    async obtenerPorEvento(req, res) {
        try {
            const { eventoid } = req.params;
            const comentarios = await ComentarioService.obtenerPorEvento(eventoid);
            res.json(comentarios);
        } catch (error) {
            console.error('Error al obtener comentarios:', error);
            res.status(500).json({ mensaje: "Error al obtener los comentarios" });
        }
    }

    // Obtener comentarios reportados
    async listarReportados(req, res) {
        try {
            const comentarios = await ComentarioService.obtenerReportados();
            
            if (!comentarios || comentarios.length === 0) {
                return res.json({
                    mensaje: "No hay comentarios reportados pendientes de revisión",
                    comentarios: []
                });
            }

            res.json({
                mensaje: "Comentarios reportados obtenidos exitosamente",
                comentarios
            });
        } catch (error) {
            console.error('Error en listarReportados:', error);
            res.status(500).json({ 
                mensaje: "Error al obtener los comentarios reportados",
                error: error.message 
            });
        }
    }

    // Obtener comentarios según el rol del usuario
    async obtenerComentarios(req, res) {
        try {
            const { id: usuarioid, rol } = req.usuario;
            let comentarios;

            if ([1, 2].includes(rol)) {
                // Admin y SuperAdmin ven todos los comentarios
                comentarios = await ComentarioService.listarComentariosAdmin();
            } else if (rol === 3) {
                // Propietarios ven solo comentarios de sus eventos
                comentarios = await ComentarioService.listarComentariosPropietario(usuarioid);
            } else if (rol === 8) {
                // Usuarios ven solo sus propios comentarios
                comentarios = await ComentarioService.listarComentariosUsuario(usuarioid);
            } else {
                return res.status(403).json({ mensaje: "No tienes permiso para ver los comentarios" });
            }

            res.json({
                mensaje: "Comentarios obtenidos exitosamente",
                comentarios
            });
        } catch (error) {
            console.error('Error al obtener comentarios:', error);
            res.status(500).json({ 
                mensaje: "Error al obtener los comentarios",
                error: error.message 
            });
        }
    }
}

module.exports = new ComentarioController();
