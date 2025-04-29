const ReporteService = require('../service/reporteService');

class ReporteController {
    // Métodos para reportes de comentarios

    async actualizarEstadoReporteComentario(req, res) {
        try {
            const { id } = req.params;
            const { aprobacion, motivo } = req.body;

            console.log('Actualizando reporte con:', { id, aprobacion, motivo });

            const actualizado = await ReporteService.actualizarEstadoReporteComentario(id, aprobacion, motivo);
            res.json({
                mensaje: "Estado del reporte actualizado exitosamente",
                reporte: actualizado
            });
            // Emitir socket al actualizar estado de reporte
            const io = req.app.get('io');
            const notificacionesReportes = await ReporteService.obtenerNotificacionesReportes(req.usuario.rol);
            io.emit('notificaciones-reportes', notificacionesReportes);
        } catch (error) {
            console.error('Error en actualizarEstadoReporteComentario:', error);
            
            // Manejar el caso específico cuando el comentario no existe
            if (error.message === 'Comentario no encontrado') {
                return res.status(404).json({ 
                    mensaje: "Comentario no encontrado"
                });
            }

            res.status(500).json({ 
                mensaje: "Error al actualizar el estado del reporte"
            });
        }
    }

    async reportarComentario(req, res) {
        try {
            const { id } = req.params;
            const { motivo } = req.body;

            console.log('Intentando reportar comentario:', { id, motivo });

            const reportado = await ReporteService.reportarComentario(id, motivo);
            res.json({
                mensaje: "Comentario reportado exitosamente",
                reporte: reportado
            });
        } catch (error) {
            console.error('Error en reportarComentario:', error);
            
            // Manejar mensajes de error específicos
            if (error.message.includes('Ya existe una solicitud')) {
                return res.status(400).json({ 
                    mensaje: "Ya existe una solicitud de reporte en revisión para este comentario" 
                });
            }
            
            if (error.message.includes('ya fue revisado y rechazado')) {
                return res.status(400).json({ 
                    mensaje: "Este comentario ya fue revisado y rechazado anteriormente" 
                });
            }

            if (error.message.includes('ya fue revisado y aceptado')) {
                return res.status(400).json({ 
                    mensaje: "Este comentario ya fue revisado y aceptado anteriormente" 
                });
            }

            res.status(500).json({ 
                mensaje: "Error al reportar el comentario",
                error: error.message 
            });
        }
    }

    // Método para obtener notificaciones de reportes
    async obtenerNotificacionesReportes(req, res) {
        try {
            console.log('=== Inicio obtenerNotificacionesReportes ===');
            console.log('Usuario:', req.usuario);
            
            const { rol: rolid } = req.usuario;
            const notificaciones = await ReporteService.obtenerNotificacionesReportes(rolid);
            
            console.log('Notificaciones obtenidas:', notificaciones);
            res.json(notificaciones);
        } catch (error) {
            console.error('Error en obtenerNotificacionesReportes:', error);
            
            if (error.message === 'No autorizado') {
                return res.status(403).json({ 
                    mensaje: "No tienes permisos para ver las notificaciones de reportes" 
                });
            }
            
            res.status(500).json({ 
                mensaje: "Error al obtener las notificaciones de reportes",
                error: error.message 
            });
        }
    }

    // Métodos para reportes de lugares
    async listarLugaresPendientes(req, res) {
        try {
            const lugares = await ReporteService.listarLugaresPendientes();
            res.json({
                mensaje: "Lugares pendientes obtenidos exitosamente",
                lugares: lugares
            });
        } catch (error) {
            console.error('Error en listarLugaresPendientes:', error);
            res.status(500).json({ mensaje: "Error al obtener los lugares pendientes" });
        }
    }

    async actualizarEstadoLugar(req, res) {
        try {
            console.log('== actualizarEstadoLugar llamado ==');
            const { id } = req.params;
            // Aceptar campo 'estado' o 'aprobacion'
            let raw = req.body.estado;
            if (raw === undefined) raw = req.body.aprobacion;
            // Convertir a boolean
            const estado = (typeof raw === 'string')
                ? raw.toLowerCase() === 'true'
                : Boolean(raw);
            console.log('Estado calculado para actualizarLugar:', estado);

            const actualizado = await ReporteService.actualizarEstadoLugar(id, estado);
            console.log('Lugar tras actualizar:', actualizado.toJSON());

            // Enviar respuesta
            const mensaje = estado ? 'aprobado' : 'lugar no aprobado';
            res.json({ mensaje, lugar: actualizado });
            // Notificar siempre al propietario (rol 3)
            const io = req.app.get('io');
            const room = `usuario-${actualizado.usuarioid}`;
            console.log(`Emitiendo lugar-actualizado a sala ${room}:`, { mensaje, lugar: actualizado });
            io.to(room).emit('lugar-actualizado', {
                mensaje,
                lugar: actualizado,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error en actualizarEstadoLugar:', error);
            res.status(500).json({ mensaje: "Error al actualizar el estado del lugar" });
        }
    }

    async obtenerNotificacionesLugares(req, res) {
        try {
            console.log('=== Inicio obtenerNotificacionesLugares ===');
            console.log('Usuario:', req.usuario);
            
            const { rol: rolid } = req.usuario;
            const notificaciones = await ReporteService.obtenerNotificacionesLugares(rolid);
            
            console.log('Notificaciones obtenidas:', notificaciones);
            res.json(notificaciones);
        } catch (error) {
            console.error('Error en obtenerNotificacionesLugares:', error);
            
            if (error.message === 'No autorizado') {
                return res.status(403).json({ 
                    mensaje: "No tienes permisos para ver las notificaciones de lugares" 
                });
            }
            
            res.status(500).json({ 
                mensaje: "Error al obtener las notificaciones de lugares",
                error: error.message 
            });
        }
    }
}

module.exports = new ReporteController(); 