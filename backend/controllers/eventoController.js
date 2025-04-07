const comentarioService = require("../service/comentarioService");
const EventoService = require("../service/eventoService");

class EventoController {
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
      const { nombre, lugarid, capacidad, precio, descripcion, fecha_hora } = req.body;
  
      const estado = true;
  
      const lugarExistente = await EventoService.verificarLugar(lugarid);
      if (!lugarExistente) {
        return res.status(400).json({ mensaje: "El lugar no existe" });
      }
  
      const nuevoEvento = await EventoService.crearEvento({
        nombre,
        lugarid,
        capacidad,
        precio,
        descripcion,
        fecha_hora,
        estado: true,
      });
  
      console.log("Evento creado:", nuevoEvento);
      return res.status(201).json({
        evento: nuevoEvento
      });
  
    } catch (error) {
      console.error("Error detallado:", error);
      return res.status(500).json({
        mensaje: "Error en el servicio",
        error: error.message,
        stack: error.stack,
      });
    }
  }

  async actualizarEvento(req, res) {
    try {
      const { id } = req.params;
      const {
        lugarid,
        capacidad,
        precio,
        descripcion,
        fecha_hora,
        estado,
      } = req.body;

      const lugarExistente = await EventoService.verificarLugar(lugarid);
      if (!lugarExistente) {
        return res.status(400).json({ mensaje: "El lugar no existe" });
      }

      const datosActualizados = {
        lugarid,
        comentarioid,
        capacidad,
        precio,
        descripcion,
        fecha_hora,
        estado,
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

  async actualizarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
  
      const evento = await EventoService.buscarEvento(id);
      if (!evento) {
        return res.status(404).json({ mensaje: "Evento no encontrado" });
      }
  
      await EventoService.actualizarEstado(id, estado);
      res.json({ mensaje: "Estado del evento actualizado correctamente" });
    } catch (error) {
      console.error("Error actualizando estado del evento:", error);
      res.status(500).json({ mensaje: "Error en el servicio", error });
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
