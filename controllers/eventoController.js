const eventoService = require("../service/eventoService");
const cloudinaryService = require("../service/cloudinaryService");
const path = require('path');

class EventoController {
  async listarEventos(req, res) {
    try {
      console.log('\n=== Inicio listarEventos ===');
      console.log('Usuario autenticado:', req.usuario);

      const { rol: rolid } = req.usuario;
      const { page = 1, limit = 10, fechaDesde, fechaHasta } = req.query;

      console.log('Parámetros recibidos:', {
        rolid,
        page,
        limit,
        fechaDesde,
        fechaHasta
      });

      const opciones = {
        offset: (page - 1) * limit,
        limit: parseInt(limit),
        fechaDesde,
        fechaHasta,
      };

      let eventos;
      console.log('Opciones de consulta:', opciones);

      // Si es admin o super admin (roles 1 y 2), ver toda la información sin restricciones
      if (rolid === 1 || rolid === 2) {
        console.log('Acceso como administrador (rol:', rolid, ')');
        eventos = await eventoService.listarEventosAdmin(opciones);
      }
      // Si es propietario (rol 3), ver solo eventos activos de sus lugares
      else if (rolid === 3) {
        console.log('Acceso como propietario');
        const { id: usuarioid } = req.usuario;
        const { soloActivos = 'true' } = req.query; // Nuevo: capturar el parámetro de consulta
        
        eventos = await eventoService.listarEventosPorPropietario(
            usuarioid, 
            { 
                ...opciones,
                soloActivos: soloActivos === 'true' // Convertir a booleano
            }
        );
    }
      // Si es usuario normal (rol 4), ver solo eventos activos
      else if (rolid === 4) {
        console.log('Acceso como usuario normal');
        const { id: usuarioid } = req.usuario;
        eventos = await eventoService.listarEventosPorUsuario(usuarioid, opciones);
      }
      else {
        console.log('Acceso denegado - Rol no permitido:', rolid);
        return res.status(403).json({ mensaje: "No tienes permiso para ver eventos" });
      }

      console.log('Eventos encontrados:', eventos?.length || 0);
      res.json({
        mensaje: "Eventos obtenidos correctamente",
        datos: eventos
      });
    } catch (error) {
      console.error("Error al listar eventos:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }

  async verEvento(req, res) {
    try {
      const { id } = req.params;
      const { rol: rolid } = req.usuario;

      let evento;

      // Si es admin o super admin, ver toda la información
      if (rolid === 1 || rolid === 2) {
        evento = await eventoService.verEventoAdmin(id);
      } else {
        // Para otros roles, usar la lógica existente
        const { id: usuarioid } = req.usuario;
        if (rolid === 3) {
          evento = await eventoService.verEventoPropietario(id, usuarioid);
        } else if (rolid === 4) {
          evento = await eventoService.verEventoUsuario(id, usuarioid);
        } else {
          return res.status(403).json({ mensaje: "No tienes permiso para ver este evento" });
        }
      }

      if (!evento) {
        return res.status(404).json({ mensaje: "Evento no encontrado" });
      }

      res.json({
        mensaje: "Evento obtenido correctamente",
        datos: evento
      });
    } catch (error) {
      console.error("Error al ver evento:", error);
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }

  async crearEvento(req, res) {
    try {
      const { rol: rolid, id: usuarioid } = req.usuario;
      const archivos = req.files || [];
      const datosEvento = req.body;

      // Validar mínimo 1 y máximo 3 imágenes
      if (archivos.length === 0) {
        return res.status(400).json({
          mensaje: "Error de validación",
          error: "Se requiere al menos una imagen de portada"
        });
      }
      if (archivos.length > 3) {
        return res.status(400).json({
          mensaje: "Error de validación",
          error: "Se permiten máximo 3 imágenes de portada"
        });
      }

      // Subir imágenes a Cloudinary y guardar URLs
      const urlsPortada = [];
      for (const archivo of archivos) {
        try {
          const nombreUnico = `evento-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          const uploadResponse = await cloudinaryService.subirImagenEvento(
            archivo.buffer,
            nombreUnico
          );
          urlsPortada.push(uploadResponse.secure_url);
        } catch (error) {
          console.error('Error al subir imagen a Cloudinary:', error);
        }
      }

      if (urlsPortada.length === 0) {
        return res.status(500).json({
          mensaje: "Error al subir imágenes",
          error: "No se pudo subir ninguna imagen a Cloudinary"
        });
      }

      // Guardar evento con URLs en portada
      const datosCompletos = {
        ...datosEvento,
        portada: urlsPortada,
        usuarioid
      };

      let nuevoEvento;
      if (rolid === 1 || rolid === 2) {
        nuevoEvento = await eventoService.crearEventoAdmin(datosCompletos, usuarioid);
      } else if (rolid === 3) {
        nuevoEvento = await eventoService.crearEventoPropietario(datosCompletos, usuarioid);
      } else {
        return res.status(403).json({ mensaje: "No tienes permiso para crear eventos" });
      }

      // Notificaciones
      const io = req.app.get('io');
      if (io) {
        io.to('admin-room').emit('nuevo-evento-admin', {
          propietario: req.usuario.correo,
          evento: nuevoEvento,
          timestamp: new Date().toISOString(),
          mensaje: `Nuevo evento creado por ${req.usuario.correo}`
        });
        io.to('usuario-room').emit('nuevo-evento-usuario', {
          evento: nuevoEvento,
          timestamp: new Date().toISOString(),
          mensaje: `Nuevo evento disponible: ${nuevoEvento.nombre}`
        });
      }

      res.status(201).json({
        mensaje: "Evento creado correctamente",
        datos: nuevoEvento
      });
    } catch (error) {
      console.error("Error al crear evento:", error);
      res.status(500).json({
        mensaje: "Error en el servicio",
        error: error.message
      });
    }
  }
  
  async actualizarEvento(req, res) {
    try {
      const { id } = req.params;
      const { rol: rolid, id: usuarioid } = req.usuario;
      const datosEvento = { ...req.body }; // Copiamos req.body para poder modificarlo
      const archivos = req.files || []; // Archivos subidos en la petición

      // 1. Obtener el evento actual para manejar las imágenes existentes
      let eventoActual;
      if (rolid === 1 || rolid === 2) {
        eventoActual = await eventoService.obtenerEventoAdmin(id);
      } else if (rolid === 3) {
        eventoActual = await eventoService.obtenerEventoPropietario(id, usuarioid);
      } else {
        return res.status(403).json({ mensaje: "No tienes permiso para actualizar eventos" });
      }

      if (!eventoActual) {
        return res.status(404).json({ mensaje: "Evento no encontrado o no tienes permisos" });
      }

      // 2. Si se están subiendo nuevas imágenes
      if (archivos.length > 0) {
        // 2.1 Eliminar las imágenes antiguas de Cloudinary
        if (eventoActual.portada && eventoActual.portada.length > 0) {
          try {
            await cloudinaryService.eliminarPortada(eventoActual);
            console.log('Imágenes antiguas eliminadas de Cloudinary');
          } catch (error) {
            console.error('Error al eliminar imágenes antiguas:', error);
            // No detenemos el proceso si falla la eliminación
          }
        }

        // 2.2 Subir las nuevas imágenes
        const urlsPortadaNuevas = [];
        for (const archivo of archivos) {
          try {
            const nombreUnico = `evento-${Date.now()}-${Math.floor(Math.random() * 1000)}${path.extname(archivo.originalname)}`;
            const resultadoUpload = await cloudinaryService.subirImagenEvento(archivo.buffer, nombreUnico);
            urlsPortadaNuevas.push(resultadoUpload.secure_url);
          } catch (uploadError) {
            console.error("Error al subir imagen a Cloudinary:", uploadError);
            return res.status(500).json({ 
              mensaje: "Error al subir una de las imágenes a Cloudinary", 
              error: uploadError.message 
            });
          }
        }
        datosEvento.portada = urlsPortadaNuevas;
      } 
      // 3. Si se envía un array de URLs en el body
      else if (req.body.portada) {
        try {
          // Asegurarse de que sea un array
          datosEvento.portada = Array.isArray(req.body.portada) 
            ? req.body.portada 
            : JSON.parse(req.body.portada);
          
          // Validar que sea un array de strings
          if (!Array.isArray(datosEvento.portada) || !datosEvento.portada.every(url => typeof url === 'string')) {
            return res.status(400).json({ 
              mensaje: "El campo 'portada' debe ser un array de URLs de imágenes" 
            });
          }
        } catch (error) {
          console.error("Error al procesar campo 'portada':", error);
          return res.status(400).json({ 
            mensaje: "Formato inválido para el campo 'portada'. Debe ser un array de URLs o un string JSON válido" 
          });
        }
      }
      // 4. Si no se envía portada, mantener las existentes (no hacer nada)


      // 4.1 Eliminar campos vacíos que podrían causar errores
      if (datosEvento.lugarid === '') {
        delete datosEvento.lugarid;
      }
      if (datosEvento.categoriaid === '') {
        delete datosEvento.categoriaid;
      }

      // 5. Actualizar el evento con los nuevos datos
      let eventoActualizado;
      if (rolid === 1 || rolid === 2) {
        eventoActualizado = await eventoService.actualizarEventoAdmin(id, datosEvento);
      } else {
        eventoActualizado = await eventoService.actualizarEventoPropietario(id, datosEvento, usuarioid);
      }

      if (!eventoActualizado) {
        return res.status(404).json({ mensaje: "Evento no encontrado o no tienes permisos para modificarlo" });
      }

      res.json({
        mensaje: "Evento actualizado correctamente",
        datos: eventoActualizado
      });
    } catch (error) {
      console.error("Error al actualizar evento:", error);
      if (error.message.includes("no tienes permisos")) {
        return res.status(403).json({ mensaje: error.message });
      }
      if (error.message.includes("no encontrado")) {
        return res.status(404).json({ mensaje: error.message });
      }
      res.status(500).json({ mensaje: "Error en el servicio", error: error.message });
    }
  }

  async eliminarEvento(req, res) {
    try {
      const { id } = req.params;
      const { rol: rolid, id: usuarioid } = req.usuario;

      if (rolid === 1 || rolid === 2) {
        await eventoService.eliminarEventoAdmin(id);
      }
      else if (rolid === 3) {
        await eventoService.eliminarEventoPropietario(id, usuarioid);
      }
      else {
        return res.status(403).json({ mensaje: "No tienes permiso para eliminar eventos" });
      }

      res.json({ mensaje: "Evento eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar evento:", error);
      if (error.message.includes("no tienes permisos")) {
        return res.status(403).json({ mensaje: error.message });
      }
      if (error.message.includes("no encontrado")) {
        return res.status(404).json({ mensaje: error.message });
      }
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }

  async verComentarios(req, res) {
    try {
      const { eventoId } = req.params;
      const { rol: rolid, id: usuarioid } = req.usuario;

      let comentarios;

      if (rolid === 1 || rolid === 2) {
        comentarios = await eventoService.verComentariosAdmin(eventoId);
      } else if (rolid === 3) {
        comentarios = await eventoService.verComentariosPropietario(eventoId, usuarioid);
      } else if (rolid === 4) {
        comentarios = await eventoService.verComentariosUsuario(eventoId, usuarioid);
      } else {
        return res.status(403).json({ mensaje: "No tienes permiso para ver comentarios" });
      }

      res.json({
        mensaje: "Comentarios obtenidos correctamente",
        datos: comentarios
      });
    } catch (error) {
      console.error("Error al ver comentarios:", error);
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }

  async cambiarEstadoEvento(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      const { rol: rolid, id: usuarioid } = req.usuario;

      let eventoActualizado;

      if (rolid === 1 || rolid === 2) {
        eventoActualizado = await eventoService.cambiarEstadoEventoAdmin(id, estado);
      }else {
        return res.status(403).json({ mensaje: "No tienes permiso para cambiar el estado del evento" });
      }

      res.json({
        mensaje: "Estado del evento actualizado correctamente",
        datos: eventoActualizado
      });
    } catch (error) {
      console.error("Error al cambiar estado del evento:", error);
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }

  async listarEventosPublicos(req, res) {
    try {
      const { page = 1, limit = 10, estado, fechaDesde, fechaHasta } = req.query;

      const opciones = {
        offset: (page - 1) * limit,
        limit: parseInt(limit),
        estado: true, // Solo mostrar eventos activos
        fechaDesde,
        fechaHasta,
      };

      const eventos = await eventoService.listarEventosPublicos(opciones);

      res.json({
        mensaje: "Eventos públicos obtenidos correctamente",
        datos: eventos
      });
    } catch (error) {
      console.error("Error al listar eventos públicos:", error);
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }

  async verEventoPublico(req, res) {
    try {
      const { id } = req.params;
      const evento = await eventoService.verEventoPublico(id);

      if (!evento) {
        return res.status(404).json({ mensaje: "Evento no encontrado" });
      }

      res.json({
        mensaje: "Evento público obtenido correctamente",
        datos: evento
      });
    } catch (error) {
      console.error("Error al ver evento público:", error);
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }

  async listarReservasEvento(req, res) {
    try {
      const { eventoId } = req.params;
      const { rol: rolid, id: usuarioid } = req.usuario;
      const { page = 1, limit = 10, estado } = req.query;

      // Verificar que el evento existe y el usuario tiene permiso
      const evento = await eventoService.obtenerEventoPorId(eventoId);
      
      if (!evento) {
        return res.status(404).json({ mensaje: 'Evento no encontrado' });
      }

      // Verificar permisos
      if (rolid === 3 && evento.usuarioid !== usuarioid) {
        return res.status(403).json({ 
          mensaje: 'No tienes permiso para ver las reservas de este evento' 
        });
      }

      const opciones = {
        offset: (page - 1) * limit,
        limit: parseInt(limit),
        estado
      };

      const { count, rows: reservas } = await eventoService.listarReservasEvento(eventoId, opciones);

      res.json({
        mensaje: 'Reservas del evento obtenidas correctamente',
        datos: reservas,
        metadata: {
          total: count,
          pagina: parseInt(page),
          limite: parseInt(limit),
          totalPaginas: Math.ceil(count / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error al listar reservas del evento:', error);
      res.status(500).json({ 
        mensaje: 'Error al listar reservas del evento',
        error: error.message 
      });
    }
  }

  async obtenerEventosPorPrecio(req, res) {
  try {
    const { rango } = req.params;
    const rangosValidos = ['gratis', 'economico', 'medio', 'premium'];

    if (!rangosValidos.includes(rango)) {
      return res.status(400).json({
        mensaje: "Rango de precio no válido",
        error: "Los rangos válidos son: gratis, economico, medio, premium",
        rangosValidos
      });
    }

    const eventos = await eventoService.obtenerEventosPorPrecio(rango);

    if (!eventos || eventos.length === 0) {
      return res.status(404).json({
        mensaje: `No se encontraron eventos en el rango ${rango}`,
        detalles: "Intenta con otro rango de precio"
      });
    }

    res.status(200).json({
      mensaje: `Eventos en rango ${rango} obtenidos correctamente`,
      cantidad: eventos.length,
      datos: eventos
    });

  } catch (error) {
    console.error('Error en obtenerEventosPorPrecio:', error);
    res.status(500).json({
      mensaje: "Error al obtener eventos por precio",
      error: error.message,
      detalles: "Error interno del servidor al procesar la solicitud"
    });
  }
}
}

module.exports = new EventoController();
