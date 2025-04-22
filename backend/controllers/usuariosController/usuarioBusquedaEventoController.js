const EventoService = require('../../service/usuariosService/usuarioBusquedaEventoService');

class UsuarioBusquedaController {
  async buscarEventosPorNombre(req, res) {
    try {
        const { nombre } = req.query;

        // Validar que 'nombre' esté presente y tenga al menos 2 caracteres
        if (!nombre || nombre.length < 2) {
            return res.status(400).json({ mensaje: "Debes escribir al menos 2 caracteres para buscar" });
        }

        // Llamada al servicio para buscar los eventos
        const eventos = await EventoService.buscarEventosPorNombre(nombre);

        // Verificar si se encontraron eventos
        if (eventos.length === 0) {
            return res.status(404).json({ mensaje: "No se encontraron eventos con ese nombre" });
        }

        // Responder con los eventos encontrados
        res.status(200).json(eventos);
    } catch (error) {
        // Manejo de errores
        res.status(500).json({ mensaje: "Error al buscar eventos", error: error.message });
    }
}

}
 module.exports = new UsuarioBusquedaController();
