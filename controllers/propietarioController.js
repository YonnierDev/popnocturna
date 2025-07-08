const PropietarioService = require('../service/propietarioService');
const CloudinaryService = require('../service/cloudinaryService');

class PropietarioController {
  async actualizarLugarPropietario(req, res) {
    try {
      const { id } = req.params;
      const datosActualizados = req.body;
      const usuarioId = req.usuario.id;
      const archivosAEliminar = [];
      
      // Obtener el lugar actual para eliminar archivos antiguos
      const lugarActual = await PropietarioService.obtenerLugarPorId(id);
      
      if (!lugarActual) {
        return res.status(404).json({ error: 'Lugar no encontrado' });
      }
      
      // Verificar que el usuario sea el propietario del lugar
      if (lugarActual.usuarioid !== usuarioId) {
        return res.status(403).json({ error: 'No tienes permiso para actualizar este lugar' });
      }
      
      // Procesar archivos nuevos
      if (req.files) {
        // Si hay una nueva imagen, marcar la antigua para eliminar
        if (req.files.imagen && lugarActual.imagen) {
          archivosAEliminar.push(lugarActual.imagen);
          datosActualizados.imagen = req.files.imagen[0].path;
        }
        
        // Si hay nuevas fotos, mantener las existentes a menos que se especifique lo contrario
        if (req.files.fotos_lugar) {
          const nuevasFotos = req.files.fotos_lugar.map(file => file.path);
          const fotosExistentes = lugarActual.fotos_lugar || [];
          datosActualizados.fotos_lugar = [...fotosExistentes, ...nuevasFotos];
        }
        
        // Si hay un nuevo PDF, marcar el anterior para eliminar
        if (req.files.carta_pdf && lugarActual.carta_pdf) {
          archivosAEliminar.push(lugarActual.carta_pdf);
          datosActualizados.carta_pdf = req.files.carta_pdf[0].path;
        }
      }
      
      // Actualizar el lugar
      const lugarActualizado = await PropietarioService.actualizarLugarPropietario(id, usuarioId, datosActualizados);
      
      // Eliminar archivos antiguos después de la actualización exitosa
      if (archivosAEliminar.length > 0) {
        try {
          await Promise.all(archivosAEliminar.map(url => CloudinaryService.eliminarArchivo(url)));
        } catch (error) {
          console.error('Error al eliminar archivos antiguos:', error);
          // No fallar la operación si hay error al eliminar archivos antiguos
        }
      }
      
      res.json({ mensaje: 'Lugar actualizado correctamente', lugar: lugarActualizado });
    } catch (error) {
      console.error('Error en actualizarLugarPropietario:', error);
      res.status(500).json({ error: error.message });
    }
  }
  async listarComentariosPorLugar(req, res) {
    try {
      const { lugarid } = req.params;
      const comentarios = await PropietarioService.obtenerComentariosPorLugar(lugarid);
      res.json(comentarios);
    } catch (error) {
      console.error('Error en listarComentariosPorLugar:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async listarCalificacionesPorLugar(req, res) {
    try {
      const { lugarid } = req.params;
      const calificaciones = await PropietarioService.obtenerCalificacionesPorLugar(lugarid);
      res.json(calificaciones);
    } catch (error) {
      console.error('Error en listarCalificacionesPorLugar:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async listarReservasPorLugar(req, res) {
    try {
      const { lugarid } = req.params;
      const reservas = await PropietarioService.obtenerReservasPorLugar(lugarid);
      res.json(reservas);
    } catch (error) {
      console.error('Error en listarReservasPorLugar:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new PropietarioController();
