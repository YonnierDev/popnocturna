const cloudinaryService = require("../../service/cloudinaryService");
const PropietarioLugarService = require("../../service/propietarioService/propietarioLugarService");
const { Op } = require("sequelize");
const { Lugar } = require("../../models");

class PropietarioLugarController {
  async actualizarLugarPropietario(req, res) {
    const transaction = await Lugar.sequelize.transaction();
    try {
      const { id } = req.params;
      const datosActualizados = { ...req.body };
      const usuarioId = req.usuario.id;
      
      // Obtener el lugar actual
      const lugarActual = await Lugar.findByPk(id, { transaction });
      
      if (!lugarActual) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Lugar no encontrado' });
      }
      
      // Verificar que el usuario sea el propietario del lugar
      if (lugarActual.usuarioid !== usuarioId) {
        await transaction.rollback();
        return res.status(403).json({ error: 'No tienes permiso para actualizar este lugar' });
      }
      
      // Procesar la imagen principal si se envía
      if (req.files && req.files['imagen']) {
        // Subir la nueva imagen primero
        const imagenFile = req.files['imagen'][0];
        let uploadResult;
        
        try {
          uploadResult = await cloudinaryService.subirImagenLugar(
            imagenFile.buffer, 
            `lugar-${Date.now()}`
          );
          
          // Si la subida fue exitosa, eliminar la imagen anterior
          if (uploadResult && uploadResult.secure_url) {
            if (lugarActual.imagen) {
              try {
                await cloudinaryService.eliminarImagen(lugarActual.imagen);
              } catch (error) {
                console.error('Error al eliminar imagen anterior:', error);
                // No fallar la operación si hay error al eliminar
              }
            }
            datosActualizados.imagen = uploadResult.secure_url;
          }
        } catch (uploadError) {
          console.error('Error al subir la nueva imagen:', uploadError);
          await transaction.rollback();
          return res.status(500).json({
            error: 'Error al procesar la imagen',
            detalles: uploadError.message
          });
        }
      }
      
      // Procesar las fotos adicionales (máximo 5 en total)
      if (req.files && req.files['fotos_lugar'] && req.files['fotos_lugar'].length > 0) {
        const MAX_FOTOS = 5;
        const fotosParaSubir = req.files['fotos_lugar'];
        
        // Subir las nuevas fotos a Cloudinary
        const fotosSubidas = [];
        
        try {
          for (const foto of fotosParaSubir) {
            try {
              const uploadResult = await cloudinaryService.subirImagenLugar(
                foto.buffer,
                `lugar-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
              );
              
              if (uploadResult && uploadResult.secure_url) {
                fotosSubidas.push(uploadResult.secure_url);
              }
            } catch (uploadError) {
              console.error('Error al subir una de las fotos:', uploadError);
              // Continuar con las demás fotos si hay un error
            }
          }
          
          // Obtener fotos existentes o inicializar array vacío
          let fotosExistentes = [];
          if (lugarActual.fotos_lugar) {
            fotosExistentes = Array.isArray(lugarActual.fotos_lugar) 
              ? [...lugarActual.fotos_lugar] 
              : lugarActual.fotos_lugar.split(',');
              
            // Filtrar URLs válidas
            fotosExistentes = fotosExistentes
              .filter(url => url && typeof url === 'string' && url.trim() !== '');
          }
          
          // Combinar fotos existentes con las nuevas (las nuevas van primero)
          let todasLasFotos = [...fotosSubidas, ...fotosExistentes];
          
          // Limitar al número máximo de fotos permitidas
          const fotosParaGuardar = todasLasFotos.slice(0, MAX_FOTOS);
          
          // Si hay más fotos que el máximo, eliminar las más antiguas de Cloudinary
          if (todasLasFotos.length > MAX_FOTOS) {
            const fotosAEliminar = todasLasFotos.slice(MAX_FOTOS);
            
            for (const url of fotosAEliminar) {
              try {
                await cloudinaryService.eliminarImagen(url);
              } catch (error) {
                console.error('Error al eliminar foto antigua:', error);
                // Continuar con las demás si hay error
              }
            }
          }
          
          // Asignar las fotos al objeto de actualización
          datosActualizados.fotos_lugar = fotosParaGuardar.join(',');
          
          // Agregar advertencia si se excedió el límite
          if (fotosSubidas.length + fotosExistentes.length > MAX_FOTOS) {
            datosActualizados._advertencia = `Se alcanzó el límite de ${MAX_FOTOS} fotos. Se mantuvieron las más recientes.`;
          }
        } catch (error) {
          console.error('Error al procesar las fotos:', error);
          // Intentar eliminar las fotos recién subidas en caso de error
          for (const url of fotosSubidas) {
            try {
              await cloudinaryService.eliminarImagen(url);
            } catch (e) {
              console.error('Error al limpiar fotos después de error:', e);
            }
          }
          
          await transaction.rollback();
          return res.status(500).json({
            error: 'Error al procesar las fotos',
            detalles: error.message
          });
        }
      }
      
      // Procesar el PDF si se envía
      if (req.files && req.files['carta_pdf']) {
        // Eliminar el PDF anterior si existe
        if (lugarActual.carta_pdf) {
          try {
            await cloudinaryService.eliminarArchivo(lugarActual.carta_pdf);
          } catch (error) {
            console.error('Error al eliminar PDF anterior:', error);
            // No fallar la operación si hay error al eliminar
          }
        }
        // Usar la nueva ruta del PDF
        datosActualizados.carta_pdf = req.files['carta_pdf'][0].path;
      }
      
      // Verificar si el nombre ya existe en otro lugar
      if (datosActualizados.nombre && datosActualizados.nombre !== lugarActual.nombre) {
        const lugarExistente = await Lugar.findOne({
          where: {
            nombre: datosActualizados.nombre,
            id: { [Op.ne]: id } // Excluir el lugar actual
          },
          transaction
        });
        
        if (lugarExistente) {
          await transaction.rollback();
          return res.status(400).json({
            error: 'Error de validación',
            detalles: 'Ya existe un lugar con ese nombre. Por favor, elige otro nombre.'
          });
        }
      }
      
      // Depurar los datos que se van a actualizar
      console.log('=== DATOS A ACTUALIZAR ===');
      console.log('ID del lugar:', id);
      console.log('ID del usuario:', usuarioId);
      console.log('Datos a actualizar:', JSON.stringify(datosActualizados, null, 2));
      
      try {
        // Verificar si el lugar existe y el usuario tiene permiso
        const lugarExistente = await Lugar.findOne({
          where: { id, usuarioid: usuarioId },
          transaction
        });
        
        console.log('Lugar encontrado para actualizar:', lugarExistente ? 'Sí' : 'No');
        
        if (!lugarExistente) {
          await transaction.rollback();
          return res.status(404).json({ 
            error: 'No se pudo actualizar el lugar', 
            detalles: 'No se encontró el lugar o no tienes permiso para actualizarlo' 
          });
        }
        
        // Actualizar el lugar en la base de datos
        const [updated] = await Lugar.update(datosActualizados, {
          where: { id, usuarioid: usuarioId },
          transaction,
          returning: true
        });
        
        console.log('=== RESULTADO DE LA ACTUALIZACIÓN ===');
        console.log('Filas afectadas:', updated);
        
        if (updated === 0) {
          // Si no se actualizó ninguna fila, verificar por qué
          const lugarActual = await Lugar.findByPk(id, { transaction });
          console.log('Estado actual del lugar:', lugarActual ? 'Existe' : 'No existe');
          console.log('Usuario propietario:', lugarActual ? lugarActual.usuarioid : 'N/A');
          
          await transaction.rollback();
          return res.status(404).json({ 
            error: 'No se pudo actualizar el lugar', 
            detalles: 'No se realizaron cambios o no tienes permiso',
            debug: {
              lugarExiste: !!lugarActual,
              esPropietario: lugarActual ? (lugarActual.usuarioid === usuarioId) : false
            }
          });
        }
      } catch (updateError) {
        console.error('Error al actualizar el lugar:', updateError);
        await transaction.rollback();
        return res.status(500).json({ 
          error: 'Error al actualizar el lugar',
          detalles: updateError.message,
          stack: updateError.stack
        });
      }
      
      // Obtener el lugar actualizado con sus relaciones
      const lugarActualizado = await Lugar.findByPk(id, {
        include: [
          {
            model: require('../../models').Categoria,
            as: 'categoria',
            attributes: ['id', 'tipo']
          }
        ],
        transaction
      });
      
      // Asegurarse de que fotos_lugar sea un array válido en la respuesta
      const lugarResponse = lugarActualizado.toJSON();
      
      if (lugarResponse.fotos_lugar) {
        if (typeof lugarResponse.fotos_lugar === 'string') {
          // Si es un string, dividir por comas y limpiar
          lugarResponse.fotos_lugar = lugarResponse.fotos_lugar
            .split(',')
            .map(url => url.trim())
            .filter(url => url !== '');
        } else if (!Array.isArray(lugarResponse.fotos_lugar)) {
          // Si no es string ni array, inicializar como array vacío
          lugarResponse.fotos_lugar = [];
        }
      } else {
        // Si es null/undefined, inicializar como array vacío
        lugarResponse.fotos_lugar = [];
      }
      
      // Asegurar que todas las URLs sean strings válidos
      lugarResponse.fotos_lugar = lugarResponse.fotos_lugar
        .map(url => String(url).trim())
        .filter(url => url !== '');
      
      await transaction.commit();
      
      // Preparar la respuesta
      const respuesta = {
        mensaje: 'Lugar actualizado correctamente',
        lugar: lugarResponse
      };
      
      // Agregar advertencia si existe
      if (datosActualizados._advertencia) {
        respuesta.advertencia = datosActualizados._advertencia;
      }
      
      res.status(200).json(respuesta);
      
    } catch (error) {
      await transaction.rollback();
      console.error('Error en actualizarLugarPropietario:', error);
      
      // Manejar error de unicidad
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          error: 'Error de validación',
          detalles: 'Ya existe un lugar con ese nombre. Por favor, elige otro nombre.'
        });
      }
      
      // Para otros errores
      res.status(500).json({ 
        error: 'Error al actualizar el lugar',
        detalles: error.message 
      });
    }
  }
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
        const uploadResponse = await cloudinaryService.subirImagenLugar(
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
          cloudinaryService.subirImagenLugar(file.buffer, `lugar-${Date.now()}-${Math.random()}`)
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

      // Aseguramos que fotos_lugar sea un array
      const lugarResponse = nuevoLugar.toJSON();
      if (lugarResponse.fotos_lugar && typeof lugarResponse.fotos_lugar === 'string') {
        lugarResponse.fotos_lugar = lugarResponse.fotos_lugar.split(',');
      } else if (!lugarResponse.fotos_lugar) {
        lugarResponse.fotos_lugar = [];
      }
      
      return res.status(201).json({
        mensaje: "Lugar creado con éxito",
        lugar: lugarResponse
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

  async propietarioActualizarImagenesFotos(req, res) {
    try {
      const { id } = req.params;
      const usuarioid = req.usuario.id;

      // Verificar si el lugar existe y pertenece al usuario
      const lugar = await Lugar.findOne({
        where: {
          id,
          usuarioid
        }
      });

      if (!lugar) {
        return res.status(404).json({
          mensaje: "Lugar no encontrado",
          error: "No tienes un lugar con este ID"
        });
      }

      // Procesar la imagen principal si se envía
      let imagenUrl = lugar.imagen; // Mantener la imagen actual si no se envía nueva
      if (req.files && req.files['imagen']) {
        const uploadResponse = await cloudinaryService.subirImagenLugar(
          req.files['imagen'][0].buffer,
          `lugar-${Date.now()}`
        );
        if (uploadResponse) {
          // Eliminar la imagen anterior si existe
          if (lugar.imagen) {
            await cloudinaryService.eliminarImagen(lugar.imagen);
          }
          imagenUrl = uploadResponse.secure_url;
        }
      }

      // Procesar las fotos adicionales
      let fotosUrls = lugar.fotos_lugar || [];
      if (req.files && req.files['fotos_lugar']) {
        // Eliminar fotos anteriores si existen
        if (lugar.fotos_lugar && lugar.fotos_lugar.length > 0) {
          await Promise.all(
            lugar.fotos_lugar.map(url => cloudinaryService.eliminarImagen(url))
          );
        }
        
        // Subir nuevas fotos
        const uploadPromises = req.files['fotos_lugar'].map(file => 
          cloudinaryService.subirImagenLugar(file.buffer, `lugar-${Date.now()}-${Math.random()}`)
        );
        
        const uploadResults = await Promise.all(uploadPromises);
        fotosUrls = uploadResults.map(result => result.secure_url);
      }

      // Actualizar el lugar
      await lugar.update({
        imagen: imagenUrl,
        fotos_lugar: fotosUrls
      });

      // Aseguramos que fotos_lugar sea un array en la respuesta
      const lugarResponse = lugar.toJSON();
      if (lugarResponse.fotos_lugar && typeof lugarResponse.fotos_lugar === 'string') {
        lugarResponse.fotos_lugar = lugarResponse.fotos_lugar.split(',');
      }

      return res.status(200).json({
        mensaje: "Imágenes actualizadas exitosamente",
        lugar: lugarResponse
      });
    } catch (error) {
      console.error("Error al actualizar imágenes:", error);
      return res.status(500).json({ 
        mensaje: "Error al actualizar imágenes", 
        error: error.message 
      });
    }
  }

}

module.exports = new PropietarioLugarController();
