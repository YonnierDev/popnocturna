const CalificacionService = require('../service/calificacionService');


class CalificacionController {
    async listarCalificaciones(req, res) {
        try {
            const listaCalificaciones = await CalificacionService.listarCalificaciones();
            res.json(listaCalificaciones);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: "Error en el servicio" });
        }
    }

    async crearCalificacion(req, res) {
        try {
            const { usuarioid, eventoid, puntuaje } = req.body;
            
            const usuarioExistente = await CalificacionService.verificarUsuario(usuarioid);
            if (!usuarioExistente) {
                return res.status(400).json({ mensaje: "El usuario seleccionado no existe" });
            }

            const eventoExistente = await CalificacionService.verificarEvento(eventoid);
            if (!eventoExistente) {
                return res.status(400).json({ mensaje: "El evento seleccionado no existe" });
            }
            

            const nuevoCalificacion = await CalificacionService.crearCalificacion({
                usuarioid,
                eventoid,
                puntuacion
            });
    
            res.status(201).json(nuevoCalificacion);
        } catch (error) {
            console.error("Error detallado:", error);
            res.status(500).json({ 
                mensaje: "Error en el servicio", 
                error: error.message,
                stack: error.stack 
            });
        }
    }
    

    async actualizarCalificacion(req, res) {
        try {
            const { id } = req.params;
            const { usuarioid, eventoid, puntuaje } = req.body;
            
            const usuarioExistente = await CalificacionService.verificarUsuario(usuarioid);
            if (!usuarioExistente) {
                return res.status(400).json({ mensaje: "El usuario seleccionado no existe" });
            }

            const eventoExistente = await CalificacionService.verificarEvento(eventoid);
            if (!eventoExistente) {
                return res.status(400).json({ mensaje: "El evento seleccionado no existe" });
            }
            

            // Preparar datos para actualizar
            const datosActualizados = {
                usuarioid,
                eventoid,
                puntuacion
            };

            const CalificacionActualizado = await CalificacionService.actualizarCalificacion(id, datosActualizados);
            res.json(CalificacionActualizado);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: "Error en el servicio" });
        }
    }

    async eliminarCalificacion(req, res) {
        try {
            const { id } = req.params;
            
            // Verificar si el Calificacion existe
            const Calificacion = await CalificacionService.buscarCalificacion(id);
            if (!Calificacion) {
                return res.status(404).json({ mensaje: "Calificacion no encontrado" });
            }

            await CalificacionService.eliminarCalificacion(id);
            res.json({ mensaje: "Calificacion eliminado correctamente" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: "Error en el servicio" });
        }
    }

    async buscarCalificacion(req, res) {
        try {
            const { id } = req.params;
            const Calificacion = await CalificacionService.buscarCalificacion(id);
            
            if (!Calificacion) {
                return res.status(404).json({ mensaje: "Calificacion no encontrado" });
            }
            
            res.json(Calificacion);
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensaje: "Error en el servicio" });
        }
    }
}

module.exports = new CalificacionController();


