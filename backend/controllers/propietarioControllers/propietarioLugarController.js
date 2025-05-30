const cloudinaryService = require("../../service/cloudinaryService");
const PropietarioLugarService = require("../../service/propietarioService/propietarioLugarService");
const { Op } = require("sequelize");
const { Lugar } = require("../../models");

class PropietarioLugarController {
  async listarLugaresPropietario(req, res) {
    try {
      const usuarioid = req.usuario.id;
      console.log("TOKEN:", usuarioid);
      const lugares =
        await PropietarioLugarService.listarLugaresPropietario(usuarioid);
      console.log("LUGARES ENCONTRADOS:", lugares);
      res.json(lugares);
    } catch (error) {
      console.error("Error al listar lugares:", error);
      res
        .status(500)
        .json({ error: "Error al listar lugares", detalles: error.message });
    }
  }

  async aprobarLugarPropietario(req, res) {
    try {
      const { id } = req.params;
      const { estado, aprobacion } = req.body;
      const result = await PropietarioLugarService.aprobarLugarPropietario(id, estado, aprobacion);
      const io = req.app.get('io');
      
      // Verificar que el usuario que aprueba es admin o superadmin
      if (![1, 2].includes(req.usuario.rol)) {
        return res.status(403).json({ 
          mensaje: 'Solo los administradores pueden aprobar lugares'
        });
      }

      if (result.aprobado) {
        console.log('Lugar aprobado, enviando notificaciones...');
        
        // Notificar al propietario del lugar (rol 3)
        const userId = result.lugar.usuarioid || (result.lugar.usuario && result.lugar.usuario.id);
        if (userId) {
          console.log('Enviando notificación al propietario:', userId);
          io.to(`usuario-${userId}`).emit('lugar-aprobado', {
            lugar: result.lugar,
            timestamp: new Date().toISOString(),
            mensaje: '¡Tu lugar ha sido aprobado por un administrador!'
          });
        }

        // Notificar a todos los usuarios (rol 4)
        console.log('Enviando notificación a usuarios (rol 4)');
        io.to('usuario-room').emit('nuevo-lugar-usuario', {
          lugar: result.lugar,
          timestamp: new Date().toISOString(),
          mensaje: `Nuevo lugar disponible: ${result.lugar.nombre}`
        });

        res.json({ 
          mensaje: 'Lugar aprobado correctamente', 
          lugar: result.lugar,
          notificaciones: {
            propietario: userId ? 'Notificación enviada al propietario' : 'No se pudo notificar al propietario',
            usuarios: 'Notificación enviada a todos los usuarios'
          }
        });
      } else {
        // Notificar rechazo solo al propietario
        const userId = result.lugar.usuarioid || (result.lugar.usuario && result.lugar.usuario.id);
        if (userId) {
          console.log('Enviando notificación de rechazo al propietario:', userId);
          io.to(`usuario-${userId}`).emit('lugar-rechazado', {
            lugar: result.lugar,
            timestamp: new Date().toISOString(),
            mensaje: 'Tu lugar no fue aprobado y ya no está activo'
          });
        }
        res.json({ 
          mensaje: 'Lugar no aprobado', 
          lugar: result.lugar,
          notificaciones: {
            propietario: userId ? 'Notificación de rechazo enviada al propietario' : 'No se pudo notificar al propietario'
          }
        });
      }
    } catch (error) {
      console.error("Error al aprobar el lugar:", error);
      // Notificar rechazo al propietario si existe el lugar
      try {
        const lugar = await Lugar.findByPk(req.params.id);
        const io = req.app.get('io');
        const userId = lugar.usuarioid || (lugar.usuario && lugar.usuario.id);
        if (userId) {
          console.log('Enviando notificación de error al propietario:', userId);
          io.to(`usuario-${userId}`).emit('lugar-rechazado', {
            lugar,
            timestamp: new Date().toISOString(),
            mensaje: `Tu lugar no pudo ser aprobado: ${error.message}`
          });
        }
      } catch (e) {
        console.error('Error al enviar notificación de error:', e);
      }
      res.status(400).json({ 
        mensaje: "Error al aprobar el lugar",
        error: error.message 
      });
    }
  }

  async crearLugarPropietario(req, res) {
    try {
      const usuarioid = req.usuario.id;
      const { categoriaid, nombre, descripcion, ubicacion } = req.body;
      let imagenUrl = null;
      let fotosUrls = [];
      let cartaPdfUrl = null;

      // Verificar si el nombre ya existe para este propietario
      const lugarExistente = await Lugar.findOne({
        where: {
          usuarioid,
          nombre: {
            [Op.eq]: nombre.toLowerCase()
          }
        }
      });

      if (lugarExistente) {
        return res.status(400).json({
          mensaje: "Ya tienes un lugar con este nombre",
          error: "El nombre del lugar debe ser único para cada propietario"
        });
      }

      // Procesar la imagen principal
      if (req.files && req.files['imagen']) {
        const uploadResponse = await cloudinaryService.subirImagen(
          req.files['imagen'][0].buffer,
          `lugar-${Date.now()}`
        );
        if (uploadResponse) {
          imagenUrl = uploadResponse.secure_url;
        }
      }

      // Procesar las fotos adicionales
      if (req.files && req.files['fotos_lugar']) {
        const uploadPromises = req.files['fotos_lugar'].map(file => 
          cloudinaryService.subirImagen(file.buffer, `lugar-${Date.now()}-${Math.random()}`)
        );
        
        const uploadResults = await Promise.all(uploadPromises);
        fotosUrls = uploadResults.map(result => result.secure_url);
      }

      // Procesar el PDF si existe
      if (req.files && req.files['carta_pdf']) {
        const pdfUpload = await cloudinaryService.subirPDF(
          req.files['carta_pdf'][0].buffer,
          `carta-${Date.now()}`
        );
        if (pdfUpload) {
          cartaPdfUrl = pdfUpload.secure_url;
        }
      }

      const nuevoLugar = await PropietarioLugarService.crearLugarPropietario({
        usuarioid,
        categoriaid,
        nombre: nombre.toLowerCase(),
        descripcion,
        ubicacion,
        imagen: imagenUrl,
        fotos_lugar: fotosUrls.join(','),
        carta_pdf: cartaPdfUrl,
        estado: false,
        aprobacion: false
      });

      // Intentar emitir socket si está disponible
      try {
        const io = req.app.get('io');
        if (io) {
          console.log('Enviando notificaciones de nuevo lugar...');
          
          // Notificar a administradores
          const adminPayload = {
            propietarioCorreo: req.usuario.correo,
            propietarioNombre: req.usuario.nombre || '',
            lugarNombre: nuevoLugar.nombre,
            lugarId: nuevoLugar.id,
            timestamp: new Date().toISOString(),
            mensaje: `El usuario ${req.usuario.correo}${req.usuario.nombre ? ' (' + req.usuario.nombre + ')' : ''} creó el lugar "${nuevoLugar.nombre}" que requiere aprobación.`
          };
          
          io.to('admin-room').emit('nuevo-lugar-admin', adminPayload);
          console.log('Notificación enviada a administradores');
          
          // Notificar al propietario
          const propietarioSocket = `usuario-${req.usuario.id}`;
          io.to(propietarioSocket).emit('nuevo-lugar-propietario', {
            lugar: nuevoLugar,
            timestamp: new Date().toISOString(),
            mensaje: 'Tu lugar está en revisión'
          });
          console.log('Notificación enviada al propietario');
        } else {
          console.log('Socket.IO no está disponible');
        }
      } catch (socketError) {
        console.error('Error al enviar notificaciones:', socketError);
      }

      return res.status(201).json({
        mensaje: "Lugar creado con éxito",
        lugar: {
          ...nuevoLugar.toJSON(),
          fotos_lugar: nuevoLugar.fotos_lugar ? nuevoLugar.fotos_lugar.split(',') : []
        }
      });
    } catch (error) {
      console.error("Error al crear lugar:", error);
      return res.status(500).json({ 
        mensaje: "Error al crear lugar", 
        error: error.message 
      });
    }
  }

  async buscarLugarPropietario(req, res) {
    try {
      const { nombre } = req.params;
      const usuarioid = req.usuario.id;
      const lugar =
        await PropietarioLugarService.buacarLugarPropietarioDetallado(nombre, usuarioid);
        if(!lugar || lugar.length === 0){
          return res.status(404).json({ mensaje: "Lugar no encontrado" });
        }
      res.json(lugar);
    } catch (error) {
      console.error("Error al buscar el lugar:", error);
      res
        .status(500)
        .json({ error: "Error al buscar el lugar", detalles: error.message });
    }
  }

  
  
  async listarComentariosYCalificacionesLugar(req, res) {
    try {
      const { lugarid } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
  
      // Buscar el lugar y traer su dueño (usuario)
      const lugar = await PropietarioLugarService.obtenerLugarPorIdConUsuario(lugarid);
  
      if (!lugar) {
        return res.status(404).json({
          success: false,
          mensaje: "Lugar no encontrado"
        });
      }
  
      // Verificar si el lugar le pertenece al usuario autenticado
      if (lugar.usuarioid !== req.usuario.id) {
        return res.status(403).json({
          success: false,
          mensaje: "Este lugar no te pertenece"
        });
      }
  
      // Verificar si el usuario tiene el rol de propietario (rolid === 3)
      if (lugar.usuario.rolid !== 3) {
        return res.status(403).json({
          success: false,
          mensaje: "No tienes permisos para ver esta información"
        });
      }
  
      // Todo OK, obtener comentarios y calificaciones
      const data = await PropietarioLugarService.listarComentariosYCalificacionesLugar(lugarid, page, limit);

      // Formatear la respuesta para incluir solo el nombre del lugar
      const response = {
        lugar: lugar.nombre,
        ...data
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error al listar comentarios y calificaciones:", error);
      res.status(500).json({
        success: false,
        mensaje: "Error al listar comentarios y calificaciones",
        error: error.message
      });
    }
  }
}

module.exports = new PropietarioLugarController();
