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
      if (result.aprobado) {
        // Notificar aprobado
        const userId = result.lugar.usuarioid || (result.lugar.usuario && result.lugar.usuario.id);
        if (userId) {
          io.to(`usuario-${userId}`).emit('lugar-aprobado', {
            lugar: result.lugar,
            timestamp: new Date().toISOString(),
            mensaje: '¡Tu lugar ha sido aprobado por un administrador!'
          });
        }
        res.json({ mensaje: 'Lugar aprobado correctamente', lugar: result.lugar });
      } else {
        // Notificar rechazo
        const userId = result.lugar.usuarioid || (result.lugar.usuario && result.lugar.usuario.id);
        if (userId) {
          io.to(`usuario-${userId}`).emit('lugar-rechazado', {
            lugar: result.lugar,
            timestamp: new Date().toISOString(),
            mensaje: 'Tu lugar no fue aprobado y ya no está activo'
          });
        }
        res.json({ mensaje: 'Lugar no aprobado', lugar: result.lugar });
      }
    } catch (error) {
      console.error("Error al aprobar el lugar:", error);
      // Notificar rechazo al propietario si existe el lugar
      try {
        const lugar = await Lugar.findByPk(req.params.id);
        const io = req.app.get('io');
        const userId = lugar.usuarioid || (lugar.usuario && lugar.usuario.id);
        if (userId) {
          io.to(`usuario-${userId}`).emit('lugar-rechazado', {
            lugar,
            timestamp: new Date().toISOString(),
            mensaje: `Tu lugar no pudo ser aprobado: ${error.message}`
          });
        }
      } catch (e) {}
      res.status(400).json({ error: error.message });
    }
  }

  async crearLugarPropietario(req, res) {
    try {
      const usuarioid = req.usuario.id;
      const { categoriaid, nombre, descripcion, ubicacion } = req.body;
      let imagenUrl = null;

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

      if (!req.file) {
        console.log("No se recibió imagen");
        return res.status(400).json({ mensaje: "La imagen es requerida" });
      }

      console.log("Imagen recibida:", req.file);

      // Subir la imagen a Cloudinary
      const uploadResponse = await cloudinaryService.subirImagen(
        req.file.buffer,
        `lugar-${Date.now()}`
      );

      if (!uploadResponse) {
        console.log("Error al subir la imagen");
        return res.status(500).json({ mensaje: "Error al subir la imagen" });
      }

      imagenUrl = uploadResponse.secure_url;
      console.log("Imagen subida:", imagenUrl);

      const nuevoLugar = await PropietarioLugarService.crearLugarPropietario({
        usuarioid,
        categoriaid,
        nombre: nombre.toLowerCase(),
        descripcion,
        ubicacion,
        imagen: imagenUrl,
        estado: false,
        aprobacion: false
      });

      console.log("Lugar creado:", nuevoLugar);

      // Intentar emitir socket si está disponible
      try {
        const io = req.app.get('io');
        if (io) {
          // LOG: Sockets en admin-room antes de emitir
          const socketsAdminRoom = Array.from(io.sockets.adapter.rooms.get('admin-room') || []);
          console.log('[NOTIFY ADMIN] Sockets actualmente en admin-room:', socketsAdminRoom);
          
          const adminPayload = {
            propietarioCorreo: req.usuario.correo,
            propietarioNombre: req.usuario.nombre || '',
            lugarNombre: nuevoLugar.nombre,
            lugarId: nuevoLugar.id,
            timestamp: new Date().toISOString(),
            mensaje: `El usuario ${req.usuario.correo}${req.usuario.nombre ? ' (' + req.usuario.nombre + ')' : ''} creó el lugar "${nuevoLugar.nombre}" que requiere aprobación.`
          };
          
          io.to('admin-room').emit('nuevo-lugar-admin', adminPayload);
          
          // Notificar al propietario específicamente
          const propietarioSocket = `usuario-${req.usuario.id}`;
          io.to(propietarioSocket).emit('nuevo-lugar-propietario', {
            lugar: nuevoLugar,
            timestamp: new Date().toISOString(),
            mensaje: 'Tu lugar está en revisión'
          });
        }
      } catch (socketError) {
        console.log('Socket no disponible:', socketError.message);
      }

      return res.status(201).json({
        mensaje: "Lugar creado con éxito",
        lugar: nuevoLugar,
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
