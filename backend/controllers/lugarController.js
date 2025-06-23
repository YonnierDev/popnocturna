const fs = require('fs');
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

      // Verificar que al menos se envió la imagen principal
      if (!req.files?.imagen) {
        return res.status(400).json({ 
          mensaje: "Error de validación",
          error: "La imagen principal es requerida",
          detalles: "Debe subir una imagen principal para el lugar"
        });
      }

      // Validar que la imagen principal sea una imagen
      if (!req.files.imagen[0].mimetype.startsWith('image/')) {
        return res.status(400).json({
          mensaje: "Error de validación",
          error: "Tipo de archivo no válido",
          detalles: "La imagen principal debe ser un archivo de imagen (jpg, png, etc.)"
        });
      }

      // Subir imagen principal
      const imagenUpload = await cloudinaryService.subirImagenLugar(
        req.files.imagen[0].buffer,
        `lugar-${Date.now()}-principal`
      );

      // Procesar fotos adicionales
      let fotosUrls = [];
      if (req.files?.fotos_lugar?.length > 0) {
        const uploadPromises = req.files.fotos_lugar.map((file, index) => 
          cloudinaryService.subirImagenLugar(
            file.buffer,
            `lugar-${Date.now()}-foto-${index}`
          )
        );
        const uploadResults = await Promise.all(uploadPromises);
        fotosUrls = uploadResults.map(result => result.secure_url);
      }

      // Procesar PDF
      let pdfUrl = null;
      if (req.files?.carta_pdf?.length > 0) {
        try {
          const pdfUpload = await cloudinaryService.subirPDF(
            req.files.carta_pdf[0].buffer,
            `carta-${Date.now()}`
          );
          if (pdfUpload) {
            pdfUrl = pdfUpload.secure_url;
          }
        } catch (error) {
          console.error('Error al subir PDF:', error);
          // No retornamos error si falla el PDF, ya que es opcional
        }
      }

      const dataLugar = {
        usuarioid,
        categoriaid,
        nombre,
        descripcion,
        ubicacion,
        estado: false,
        aprobacion: false,
        imagen: imagenUpload.secure_url,
        fotos_lugar: JSON.stringify(fotosUrls),
        carta_pdf: pdfUrl
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
      console.log('\n=== INICIO DE ACTUALIZACIÓN ===\n');
      console.log('Headers:', req.headers);
      console.log('Content-Type:', req.headers['content-type']);
      console.log('Body:', typeof req.body, JSON.stringify(req.body));
      console.log('Archivos:', typeof req.files, JSON.stringify(req.files));
      console.log('Usuario:', req.usuario);
      console.log('Parametros:', req.params);

      const { rol } = req.usuario;
      
      if (!rol) {
        return res.status(401).json({ 
          mensaje: "Error de autenticación",
          error: "Rol no definido en el token"
        });
      }

      // Solo superadmin puede actualizar
      if (rol !== 1) { 
        return res.status(403).json({ 
          mensaje: "Acceso denegado",
          error: "No tiene permisos para actualizar lugares",
          detalles: "Solo el superadministrador puede actualizar lugares"
        });
      }

      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          mensaje: "Error de validación",
          error: "ID de lugar no proporcionado"
        });
      }

      // Obtener el lugar existente para mantener la imagen si no se envía una nueva
      const lugarExistente = await LugarService.buscarLugar(id);
      if (!lugarExistente) {
        return res.status(404).json({
          mensaje: "Error",
          error: "Lugar no encontrado",
          detalles: "No se encontró el lugar con el ID especificado"
        });
      }

      // Verificar si se está actualizando la imagen
      let imagenUrl = lugarExistente.imagen;
      if (req.files?.imagen?.[0]) {
        // Verificar el tipo de archivo
        if (!req.files.imagen[0].mimetype.startsWith('image/')) {
          return res.status(400).json({
            mensaje: "Error de validación",
            error: "Tipo de archivo no válido para la imagen principal",
            detalles: "La imagen principal debe ser un archivo de imagen (jpg, png, etc.)"
          });
        }

        try {
          // Subir imagen principal
          const imagenUpload = await cloudinaryService.subirImagenLugar(
            req.files.imagen[0].buffer,
            `lugar-${Date.now()}-principal`
          );
          imagenUrl = imagenUpload.secure_url;
        } catch (error) {
          console.error('Error al subir imagen principal:', error);
          return res.status(500).json({
            mensaje: "Error al subir la imagen principal",
            error: error.message,
            detalles: "No se pudo subir la imagen a Cloudinary"
          });
        }
      }

      // Procesar fotos adicionales
      let fotosUrls = lugarExistente.fotos_lugar ? JSON.parse(lugarExistente.fotos_lugar) : [];
      if (req.files?.fotos_lugar?.length > 0) {
        try {
          const uploadPromises = req.files.fotos_lugar.map((file, index) => 
            cloudinaryService.subirImagenLugar(
              file.buffer,
              `lugar-${Date.now()}-foto-${index}`
            )
          );
          const uploadResults = await Promise.all(uploadPromises);
          const nuevasFotosUrls = uploadResults.map(result => result.secure_url);
          fotosUrls = [...fotosUrls, ...nuevasFotosUrls]; // Mantener las fotos existentes y agregar las nuevas
        } catch (error) {
          console.error('Error al subir fotos adicionales:', error);
          return res.status(500).json({
            mensaje: "Error al subir las fotos adicionales",
            error: error.message,
            detalles: "No se pudieron subir una o más fotos a Cloudinary"
          });
        }
      }

      // Procesar PDF
      let pdfUrl = lugarExistente.carta_pdf;
      if (req.files?.carta_pdf?.[0]) {
        try {
          const pdfUpload = await cloudinaryService.subirPDF(
            req.files.carta_pdf[0].buffer,
            `carta-${Date.now()}`
          );
          if (pdfUpload) {
            pdfUrl = pdfUpload.secure_url;
          }
        } catch (error) {
          console.error('Error al subir PDF:', error);
          // No retornamos error si falla el PDF, ya que es opcional
        }
      }

      // Obtener los datos del cuerpo de la solicitud o mantener los existentes
      const {
        usuarioid = lugarExistente.usuarioid,
        categoriaid = lugarExistente.categoriaid,
        nombre = lugarExistente.nombre,
        descripcion = lugarExistente.descripcion,
        ubicacion = lugarExistente.ubicacion,
        estado = lugarExistente.estado,
        aprobacion = lugarExistente.aprobacion
      } = req.body;

      const dataLugar = {
        usuarioid,
        categoriaid,
        nombre,
        descripcion,
        ubicacion,
        estado,
        aprobacion,
        imagen: imagenUrl, // Usar la nueva imagen o la existente (ya manejado arriba)
        fotos_lugar: JSON.stringify(fotosUrls),
        carta_pdf: pdfUrl
      };
  
      const lugarActualizado = await LugarService.actualizarLugar(id, dataLugar);

      console.log('Lugar actualizado:', lugarActualizado);

      res.json({
        mensaje: "Lugar actualizado con éxito",
        lugar: {
          ...lugarActualizado.dataValues,
          fotos_lugar: fotosUrls,
          // Si necesitas mantener la imagen existente cuando no se envía una nueva
          imagen: lugarActualizado.dataValues.imagen || imagenUrl
        },
        detalles: "Los cambios han sido aplicados correctamente"
      });
    } catch (error) {
      console.error('Error en actualizarLugar:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          mensaje: "Error de validación",
          error: "Datos inválidos",
          detalles: error.errors.map(e => e.message)
        });
      }
      res.status(500).json({ 
        mensaje: "Error al actualizar lugar", 
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
