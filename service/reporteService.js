const { Comentario, Lugar, Usuario, Categoria, Evento } = require("../models");

class ReporteService {
    // Métodos para reportes de comentarios

    async actualizarEstadoReporteComentario(id, aprobacion, motivo = null) {
        try {
            console.log('Buscando comentario con ID:', id);
            const comentario = await Comentario.findByPk(id);
            if (!comentario) {
                console.log('Comentario no encontrado con ID:', id);
                throw new Error('Comentario no encontrado');
            }

            console.log('Comentario encontrado:', comentario.toJSON());
            console.log('Actualizando con aprobacion:', aprobacion);

            const actualizado = await comentario.update({
                aprobacion: aprobacion,
                motivo_reporte: motivo,
                estado: aprobacion === 'aceptado' ? false : true
            });

            console.log('Comentario actualizado:', actualizado.toJSON());
            return actualizado;
        } catch (error) {
            console.error('Error al actualizar estado del reporte de comentario:', error);
            throw error;
        }
    }

    async reportarComentario(id, motivo) {
        try {
            console.log('Buscando comentario con ID:', id);
            const comentario = await Comentario.findByPk(id);
            if (!comentario) {
                throw new Error('Comentario no encontrado');
            }

            console.log('Estado actual del comentario:', comentario.aprobacion);

            // Si el comentario ya está en estado pendiente
            if (comentario.aprobacion === 'pendiente') {
                throw new Error('Ya existe una solicitud de reporte en revisión para este comentario');
            }

            // Si el comentario ya fue rechazado
            if (comentario.aprobacion === 'rechazado') {
                throw new Error('Este comentario ya fue revisado y rechazado anteriormente');
            }

            // Si el comentario ya fue aceptado
            if (comentario.aprobacion === 'aceptado') {
                throw new Error('Este comentario ya fue revisado y aceptado anteriormente');
            }

            const actualizado = await comentario.update({
                aprobacion: 'pendiente',
                motivo_reporte: motivo
            });

            return actualizado;
        } catch (error) {
            console.error('Error al reportar comentario:', error);
            throw error;
        }
    }

    // Método para obtener notificaciones de reportes pendientes
    async obtenerNotificacionesReportes(rolid) {
        try {
            console.log('Obteniendo notificaciones para rol:', rolid);

            // Verificar que sea admin o super admin
            if (rolid !== 1 && rolid !== 2) {
                console.log('Error: Rol no autorizado:', rolid);
                throw new Error('No autorizado');
            }

            const reportesPendientes = await Comentario.count({
                where: {
                    aprobacion: 'pendiente'
                }
            });

            console.log('Reportes pendientes encontrados:', reportesPendientes);

            return {
                reportesPendientes,
                mensaje: reportesPendientes > 0
                    ? `Tienes ${reportesPendientes} reporte(s) pendiente(s) de revisión`
                    : 'No hay reportes pendientes'
            };
        } catch (error) {
            console.error('Error al obtener notificaciones de reportes:', error);
            throw error;
        }
    }

    // Métodos para ver lugares en estado pendiente de  aprobación
    async listarLugaresPendientes() {
        try {
            console.log('=== Inicio listarLugaresPendientes ===');
            const lugares = await Lugar.findAll({
                where: {
                    aprobacion: false
                },
                attributes: [
                    'id', 'nombre', 'descripcion', 'ubicacion',
                    'estado', 'aprobacion', 'createdAt'
                ],
                include: [
                    {
                        model: Usuario,
                        as: 'usuario',
                        attributes: ['id', 'nombre', 'correo']
                    },
                    {
                        model: Categoria,
                        as: 'categoria',
                        attributes: ['id', 'tipo']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            console.log('Lugares pendientes encontrados:', lugares.length);
            return lugares;
        } catch (error) {
            console.error('Error al listar lugares pendientes:', error);
            throw error;
        }
    }

    async actualizarEstadoLugar(id, estado) {
        try {
            console.log('=== Inicio actualizarEstadoLugar ===');
            console.log('ID del lugar:', id);
            console.log('Estado a actualizar:', estado);

            const lugar = await Lugar.findByPk(id);
            if (!lugar) {
                throw new Error('Este lugar no existe');
            }

            // Si el lugar ya está aprobado y se intenta aprobar de nuevo
            if (lugar.aprobacion === true && estado === true) {
                throw new Error('Este lugar ya está aprobado');
            }

            // Si el lugar ya está rechazado y se intenta rechazar de nuevo
            if (lugar.aprobacion === false && estado === false) {
                throw new Error('Este lugar ya está rechazado');
            }

            console.log('Estado actual del lugar:', lugar.aprobacion);
            console.log('Actualizando a:', estado);

            const actualizado = await lugar.update({
                aprobacion: estado,
                estado: estado
            });

            console.log('Lugar actualizado:', actualizado.toJSON());
            return actualizado;
        } catch (error) {
            console.error('Error al actualizar estado del lugar:', error);
            throw error;
        }
    }

    // Método para obtener notificaciones de lugares pendientes
    async obtenerNotificacionesLugares(rolid) {
        try {
            console.log('=== Inicio obtenerNotificacionesLugares ===');
            console.log('Rol del usuario:', rolid);

            // Verificar que sea admin o super admin
            if (rolid !== 1 && rolid !== 2) {
                console.log('Error: Rol no autorizado:', rolid);
                throw new Error('No autorizado');
            }

            const lugaresPendientes = await Lugar.count({
                where: {
                    aprobacion: false
                }
            });

            console.log('Lugares pendientes encontrados:', lugaresPendientes);

            return {
                lugaresPendientes,
                mensaje: lugaresPendientes > 0
                    ? `Tienes ${lugaresPendientes} lugar(es) pendiente(s) de aprobación`
                    : 'No hay lugares pendientes de aprobación'
            };
        } catch (error) {
            console.error('Error al obtener notificaciones de lugares:', error);
            throw error;
        }
    }
}

module.exports = new ReporteService(); 