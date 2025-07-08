const SolicitudOcultarComentarioService = require("../../service/propietarioService/solicitudOcultarComentarioService");
const autentiMiddleware = require("../../middlewares/autentiMiddleware");
const validarRol = require("../../middlewares/validarRol");

class SolicitudOcultarComentarioController {
  // Propietario solicita ocultar un comentario
  async solicitarOcultar(req, res) {
    try {
      console.log('=== Inicio de solicitarOcultar en controlador ===');
      console.log('Datos recibidos:', {
        comentarioid: req.params.comentarioid,
        motivo: req.body.motivo_reporte,
        usuario: req.usuario
      });

      const { comentarioid } = req.params;
      const { motivo_reporte } = req.body;
      const { id: usuarioid, rol } = req.usuario;

      // Validar que el usuario sea propietario
      if (rol !== 3) {
        console.log('Error: Usuario no es propietario');
        return res.status(403).json({
          error: "Solo los propietarios pueden reportar comentarios"
        });
      }

      // Validar que se proporcione el motivo
      if (!motivo_reporte) {
        console.log('Error: Motivo no proporcionado');
        return res.status(400).json({
          error: "El motivo del reporte es requerido"
        });
      }

      // Verificar que el comentario existe y obtener su estado
      const comentario = await SolicitudOcultarComentarioService.obtenerComentario(comentarioid);
      if (!comentario) {
        console.log('Error: Comentario no encontrado');
        return res.status(404).json({
          error: "Comentario no encontrado"
        });
      }

      // Verificar el estado actual del comentario
      if (comentario.aprobacion === 0) {
        console.log('Error: Comentario ya reportado y pendiente de revisión');
        return res.status(400).json({
          error: "Este comentario ya ha sido reportado y está pendiente de revisión"
        });
      }
      
      // Si el comentario ya fue aprobado, no se puede reportar
      if (comentario.aprobacion === 1) {
        console.log('Error: Comentario ya fue aprobado');
        return res.status(400).json({
          error: "Este comentario ya fue aprobado y no puede ser reportado"
        });
      }

      // Llamada al servicio pasando los parámetros necesarios
      const resultado = await SolicitudOcultarComentarioService.solicitarOcultar(
        comentarioid,
        motivo_reporte,
        usuarioid
      );

      console.log('Solicitud procesada exitosamente:', resultado);

      res.status(200).json({
        mensaje: "Solicitud registrada exitosamente",
        datos: resultado
      });
    } catch (error) {
      console.error("Error en solicitarOcultar:", error.message);
      res.status(500).json({
        error: error.message
      });
    }
  }

  // Admin lista todos los comentarios pendientes de revisión
  async listarPendientes(req, res) {
    try {
      const comentarios =
        await SolicitudOcultarComentarioService.listarComentariosPendientes();

      res.status(200).json({
        mensaje: "Comentarios pendientes de revisión",
        datos: comentarios,
      });
    } catch (error) {
      console.error("Error al listar comentarios pendientes:", error);
      res.status(500).json({
        error: "Error al obtener los comentarios pendientes",
      });
    }
  }

  // Admin obtiene detalles de un comentario específico
  async obtenerDetalle(req, res) {
    try {
      const { comentarioid } = req.params;
      const comentario = await SolicitudOcultarComentarioService.obtenerDetallesComentario(comentarioid);

      if (!comentario) {
        return res.status(404).json({
          mensaje: "No hay comentario disponible con el ID proporcionado",
          datos: null
        });
      }

      // Determinar el estado del comentario basado en el campo aprobacion
      let estadoComentario = 'Desconocido';
      switch(comentario.aprobacion) {
        case 0:
          estadoComentario = 'Pendiente de revisión';
          break;
        case 1:
          estadoComentario = 'Comentario inactivo (oculto)';
          break;
        case 2:
          estadoComentario = 'Comentario activo (visible)';
          break;
      }

      const respuesta = {
        mensaje: `Comentario reportado por: ${comentario.evento?.lugar?.usuario?.nombre || 'Propietario no disponible'}, correo: ${comentario.evento?.lugar?.usuario?.correo || 'No disponible'}`,
        estado: estadoComentario,
        datos: {
          comentario: {
            id: comentario.id,
            contenido: comentario.contenido,
            estado: comentario.estado,
            aprobacion: comentario.aprobacion,
            estado_aprobacion: estadoComentario,
            motivo_reporte: comentario.motivo_reporte,
            fecha_creacion: comentario.createdAt,
            fecha_actualizacion: comentario.updatedAt,
            usuario: {
              id: comentario.usuario?.id,
              nombre: comentario.usuario?.nombre,
              correo: comentario.usuario?.correo
            },
            evento: {
              nombre: comentario.evento?.nombre,
              lugar: {
                nombre: comentario.evento?.lugar?.nombre,
                propietario: {
                  nombre: comentario.evento?.lugar?.usuario?.nombre,
                  correo: comentario.evento?.lugar?.usuario?.correo
                }
              }
            }
          }
        }
      };

      res.status(200).json(respuesta);
    } catch (error) {
      console.error("Error al obtener detalles del comentario:", error);
      res.status(500).json({
        mensaje: "Error al obtener los detalles del comentario",
        error: error.message
      });
    }
  }



  async procesarSolicitud(req, res) {
    try {
      const { comentarioid } = req.params;  // ID del comentario a procesar
      const { decision } = req.body;  // 1 para aprobar/ocultar, 2 para rechazar/mantener
      const administradorId = req.usuario.id; // ID del administrador que realiza la acción

      // Validar que se proporcione una decisión
      if (decision === undefined || decision === null) {
        return res.status(400).json({
          mensaje: 'Se requiere especificar una decisión (1 para aprobar/ocultar, 2 para rechazar/mantener)',
          datos: null
        });
      }

      // Validar que la decisión sea 1 o 2
      if (![1, 2].includes(parseInt(decision))) {
        return res.status(400).json({
          mensaje: 'La decisión debe ser 1 (aprobado/ocultar) o 2 (rechazado/mantener)',
          datos: null
        });
      }

      // Procesar la solicitud con el servicio
      const resultado = await SolicitudOcultarComentarioService.procesarSolicitud(
        comentarioid,
        decision,
        administradorId
      );

      // Usar el mensaje del servicio
      return res.status(200).json({
        mensaje: resultado.mensaje,
        exito: true,
        datos: {
          comentario: resultado.comentario,
          procesadoPor: resultado.procesadoPor
        }
      });

    } catch (error) {
      console.error("Error al procesar solicitud:", error);
      
      // Manejar diferentes tipos de errores
      if (error.message.includes('no está pendiente de revisión') || 
          error.message.includes('no encontrado') ||
          error.message.includes('ya fue aprobado') ||
          error.message.includes('no tiene reportes')) {
        return res.status(400).json({
          error: error.message || 'Error al procesar la solicitud',
          mensaje: error.message || 'Ocurrió un error al procesar la solicitud'
        });
      }

      // Error genérico
      res.status(500).json({
        error: 'Ocurrió un error al procesar la solicitud',
        mensaje: 'Ocurrió un error inesperado al procesar la solicitud'
      });
    }
  }


}

module.exports = new SolicitudOcultarComentarioController();
