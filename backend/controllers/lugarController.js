const cloudinaryService = require("../service/cloudinaryService");
const LugarService = require("../service/lugarService");

class LugarController {
  async listarLugares(req, res) {
    try {
      const { rol, usuarioid } = req.usuario;
      let lugares;

      if (!rol) {
        return res.status(401).json({ 
          mensaje: "Error de autenticación",
          error: "Rol no definido en el token"
        });
      }

      if (rol === 1 || rol === 2) {
        lugares = await LugarService.listarLugaresAdmin();
      } else if (rol === 3) {
        if (!usuarioid) {
          return res.status(401).json({
            mensaje: "Error de autenticación",
            error: "ID de usuario no definido en el token"
          });
        }
        lugares = await LugarService.listarLugaresPropietario(usuarioid);
      } else {
        lugares = await LugarService.listarLugaresUsuario();
      }

      if (!lugares || lugares.length === 0) {
        return res.status(404).json({ 
          mensaje: "No se encontraron lugares registrados",
          detalles: "No hay lugares que coincidan con los criterios de búsqueda"
        });
      }

      res.status(200).json(lugares);
    } catch (e) {
      console.error('Error en listarLugares:', e);
      res.status(500).json({ 
        mensaje: "Error al listar lugares", 
        error: e.message,
        tipo: e.name,
        detalles: "Error interno del servidor al procesar la solicitud"
      });
    }
  }

  async buscarLugar(req, res) {
    try {
      const { id } = req.params;
      const { rol, usuarioid } = req.usuario;

      if (!id) {
        return res.status(400).json({
          mensaje: "Error de validación",
          error: "ID de lugar no proporcionado"
        });
      }

      if (!rol) {
        return res.status(401).json({ 
          mensaje: "Error de autenticación",
          error: "Rol no definido en el token"
        });
      }

      let lugar;
      if (rol === 1 || rol === 2) {
        lugar = await LugarService.buscarLugarAdmin(id);
      } else if (rol === 3) {
        if (!usuarioid) {
          return res.status(401).json({
            mensaje: "Error de autenticación",
            error: "ID de usuario no definido en el token"
          });
        }
        lugar = await LugarService.buscarLugarPropietario(id, usuarioid);
      } else {
        lugar = await LugarService.buscarLugarUsuario(id);
      }

      if (!lugar) {
        return res.status(404).json({ 
          mensaje: "Lugar no encontrado",
          detalles: "No existe un lugar con el ID proporcionado o no tiene permisos para verlo"
        });
      }

      res.status(200).json(lugar);
    } catch (error) {
      console.error('Error en buscarLugar:', error);
      res.status(500).json({ 
        mensaje: "Error al buscar el lugar", 
        error: error.message,
        tipo: error.name,
        detalles: "Error interno del servidor al procesar la solicitud"
      });
    }
  }

  async crearLugar(req, res) {
    try {
      const { rol } = req.usuario;
      
      if (!rol) {
        return res.status(401).json({ 
          mensaje: "Error de autenticación",
          error: "Rol no definido en el token"
        });
      }

      if (rol !== 1 && rol !== 2) {
        return res.status(403).json({ 
          mensaje: "Acceso denegado",
          error: "No tiene permisos para crear lugares",
          detalles: "Solo los administradores pueden crear lugares"
        });
      }

      const { usuarioid, categoriaid, nombre, descripcion, ubicacion } = req.body;

      // Validación de campos requeridos
      const camposRequeridos = ['usuarioid', 'categoriaid', 'nombre', 'descripcion', 'ubicacion'];
      const camposFaltantes = camposRequeridos.filter(campo => !req.body[campo]);
      
      if (camposFaltantes.length > 0) {
        return res.status(400).json({
          mensaje: "Error de validación",
          error: "Campos requeridos faltantes",
          campos: camposFaltantes
        });
      }

      if (!req.file) {
        return res.status(400).json({ 
          mensaje: "Error de validación",
          error: "La imagen es requerida",
          detalles: "Debe proporcionar una imagen para el lugar"
        });
      }
    
      const uploadResponse = await cloudinaryService.subirImagen(
        req.file.buffer,
        `lugar-${Date.now()}`
      );
  
      if (!uploadResponse) {
        return res.status(500).json({ 
          mensaje: "Error al subir la imagen",
          error: "No se pudo procesar la imagen",
          detalles: "Error en el servicio de almacenamiento de imágenes"
        });
      }
  
      const dataLugar = {
        usuarioid,
        categoriaid,
        nombre,
        descripcion,
        ubicacion,
        estado: false,
        aprobacion: false,
        imagen: uploadResponse.secure_url,
      };
  
      const nuevoLugar = await LugarService.crearLugar(dataLugar);

      res.status(201).json({
        mensaje: "Lugar creado con éxito",
        lugar: nuevoLugar,
        detalles: "El lugar ha sido creado y está pendiente de aprobación"
      });
    } catch (error) {
      console.error('Error en crearLugar:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          mensaje: "Error de validación",
          error: "Datos inválidos",
          detalles: error.errors.map(e => e.message)
        });
      }
      res.status(500).json({ 
        mensaje: "Error al crear lugar", 
        error: error.message,
        tipo: error.name,
        detalles: "Error interno del servidor al procesar la solicitud"
      });
    }
  }
  
  async actualizarLugar(req, res) {
    try {
      const { rol } = req.usuario;
      
      if (!rol) {
        return res.status(401).json({ 
          mensaje: "Error de autenticación",
          error: "Rol no definido en el token"
        });
      }

      if (rol !== 1 && rol !== 2) {
        return res.status(403).json({ 
          mensaje: "Acceso denegado",
          error: "No tiene permisos para actualizar lugares",
          detalles: "Solo los administradores pueden actualizar lugares"
        });
      }

      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          mensaje: "Error de validación",
          error: "ID de lugar no proporcionado"
        });
      }

      const { usuarioid, categoriaid, nombre, descripcion, ubicacion } = req.body;
      let imagenUrl = null;

      if (req.file) {
        const uploadResponse = await cloudinaryService.subirImagen(
          req.file.buffer,
          `${id}-${Date.now()}`
        );

        if (!uploadResponse) {
          return res.status(500).json({ 
            mensaje: "Error al subir la imagen",
            error: "No se pudo procesar la imagen",
            detalles: "Error en el servicio de almacenamiento de imágenes"
          });
        }

        imagenUrl = uploadResponse.secure_url;
      }

      const lugarActualizado = await LugarService.actualizarLugar(id, {
        usuarioid, categoriaid, nombre, descripcion, ubicacion,
        imagen: imagenUrl || null,
      });

      res.json({
        mensaje: "Lugar actualizado con éxito",
        lugar: {
          ...lugarActualizado.dataValues,
          imagen: imagenUrl || lugarActualizado.imagen
        },
        detalles: "Los cambios han sido aplicados correctamente"
      });
    } catch (error) {
      console.error('Error en actualizarLugar:', error);
      if (error.name === 'LugarError') {
        switch (error.tipo) {
          case 'NO_ENCONTRADO':
            return res.status(404).json({
              mensaje: "Error al actualizar el lugar",
              error: error.message,
              detalles: "El lugar no existe o no se encontró"
            });
          case 'DUPLICADO':
            return res.status(409).json({
              mensaje: "No se puede actualizar el lugar",
              error: "El nombre ya está siendo utilizado",
              tipo: "conflicto",
              detalles: {
                campo: "nombre",
                valor: req.body.nombre,
                sugerencia: "Por favor, elija un nombre diferente"
              }
            });
          case 'VALIDACION':
            return res.status(400).json({
              mensaje: "Error de validación",
              error: error.message,
              detalles: "Los datos proporcionados no son válidos"
            });
          default:
            return res.status(500).json({
              mensaje: "Error al actualizar el lugar",
              error: "Error interno del servidor",
              detalles: "Error no manejado en la actualización"
            });
        }
      }

      res.status(500).json({
        mensaje: "Error al actualizar el lugar",
        error: error.message,
        tipo: error.name,
        detalles: "Error interno del servidor al procesar la solicitud"
      });
    }
  }

  async eliminarLugar(req, res) {
    try {
      const { rol } = req.usuario;
      
      if (!rol) {
        return res.status(401).json({ 
          mensaje: "Error de autenticación",
          error: "Rol no definido en el token"
        });
      }

      if (rol !== 1) {
        return res.status(403).json({ 
          mensaje: "Acceso denegado",
          error: "No tiene permisos para eliminar lugares",
          detalles: "Solo el super administrador puede eliminar lugares"
        });
      }

      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          mensaje: "Error de validación",
          error: "ID de lugar no proporcionado"
        });
      }

      const existeLugar = await LugarService.buscarLugar(id);
      if (!existeLugar) {
        return res.status(404).json({ 
          mensaje: "Lugar no encontrado",
          detalles: "No existe un lugar con el ID proporcionado"
        });
      }

      await LugarService.eliminarLugar(id);
      res.json({ 
        mensaje: "Lugar eliminado correctamente",
        detalles: "El lugar ha sido eliminado permanentemente"
      });
    } catch (error) {
      console.error('Error en eliminarLugar:', error);
      res.status(500).json({ 
        mensaje: "Error al eliminar lugar", 
        error: error.message,
        tipo: error.name,
        detalles: "Error interno del servidor al procesar la solicitud"
      });
    }
  }

  async cambiarEstado(req, res) {
    try {
      console.log('=== Inicio cambiarEstado ===');
      const { rol } = req.usuario;
      
      if (!rol) {
        return res.status(401).json({ 
          mensaje: "Error de autenticación",
          error: "Rol no definido en el token"
        });
      }

      if (rol !== 1 && rol !== 2) {
        return res.status(403).json({ 
          mensaje: "Acceso denegado",
          error: "No tiene permisos para cambiar el estado de lugares",
          detalles: "Solo los administradores pueden cambiar el estado de lugares"
        });
      }

      const { id } = req.params;
      const { estado } = req.body;

      console.log('Parámetros recibidos:', { id, estado });

      if (!id) {
        return res.status(400).json({
          mensaje: "Error de validación",
          error: "ID de lugar no proporcionado"
        });
      }

      if (typeof estado !== 'boolean') {
        return res.status(400).json({
          mensaje: "Error de validación",
          error: "Estado inválido",
          detalles: "El estado debe ser un valor booleano (true/false)"
        });
      }

      console.log('Intentando actualizar estado...');
      const actualizados = await LugarService.actualizarEstado(id, estado);
      console.log('Resultado de actualización:', actualizados);

      if (actualizados[0] === 0) {
        const existe = await LugarService.buscarLugar(id);
        if (!existe) {
          return res.status(404).json({ 
            mensaje: 'Lugar no encontrado',
            detalles: "No existe un lugar con el ID proporcionado"
          });
        }
        return res.status(200).json({ 
          mensaje: 'El estado ya estaba igual', 
          lugar: existe,
          detalles: "No se realizaron cambios en el estado"
        });
      }

      console.log('Buscando lugar actualizado...');
      const lugar = await LugarService.buscarLugar(id, true);
      console.log('Lugar encontrado:', lugar);
      
      // Obtener io para enviar notificaciones
      const io = req.app.get('io');

      // Si el lugar fue aprobado, notificar a los usuarios
      if (lugar.aprobacion) {
        console.log('Enviando notificaciones...');
        
        // Notificar al propietario del lugar (rol 3)
        console.log('Enviando notificación al propietario:', lugar.usuarioid);
        io.to(`usuario-${lugar.usuarioid}`).emit('lugar-aprobado', {
          lugar: lugar,
          timestamp: new Date().toISOString(),
          mensaje: '¡Tu lugar ha sido aprobado!'
        });

        // Notificar a usuarios (rol 4)
        console.log('Enviando notificación a usuarios (rol 4)');
        io.to('usuario-room').emit('nuevo-lugar-usuario', {
          lugar: lugar,
          timestamp: new Date().toISOString(),
          mensaje: `Nuevo lugar disponible: ${lugar.nombre}`
        });
        
        console.log('Notificaciones enviadas');
      } else {
        // Notificar rechazo al propietario
        console.log('Enviando notificación de rechazo al propietario:', lugar.usuarioid);
        io.to(`usuario-${lugar.usuarioid}`).emit('lugar-rechazado', {
          lugar: lugar,
          timestamp: new Date().toISOString(),
          mensaje: 'Tu lugar no fue aprobado y ya no está activo'
        });
      }

      res.json({ 
        mensaje: lugar.aprobacion ? 'aprobado' : 'rechazado', 
        lugar,
        notificaciones: {
          propietario: 'Notificación enviada al propietario',
          usuarios: lugar.aprobacion ? 'Notificación enviada a todos los usuarios' : 'No se requiere notificación a usuarios'
        }
      });
    } catch (error) {
      console.error('Error en cambiarEstado:', error);
      res.status(500).json({ 
        mensaje: 'Error al actualizar estado', 
        error: error.message,
        tipo: error.name,
        detalles: "Error interno del servidor al procesar la solicitud"
      });
    }
  }

  async listarLugaresPublicos(req, res) {
    try {
      const lugares = await LugarService.listarLugaresUsuario();
      
      if (!lugares || lugares.length === 0) {
        return res.status(404).json({ 
          mensaje: "No se encontraron lugares disponibles",
          detalles: "No hay lugares aprobados y activos en este momento"
        });
      }

      // Formatear la respuesta para incluir las fotos
      const lugaresFormateados = lugares.map(lugar => ({
        id: lugar.id,
        nombre: lugar.nombre,
        descripcion: lugar.descripcion,
        ubicacion: lugar.ubicacion,
        imagen: lugar.imagen,
        fotos_lugar: lugar.fotos_lugar ? lugar.fotos_lugar.split(',') : [],
        categoria: lugar.categoria ? {
          id: lugar.categoria.id,
          tipo: lugar.categoria.tipo
        } : null,
        eventos: lugar.eventos ? lugar.eventos.map(evento => ({
          id: evento.id,
          nombre: evento.nombre,
          descripcion: evento.descripcion,
          fecha_hora: evento.fecha_hora,
          imagen: evento.imagen
        })) : []
      }));

      res.status(200).json({
        mensaje: "Lugares obtenidos correctamente",
        lugares: lugaresFormateados
      });
    } catch (error) {
      console.error('Error en listarLugaresPublicos:', error);
      res.status(500).json({ 
        mensaje: "Error al listar lugares", 
        error: error.message,
        tipo: error.name,
        detalles: "Error interno del servidor al procesar la solicitud"
      });
    }
  }

}

module.exports = new LugarController();
