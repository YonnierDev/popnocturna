const solicitudService = require('../service/solicitudService');

class SolicitudController {
  async crear(req, res) {
    try {
      const data = {
        usuario_id: req.usuario.id,
        descripcion: req.body.descripcion,
        estado: 'pendiente',
      };
      const solicitud = await solicitudService.crear(data);
      res.status(201).json(solicitud);
    } catch (error) {
      console.error('Error creando solicitud:', error);
      res.status(500).json({ mensaje: 'Error al crear la solicitud' });
    }
  }

  async listarTodas(req, res) {
    try {
      const solicitudes = await solicitudService.obtenerTodas();
      res.json(solicitudes);
    } catch (error) {
      console.error('Error listando solicitudes:', error);
      res.status(500).json({ mensaje: 'Error al obtener las solicitudes' });
    }
  }

  async obtenerPorId(req, res) {
    try {
      const solicitud = await solicitudService.obtenerPorId(req.params.id);
      res.json(solicitud);
    } catch (error) {
      res.status(error.status || 500).json({ mensaje: error.mensaje || 'Error al obtener la solicitud' });
    }
  }

  async listarMias(req, res) {
    try {
      const solicitudes = await solicitudService.obtenerPorUsuario(req.usuario.id);
      res.json(solicitudes);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener tus solicitudes' });
    }
  }

  async actualizar(req, res) {
    try {
      await solicitudService.actualizar(req.params.id, req.body);
      res.json({ mensaje: 'Solicitud actualizada correctamente' });
    } catch (error) {
      res.status(error.status || 500).json({ mensaje: error.mensaje || 'Error al actualizar la solicitud' });
    }
  }

  async actualizarEstado(req, res) {
    try {
      const { estado } = req.body;
      if (!estado) {
        return res.status(400).json({ mensaje: 'Debes enviar un estado' });
      }
      const respuesta = await solicitudService.actualizarEstado(req.params.id, estado);
      res.json(respuesta);
    } catch (error) {
      res.status(error.status || 500).json({ mensaje: error.mensaje || 'Error al actualizar el estado' });
    }
  }

  async eliminar(req, res) {
    try {
      const respuesta = await solicitudService.eliminar(req.params.id);
      res.json(respuesta);
    } catch (error) {
      res.status(error.status || 500).json({ mensaje: error.mensaje || 'Error al eliminar la solicitud' });
    }
  }
}

module.exports = new SolicitudController();
