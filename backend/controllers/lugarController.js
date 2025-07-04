const fs = require('fs');
const cloudinaryService = require("../service/cloudinaryService");
const LugarService = require("../service/lugarService");

// Asegurar que el servicio Cloudinary esté disponible
if (!cloudinaryService) {
  throw new Error('Cloudinary service no está disponible');
}

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

        const { usuarioid, categoriaid, nombre, descripcion, ubicacion, estado, aprobacion } = req.body;

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
     const estadoValido = Number(estado) === 0 || Number(estado) === 1;
    const aprobacionValida = Number(aprobacion) === 0 || Number(aprobacion) === 1;
      
      if (!estadoValido || !aprobacionValida) {
        return res.status(400).json({
          mensaje: "Error de validación",
          error: "Valores inválidos para estado o aprobación",
          detalles: "Los valores de estado y aprobación deben ser 0 o 1"
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
         estado: estado || 0,
        aprobacion: aprobacion || 0,
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
        try {
          // Primero eliminar la imagen existente si existe
          if (lugarExistente.imagen) {
            const publicId = lugarExistente.imagen.split('/').pop().split('.')[0];
            try {
              await cloudinaryService.eliminarImagen(publicId);
            } catch (error) {
              console.error('Error al eliminar imagen anterior:', error);
            }
          }

          const upload = await cloudinaryService.subirImagenLugar(
            req.files.imagen[0].buffer,
            `lugar-${Date.now()}-principal`
          );
          imagenUrl = upload.secure_url;
        } catch (error) {
          console.error('Error al subir imagen principal:', error);
          // Si falla la subida, mantener la imagen existente
        }
      }

      // Procesar fotos adicionales
      let fotosUrls = lugarExistente.fotos_lugar;
      if (req.files?.fotos_lugar?.length > 0) {
        try {
          // Asegurarse de que fotosUrls sea un array
          let fotosArray = [];
          try {
            if (Array.isArray(fotosUrls)) {
              fotosArray = [...fotosUrls];
            } else if (typeof fotosUrls === 'string') {
              fotosArray = JSON.parse(fotosUrls);
            }
          } catch (e) {
            console.error('Error al parsear fotos existentes:', e);
            fotosArray = [];
          }

          // Eliminar fotos existentes de Cloudinary
          for (const foto of fotosArray) {
            try {
              if (foto) {
                const publicId = foto.split('/').pop().split('.')[0];
                await cloudinaryService.eliminarImagen(publicId);
              }
            } catch (error) {
              console.error('Error al eliminar foto:', error);
            }
          }

          // Subir nuevas fotos
          const uploadPromises = req.files.fotos_lugar.map((file, index) =>
            cloudinaryService.subirImagenLugar(
              file.buffer,
              `lugar-${Date.now()}-foto-${index}`
            )
          );
          const uploadResults = await Promise.all(uploadPromises);

          // Guardar las nuevas URLs
          fotosUrls = uploadResults.map(result => result.secure_url);
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
          // Eliminar PDF anterior si existe
          if (lugarExistente.carta_pdf) {
            const publicId = lugarExistente.carta_pdf.split('/').pop().split('.')[0];
            try {
              await cloudinary.uploader.destroy(publicId);
            } catch (error) {
              console.error('Error al eliminar PDF anterior:', error);
            }
          }

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
        imagen: imagenUrl,
        fotos_lugar: fotosUrls,
        carta_pdf: pdfUrl
      };

      console.log('Datos a actualizar:', dataLugar);

      try {
        const lugarActualizado = await LugarService.actualizarLugar(id, dataLugar);
        console.log('Lugar actualizado:', lugarActualizado);

        // Obtener el lugar actualizado con las relaciones
        const lugarActualizadoConRelaciones = await LugarService.buscarLugar(id);
        
        // Asegurarse de que fotos_lugar sea un array limpio
        let fotos_lugar = [];
        try {
          if (lugarActualizadoConRelaciones.fotos_lugar) {
            let fotos = lugarActualizadoConRelaciones.fotos_lugar;
            // Si es un string, intentar parsear
            if (typeof fotos === 'string') {
              // Eliminar múltiples capas de escape
              while (fotos.includes('\\"')) {
                fotos = JSON.parse(fotos);
              }
              // Si después de limpiar es un array, usarlo
              if (Array.isArray(fotos)) {
                fotos_lugar = fotos.flat();
              } else if (typeof fotos === 'string') {
                // Si es un string, intentar parsear como JSON
                try {
                  const parsed = JSON.parse(fotos);
                  fotos_lugar = Array.isArray(parsed) ? parsed : [parsed];
                } catch (e) {
                  fotos_lugar = [fotos];
                }
              }
            } else if (Array.isArray(fotos)) {
              fotos_lugar = fotos.flat();
            }
          }
        } catch (e) {
          console.error('Error al procesar fotos_lugar:', e);
          fotos_lugar = [];
        }
        
        // Crear la respuesta
        const respuesta = {
          mensaje: "Lugar actualizado con éxito",
          lugar: {
            ...lugarActualizadoConRelaciones.dataValues,
            // Asegurarse de que fotos_lugar sea un array plano
            fotos_lugar: fotos_lugar.flat().filter(Boolean),
            // Mantener la imagen existente cuando no se envía una nueva
            imagen: lugarActualizadoConRelaciones.imagen || imagenUrl
          },
          detalles: "Los cambios han sido aplicados correctamente"
        };
        
        res.json(respuesta);
      } catch (error) {
        console.error('Error detallado al actualizar lugar:', error);
        throw error; // Re-lanzar el error para que lo maneje el catch general
      }
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
      const { rol } = req.usuario || {};

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
      const lugaresFormateados = lugares.map(lugar => {
        // Asegurarse de que fotos_lugar sea un array
        let fotos_lugar = [];
        try {
          if (lugar.fotos_lugar) {
            if (typeof lugar.fotos_lugar === 'string') {
              fotos_lugar = JSON.parse(lugar.fotos_lugar);
            } else if (Array.isArray(lugar.fotos_lugar)) {
              fotos_lugar = lugar.fotos_lugar;
            }
          }
        } catch (e) {
          console.error('Error al parsear fotos_lugar:', e);
          fotos_lugar = [];
        }

        return {
          id: lugar.id,
          nombre: lugar.nombre,
          descripcion: lugar.descripcion,
          ubicacion: lugar.ubicacion,
          imagen: lugar.imagen,
          fotos_lugar: Array.isArray(fotos_lugar) ? fotos_lugar : [],
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
        };
      });

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

 async listarLugaresPorCategoria(req, res) {
  try {
    const { categoriaid } = req.params;

    // Basic validation
    if (!categoriaid || isNaN(categoriaid)) {
      return res.status(400).json({
        mensaje: "Error de validación",
        error: "ID de categoría no válido o no proporcionado"
      });
    }

    // Verify category exists
    const categoria = await LugarService.verificarCategoria(categoriaid);
    if (!categoria) {
      return res.status(404).json({
        mensaje: "Categoría no encontrada",
        detalles: "No existe una categoría con el ID proporcionado"
      });
    }

    // Get approved places in this category
    const lugares = await LugarService.listarLugaresPorCategoria(categoriaid);

    if (!lugares || lugares.length === 0) {
      return res.status(404).json({
        mensaje: "No se encontraron lugares en esta categoría",
        detalles: `No hay lugares registrados en la categoría ${categoria.tipo}`,
        categoria: categoria.tipo
      });
    }

    res.status(200).json({
      mensaje: `Lugares encontrados en la categoría ${categoria.tipo}`,
      cantidad: lugares.length,
      categoria: categoria.tipo,
      datos: lugares
    });

  } catch (error) {
    console.error('Error en listarLugaresPorCategoria:', error);
    res.status(500).json({
      mensaje: "Error al buscar lugares por categoría",
      error: error.message,
      tipo: error.name,
      detalles: "Error interno del servidor al procesar la solicitud"
    });
  }
}

async obtenerEventosDeLugar(req, res) {
  try {
    const { lugarid } = req.params;

    if (!lugarid || isNaN(lugarid)) {
      return res.status(400).json({
        mensaje: "Error de validación",
        error: "ID de lugar no válido o no proporcionado"
      });
    }

    const resultado = await LugarService.obtenerEventosDeLugar(lugarid);

    if (!resultado.eventos || resultado.eventos.length === 0) {
      return res.status(404).json({
        mensaje: "No se encontraron eventos para este lugar",
        detalles: `El lugar ${resultado.lugar.nombre} no tiene eventos registrados`,
        lugar: resultado.lugar
      });
    }

    res.status(200).json({
      mensaje: "Eventos obtenidos correctamente",
      datos: resultado.eventos.map(evento => ({
        ...evento,
        lugar: resultado.lugar
      }))
    });

  } catch (error) {
    console.error('Error en obtenerEventosDeLugar:', error);
    if (error.message === 'Lugar no encontrado') {
      return res.status(404).json({
        mensaje: "Lugar no encontrado",
        error: error.message
      });
    }
    res.status(500).json({
      mensaje: "Error al obtener eventos del lugar",
      error: error.message,
      detalles: "Error interno del servidor al procesar la solicitud"
    });
  }
}

}

module.exports = new LugarController();
