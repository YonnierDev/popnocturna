const EventoService = require('../service/eventoService')

class EventoController{
   async listarEventos(req, res) {
       try {
         const listarEventos = await EventoService.listarEventos();
         res.json(listarEventos);
       } catch (e) {
         res
           .status(500)
           .json({ mensaje: "Error en el servicio", error: e.message });
       }
     }
   
     async crearEvento(req, res) {
       try {
         const { lugarid, comentarioid, aforo, precio, descripcion, fecha_hora } = req.body;
   
         // Verificar si el lugar ya existe
         const lugarExistente = await EventoService.verificarLugar(lugarid);
         if (!lugarExistente) {
           return res.status(400).json({ mensaje: "El lugar no existe" });
         }
   
         const comentarioExistente = await EventoService.verificarComentario(comentarioid);
         if (!comentarioExistente) {
           return res.status(400).json({ mensaje: "El comentario no existe" });
         }
   
         const nuevoEvento = await EventoService.crearEvento({
            lugarid,
            comentarioid,
            aforo,
            precio,
            descripcion,
            fecha_hora,
         });
   
         res.status(201).json(nuevoEvento);
       } catch (error) {
         console.error("Error detallado:", error);
         res.status(500).json({
           mensaje: "Error en el servicio",
           error: error.message,
           stack: error.stack,
         });
       }
     }
   
     async actualizarEvento(req, res) {
       try {
         const { id } = req.params;
         const { lugarid, comentarioid, aforo, precio, descripcion, fecha_hora } = req.body;
   
         // Verificar si el lugar ya existe
         const lugarExistente = await EventoService.verificarLugar(lugarid);
         if (!lugarExistente) {
           return res.status(400).json({ mensaje: "El lugar no existe" });
         }
   
         const comentarioExistente = await EventoService.verificarComentario(comentarioid);
         if (!comentarioExistente) {
           return res.status(400).json({ mensaje: "El comentario no existe" });
         }
   
         // Preparar datos para actualizar
         const datosActualizados = {
            lugarid,
            comentarioid,
            aforo,
            precio,
            descripcion,
            fecha_hora,
         };
   
         const EventoActualizado = await EventoService.actualizarEvento(
           id,
           datosActualizados
         );
         res.json(EventoActualizado);
       } catch (error) {
         console.error(error);
         res.status(500).json({ mensaje: "Error en el servicio" });
       }
     }
   
     async eliminarEvento(req, res) {
       try {
         const { id } = req.params;
   
         // Verificar si el Evento existe
         const Evento = await EventoService.buscarEvento(id);
         if (!Evento) {
           return res.status(404).json({ mensaje: "Evento no encontrado" });
         }
   
         await EventoService.eliminarEvento(id);
         res.json({ mensaje: "Evento eliminado correctamente" });
       } catch (error) {
         console.error(error);
         res.status(500).json({ mensaje: "Error en el servicio" });
       }
     }
   
     async buscarEvento(req, res) {
       try {
         const { id } = req.params;
         const Evento = await EventoService.buscarEvento(id);
   
         if (!Evento) {
           return res.status(404).json({ mensaje: "Evento no encontrado" });
         }
   
         res.json(Evento);
       } catch (error) {
         console.error(error);
         res.status(500).json({ mensaje: "Error en el servicio" });
       }
     }
   }

module.exports = new EventoController();