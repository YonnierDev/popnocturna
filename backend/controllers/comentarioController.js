const ComentarioService = require('../service/comentarioService');

class ComentarioController {
    // Crear un nuevo comentario
    async crear(req, res) {
        try {
            console.log('=== Inicio de crear comentario en controlador ===');
            console.log('Datos recibidos:', req.body);
            console.log('Usuario autenticado:', req.usuario);

            const { id: usuarioid, rol } = req.usuario;
            if (rol !== 4) {
                return res.status(403).json({ mensaje: "Solo los usuarios pueden comentar" });
            }

            const { eventoid, contenido } = req.body;

            // Validar que se proporcionen todos los datos necesarios
            if (!eventoid || !contenido) {
                return res.status(400).json({ 
                    mensaje: "Faltan datos requeridos",
                    detalles: {
                        eventoid: !eventoid ? "El ID del evento es requerido" : null,
                        contenido: !contenido ? "El contenido del comentario es requerido" : null
                    }
                });
            }

            // Validar longitud del contenido
            if (contenido.length > 500) {
                return res.status(400).json({ 
                    mensaje: "El contenido del comentario excede el límite de caracteres",
                    maximo: 500,
                    actual: contenido.length
                });
            }

            const comentario = await ComentarioService.crear({
                usuarioid,
                eventoid,
                contenido,
                fecha_hora: new Date()
            });

            // Obtener io para enviar notificaciones
            const io = req.app.get('io');

            // Obtener todos los usuarios que han comentado en este evento
            const usuariosComentarios = await ComentarioService.obtenerUsuariosComentariosEvento(eventoid);

            // Notificar solo a los usuarios que han comentado en el mismo evento
            usuariosComentarios.forEach(usuario => {
                if (usuario.id !== usuarioid) { // No notificar al usuario que hizo el comentario
                    io.to(`usuario-${usuario.id}`).emit('nuevo-comentario-usuario', {
                        evento: {
                            id: eventoid,
                            nombre: comentario.evento?.nombre || 'Evento'
                        },
                        comentario: {
                            contenido: comentario.contenido,
                            usuarioid: comentario.usuarioid
                        },
                        timestamp: new Date().toISOString()
                    });
                }
            });

            res.status(201).json({
                mensaje: "Comentario creado exitosamente",
                comentario
            });
        } catch (error) {
            console.error('Error en controlador al crear comentario:', error);
            res.status(500).json({ 
                mensaje: "Error al crear el comentario",
                error: error.message 
            });
        }
    }

    // Actualizar un comentario
    async actualizar(req, res) {
        try {
            const { id: usuarioid, rol } = req.usuario;
            const { id } = req.params;
            const { contenido } = req.body;

            // Solo usuarios con rol permitido pueden actualizar
            if (![1, 2, 4].includes(rol)) {
                return res.status(403).json({ mensaje: "Solo los administradores o usuarios pueden actualizar comentarios" });
            }

            // Validar que se proporcione el contenido
            if (!contenido) {
                return res.status(400).json({ 
                    mensaje: "El contenido del comentario es requerido"
                });
            }

            // Validar longitud del contenido
            if (contenido.length > 500) {
                return res.status(400).json({ 
                    mensaje: "El contenido del comentario excede el límite de caracteres",
                    maximo: 500,
                    actual: contenido.length
                });
            }

            const comentario = await ComentarioService.obtenerPorId(id);
            if (!comentario) {
                return res.status(404).json({ mensaje: "Comentario no encontrado" });
            }

            // Si es admin/superadmin puede actualizar cualquier comentario, si es usuario solo el suyo
            if ((rol === 4 && comentario.usuarioid !== usuarioid) || (rol !== 4 && ![1,2].includes(rol))) {
                return res.status(403).json({ mensaje: "No tienes permiso para editar este comentario" });
            }

            const actualizado = await ComentarioService.actualizar(id, contenido);
            res.json({
                mensaje: "Comentario actualizado exitosamente",
                comentario: actualizado
            });
        } catch (error) {
            console.error('Error al actualizar comentario:', error);
            res.status(500).json({ 
                mensaje: "Error interno al actualizar el comentario",
                error: error.message 
            });
        }
    }

    // Eliminar un comentario
    async eliminar(req, res) {
        try {
            const { id: usuarioid, rol } = req.usuario;
            const { id } = req.params;

            // Solo usuarios (rol 4) pueden eliminar sus propios comentarios
            if (rol !== 4) {
                return res.status(403).json({ mensaje: "Solo los usuarios pueden eliminar sus comentarios" });
            }

            const comentario = await ComentarioService.obtenerPorId(id);
            if (!comentario) {
                return res.status(404).json({ mensaje: "Comentario no encontrado" });
            }

            // Verificar que el usuario es el dueño del comentario
            if (comentario.usuarioid !== usuarioid) {
                return res.status(403).json({ mensaje: "No tienes permiso para eliminar este comentario" });
            }

            await ComentarioService.eliminar(id);
            res.json({ mensaje: "Comentario eliminado exitosamente" });
        } catch (error) {
            console.error('Error al eliminar comentario:', error);
            res.status(500).json({ 
                mensaje: "Error al eliminar el comentario",
                error: error.message 
            });
        }
    }

    // Aprobar o rechazar un comentario reportado
    async actualizarEstado(req, res) {
        try {
            console.log('=== Inicio de actualizarEstado en controlador ===');
            console.log('Datos recibidos:', {
                id: req.params.id,
                estado: req.body.estado,
                usuario: req.usuario
            });

            const { rol } = req.usuario;
            const { id } = req.params;
            const { estado } = req.body;

            // Solo admin y superadmin pueden actualizar el estado
            if (![1, 2].includes(rol)) {
                return res.status(403).json({ 
                    mensaje: "No tienes permiso para actualizar el estado del comentario",
                    detalle: "Solo administradores pueden actualizar estados de reportes"
                });
            }

            // Validar que se proporcione el estado
            if (!estado) {
                return res.status(400).json({ 
                    mensaje: "El estado es requerido",
                    detalle: "Debe proporcionar un estado válido: 'aceptado' o 'rechazado'"
                });
            }

            // Verificar si el comentario existe antes de intentar actualizarlo
            const comentarioExistente = await ComentarioService.obtenerPorId(id);
            if (!comentarioExistente) {
                return res.status(404).json({ 
                    mensaje: "Comentario no encontrado"
                });
            }

            const actualizado = await ComentarioService.actualizarEstado(id, estado);
            
            res.json({
                mensaje: "Estado del comentario actualizado exitosamente",
                detalle: estado === 'aceptado' ? 
                    "El comentario ha sido aceptado y desactivado" : 
                    "El comentario ha sido rechazado y permanecerá activo",
                comentario: actualizado
            });
        } catch (error) {
            console.error('Error en actualizarEstado:', error);
            res.status(500).json({ 
                mensaje: "Error al actualizar el estado del reporte"
            });
        }
    }

    // Obtener comentarios por evento
    async obtenerPorEvento(req, res) {
        try {
            const { eventoid } = req.params;
            const { rol, id: usuarioid } = req.usuario;

            let comentarios;
            if (rol === 3) {
                // Propietarios solo ven comentarios de sus eventos
                comentarios = await ComentarioService.obtenerPorEventoPropietario(eventoid, usuarioid);
            } else {
                // Otros roles ven todos los comentarios del evento
                comentarios = await ComentarioService.obtenerPorEvento(eventoid);
            }

            if (!comentarios || comentarios.length === 0) {
                return res.json({
                    mensaje: "No hay comentarios para este evento",
                    comentarios: []
                });
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
            let mensaje;

            if ([1, 2].includes(rol)) {
                // Admin y SuperAdmin ven todos los comentarios
                comentarios = await ComentarioService.listarComentariosAdmin();
                mensaje = "Lista de comentarios obtenida exitosamente (Vista de Administración)";
            } else if (rol === 3) {
                // Propietarios ven solo comentarios de sus eventos
                comentarios = await ComentarioService.listarComentariosPropietario(usuarioid);
                mensaje = "Comentarios de tus lugares obtenidos exitosamente (Vista de Propietario)";
            } else if (rol === 4) {
                // Usuarios ven solo sus propios comentarios
                comentarios = await ComentarioService.listarComentariosUsuario(usuarioid);
                mensaje = "Tus comentarios obtenidos exitosamente (Vista de Usuario)";
            } else {
                return res.status(403).json({ mensaje: "No tienes permiso para ver los comentarios" });
            }

            res.json({
                mensaje,
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
