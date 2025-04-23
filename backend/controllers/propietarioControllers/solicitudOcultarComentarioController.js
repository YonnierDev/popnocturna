const SolicitudOcultarComentarioService = require("../../service/propietarioService/solicitudOcultarComentarioService");
const autentiMiddleware = require("../../middlewares/autentiMiddleware");
const validarRol = require("../../middlewares/validarRol");

class SolicitudOcultarComentarioController {
  // Propietario solicita ocultar un comentario
  async solicitarOcultar(req, res) {
    try {
      const { comentarioid } = req.params;
      const { motivo_reporte } = req.body;

      if (!motivo_reporte) {
        return res.status(400).json({
          error: "El motivo del reporte es requerido",
        });
      }

      // Llamada al servicio pasando solo los parámetros necesarios
      const resultado =
        await SolicitudOcultarComentarioService.solicitarOcultar(
          comentarioid,
          motivo_reporte,
          req.usuario.id // Se pasa solo el ID del usuario
        );

      res.status(200).json({
        mensaje: "Solicitud registrada exitosamente",
        datos: resultado,
      });
    } catch (error) {
      console.error("Error en solicitudOcultar:", error.message); // Mostrar mensaje real
      res.status(500).json({
        error: error.message,
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
          error: "Comentario no encontrado",
        });
      }
  
      const mensaje = comentario.estado === "inactivo"
        ? "Comentario inactivo"
        : "Comentario activo";
  
      res.status(200).json({
        mensaje,
        datos: {
          id: comentario.id,
          contenido: comentario.contenido,
          estado: comentario.estado,
          usuario: comentario.usuario.nombre,
          fecha_creacion: comentario.createdAt,
          fecha_actualizacion: comentario.updatedAt,
        },
      });
  
    } catch (error) {
      console.error("Error al obtener detalles del comentario:", error);
      res.status(500).json({
        error: "Error al obtener los detalles del comentario",
      });
    }
  }
  


  async procesarSolicitud(req, res) {
    try {
      const { comentarioid } = req.params;  // Extraemos el comentarioid de los parámetros de la URL
      const { decision } = req.body;  // Extraemos la decisión del cuerpo de la solicitud
      const administracion_id = req.usuario.id; // ID del administrador, asumiendo que viene en el token
    
      // Verificar que la decisión sea "ocultar" o "mantener"
      if (!["ocultar", "mantener"].includes(decision)) {
        return res.status(400).json({
          error: 'La decisión debe ser "ocultar" o "mantener"',
        });
      }
    
      // Procesar la solicitud con el servicio
      const resultado = await SolicitudOcultarComentarioService.procesarSolicitud(
        comentarioid,
        decision,
        administracion_id
      );
    
      return res.status(200).json({
        mensaje: `Comentario ${decision === "ocultar" ? "ocultado" : "mantenido"} exitosamente`,
        datos: resultado,  // Devuelves los datos del comentario actualizado
      });
    } catch (error) {
      console.error("Error al procesar solicitud:", error);
      return res.status(500).json({
        error: "Error al procesar la solicitud",  // Error genérico para el cliente
      });
    }
  }
  

}

module.exports = new SolicitudOcultarComentarioController();
