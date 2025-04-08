const LugarService = require("../service/lugarService");

class LugarController {
  async listarLugares(req, res) {
    try {
      const lugares = await LugarService.listarLugares();

      if (!lugares || lugares.length === 0) {
        return res.status(404).json({ mensaje: "No se encontraron lugares registrados" });
      }

      res.status(200).json(lugares);
    } catch (e) {
      res.status(500).json({ mensaje: "Error al listar lugares", error: e.message });
    }
  }

  async buscarLugar(req, res) {
    try {
      const { id } = req.params;
      const lugar = await LugarService.buscarLugar(id, true); // con relaciones

      if (!lugar) {
        return res.status(404).json({ mensaje: "Lugar no encontrado" });
      }

      res.status(200).json(lugar);
    } catch (error) {
      res.status(500).json({ mensaje: "Error al buscar el lugar", error: error.message });
    }
  }

  async crearLugar(req, res) {
    try {
      const { usuarioid, categoriaid, nombre, descripcion, ubicacion } = req.body;

      if (!usuarioid || !categoriaid || !nombre?.trim() || !descripcion?.trim() || !ubicacion?.trim()) {
        return res.status(400).json({ mensaje: "Faltan campos requeridos o contienen valores inválidos" });
      }

      const usuarioExistente = await LugarService.verificarUsuario(usuarioid);
      if (!usuarioExistente) {
        return res.status(400).json({ mensaje: "El usuario no existe" });
      }

      const categoriaExistente = await LugarService.verificarCategoria(categoriaid);
      if (!categoriaExistente) {
        return res.status(400).json({ mensaje: "La categoría no existe" });
      }

      const nuevoLugar = await LugarService.crearLugar({
        usuarioid,
        categoriaid,
        nombre,
        descripcion,
        ubicacion,
        estado: true,
      });

      res.status(201).json(nuevoLugar);
    } catch (error) {
      res.status(500).json({
        mensaje: "Error en el servicio",
        error: error.message,
      });
    }
  }

  async actualizarLugar(req, res) {
    try {
      const { id } = req.params;
      const { categoriaid, usuarioid, nombre, descripcion, ubicacion, estado } = req.body;

      const categoriaExistente = await LugarService.verificarCategoria(categoriaid);
      if (!categoriaExistente) {
        return res.status(400).json({ mensaje: "La categoría no existe" });
      }

      const usuarioExistente = await LugarService.verificarUsuario(usuarioid);
      if (!usuarioExistente) {
        return res.status(400).json({ mensaje: "El usuario no existe" });
      }

      const datosActualizados = { categoriaid, usuarioid, nombre, descripcion, ubicacion, estado };
      const lugarActualizado = await LugarService.actualizarLugar(id, datosActualizados);

      res.json(lugarActualizado);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: "Error al actualizar lugar", error: error.message });
    }
  }

  async eliminarLugar(req, res) {
    try {
      const { id } = req.params;

      const existeLugar = await LugarService.buscarLugar(id);
      if (!existeLugar) {
        return res.status(404).json({ mensaje: "Lugar no encontrado" });
      }

      await LugarService.eliminarLugar(id);
      res.json({ mensaje: "Lugar eliminado correctamente" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: "Error al eliminar lugar", error: error.message });
    }
  }

  async cambiarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      const actualizados = await LugarService.actualizarEstado(id, estado);

      if (actualizados[0] === 0) {
        const existe = await LugarService.buscarLugar(id);
        if (!existe) {
          return res.status(404).json({ mensaje: 'Lugar no encontrado' });
        }
        return res.status(200).json({ mensaje: 'El estado ya estaba igual', lugar: existe });
      }

      const lugar = await LugarService.buscarLugar(id, true);
      res.json({ mensaje: 'Estado actualizado', lugar });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: 'Error al actualizar estado', error: error.message });
    }
  }
}

module.exports = new LugarController();
