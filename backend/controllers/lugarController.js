const LugarService = require("../service/lugarService");

class LugarController {
  async listarLugares(req, res) {
    try {
      const listarLugares = await LugarService.listarLugares();
      res.json(listarLugares);
    } catch (e) {
      res
        .status(500)
        .json({ mensaje: "Error en el servicio", error: e.message });
    }
  }

  async crearLugar(req, res) {
    try {
      const { categoriaid, Lugarid, descripcion, ubicacion } = req.body;

      // Verificar si la categoria ya existe
      const categoriaExistente = await LugarService.verificarCategoria(categoriaid);
      if (!categoriaExistente) {
        return res.status(400).json({ mensaje: "La Categoria no existe" });
      }

      const usuarioExistente = await LugarService.verificarLugar(usuarioid);
      if (!usuarioExistente) {
        return res.status(400).json({ mensaje: "El Usuario no existe" });
      }

      const nuevoLugar = await LugarService.crearLugar({
        categoriaid,
        Lugarid,
        descripcion,
        ubicacion,
      });

      res.status(201).json(nuevoLugar);
    } catch (error) {
      console.error("Error detallado:", error);
      res.status(500).json({
        mensaje: "Error en el servicio",
        error: error.message,
        stack: error.stack,
      });
    }
  }

  async actualizarLugar(req, res) {
    try {
      const { id } = req.params;
      const { categoriaid, usuarioid, descripcion, ubicacion } = req.body;

      // Verificar si la categoria ya existe
      const categoriaExistente = await LugarService.verificarCategoria(categoriaid);
      if (!categoriaExistente) {
        return res.status(400).json({ mensaje: "La Categoria no existe" });
      }

      const usuarioExistente = await LugarService.verificarLugar(usuarioid);
      if (!usuarioExistente) {
        return res.status(400).json({ mensaje: "El Usuario no existe" });
      }

      // Preparar datos para actualizar
      const datosActualizados = {
        categoriaid,
        usuarioid,
        descripcion,
        ubicacion,
      };

      const LugarActualizado = await LugarService.actualizarLugar(
        id,
        datosActualizados
      );
      res.json(LugarActualizado);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }

  async eliminarLugar(req, res) {
    try {
      const { id } = req.params;

      // Verificar si el Lugar existe
      const Lugar = await LugarService.buscarLugar(id);
      if (!Lugar) {
        return res.status(404).json({ mensaje: "Lugar no encontrado" });
      }

      await LugarService.eliminarLugar(id);
      res.json({ mensaje: "Lugar eliminado correctamente" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }

  async buscarLugar(req, res) {
    try {
      const { id } = req.params;
      const Lugar = await LugarService.buscarLugar(id);

      if (!Lugar) {
        return res.status(404).json({ mensaje: "Lugar no encontrado" });
      }

      res.json(Lugar);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: "Error en el servicio" });
    }
  }
}

module.exports = new LugarController();
