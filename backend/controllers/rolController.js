const RolService = require("../service/rolService");

class RolController {
  async listarRol(req, res) {
    try {
      console.log(req.body);
      const listaRol = await RolService.listarRol();
      console.log("AQUI ESTOY");
      console.log(listaRol);
      
      res.status(201).json(listaRol);
    } catch (e) {
      res.json({ mensaje: "error en el servicio" });
    }
  }

  async crearRol(req, res) {
    try {
      const { nombre } = req.body;
      const respuesta = await RolService.crearRol(nombre);
      res.json(respuesta);
    } catch (e) {
      res.json({ mensaje: "error en el servicio" });
    }
  }

  async actualizarRol(req, res) {
    try {
      const { nombre } = req.body;
      const { id } = req.params;
      const resp = await RolService.actualizarRol(id, nombre);
      const buscarR = await RolService.buscarRol(id);

      res.json({ mensaje: "rol actualizado", rolActualizado: buscarR });
    } catch (e) {
      res.json({ mensaje: "error en el servicio" });
    }
  }
  async eliminarRol(req, res) {
    try {
      const { id } = req.params;
  
      const rolExistente = await RolService.buscarRol(id);
      if (!rolExistente) {
        return res.status(404).json({ mensaje: "El rol no existe" });
      }
  
      await RolService.eliminarRol(id);
  
      res.json({ mensaje: "Rol eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar rol:", error);
      res.status(500).json({ mensaje: "Error en el servicio", error: error.message });
    }
  }
  
  async buscarRol(req, res) {
    try {
      const { id } = req.params;
      const rol = await RolService.buscarRolConUsuarios(id);

      if (!rol) {
        return res.status(404).json({ mensaje: "Rol no encontrado" });
      }

      res.json(rol);
    } catch (error) {
      console.error("Error al buscar rol:", error);
      res.status(500).json({
        mensaje: "Error en el servicio",
        error: error.message
      });
    }
  }
  
}

module.exports = new RolController();
