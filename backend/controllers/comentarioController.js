const ComentarioService = require('../service/comentarioService');

class ComentarioController {
    // Crear un nuevo comentario
    async crear(req, res) {
        try {
            console.log('=== Inicio de crear comentario en controlador ===');
            console.log('Datos recibidos:', req.body);
            console.log('Usuario autenticado:', req.usuario);

            const { id: usuarioid, rol } = req.usuario;
            if (rol !== 8) {
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
            if (![1, 2, 8].includes(rol)) {
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
            if ((rol === 8 && comentario.usuarioid !== usuarioid) || (rol !== 8 && ![1,2].includes(rol))) {
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

            // Solo usuarios (rol 8) pueden eliminar sus propios comentarios
            if (rol !== 8) {
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

    // Reportar un comentario
    async reportar(req, res) {
        try {
            const { id: usuarioid, rol } = req.usuario;
            const { id } = req.params;
            const { motivo } = req.body;

            // Solo propietarios pueden reportar
            if (rol !== 3) {
                return res.status(403).json({ mensaje: "Solo los propietarios pueden reportar comentarios" });
            }

            // Verificar que el comentario existe y obtener su estado
            const comentario = await ComentarioService.obtenerPorId(id);
            if (!comentario) {
                return res.status(404).json({ mensaje: "Comentario no encontrado" });
            }

            // Verificar que el comentario no esté ya reportado
            if (comentario.aprobacion === 'pendiente') {
                return res.status(400).json({ mensaje: "Este comentario ya ha sido reportado y está pendiente de revisión" });
            }

            const actualizado = await ComentarioService.reportar(id, motivo, usuarioid);
            
            // Aquí se podría agregar la lógica para notificar a los administradores
            // a través del servicio de notificaciones

            res.json({
                mensaje: "Comentario reportado exitosamente",
                comentario: actualizado
            });
        } catch (error) {
            console.error('Error al reportar comentario:', error);
            res.status(500).json({ 
                mensaje: "Error al reportar el comentario",
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
